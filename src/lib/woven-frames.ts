export const WOVEN_FRAME_COUNT = 192;
export const WOVEN_ACT_LENGTH = WOVEN_FRAME_COUNT / 4;
export const WOVEN_ENTRY_FRAME = 35;
export const ACT_STARTS = [.18, .38, .58, .79, 1];

export function scrollAct(progress: number) {
  if (progress < ACT_STARTS[0]) return -1;
  return Math.min(3, ACT_STARTS.findLastIndex(start => progress >= start));
}

export function scrollFrame(progress: number) {
  const act = Math.max(0, scrollAct(progress));
  const fraction = Math.max(0, Math.min(1, (progress - ACT_STARTS[act]) / (ACT_STARTS[act + 1] - ACT_STARTS[act])));
  const first = act === 0 ? WOVEN_ENTRY_FRAME : act * WOVEN_ACT_LENGTH;
  const end = (act + 1) * WOVEN_ACT_LENGTH;
  return Math.min(WOVEN_FRAME_COUNT - 1, Math.round(first + fraction * (end - first)));
}

export function frameAct(frame: number) {
  return Math.min(3, Math.floor(frame / WOVEN_ACT_LENGTH));
}

export function wovenFramePath(frame: number) {
  return `/surveillance/woven-frames/${String(frame).padStart(3, '0')}.webp`;
}

/** Fetch near the playhead, keep compressed bytes for reverse scrubbing,
 * and cap decoded images so the stage stays usable on mobile.
 */
export function createWovenFrameCache(onSettled: () => void) {
  const bytes = new Map<number, Blob>();
  const decoded = new Map<number, ImageBitmap>();
  const loading = new Set<number>();
  const failed = new Set<number>();
  const controller = new AbortController();
  const desktop = !matchMedia('(pointer: coarse)').matches;
  const decodeLimit = desktop ? 12 : 6;
  const plates = new Map<number, ImageBitmap>();
  const failedPlates = new Set<number>();
  let plateRequest: AbortController | undefined;
  let plateTarget = -1;
  let queue: number[] = [];

  function trim() {
    const needed = new Set(queue.slice(0, decodeLimit));
    for (const [index, bitmap] of decoded) {
      if (decoded.size <= decodeLimit) break;
      if (!needed.has(index)) {
        bitmap.close();
        decoded.delete(index);
      }
    }
  }

  async function load(index: number) {
    loading.add(index);
    try {
      let blob = bytes.get(index);
      if (!blob) {
        const response = await fetch(wovenFramePath(index), { signal: controller.signal });
        if (!response.ok) throw new Error('Frame unavailable');
        blob = await response.blob();
        if (controller.signal.aborted) return;
        bytes.set(index, blob);
        while (bytes.size > 48) bytes.delete(bytes.keys().next().value!);
      }
      const bitmap = await createImageBitmap(blob);
      if (controller.signal.aborted) bitmap.close();
      else {
        decoded.set(index, bitmap);
        trim();
      }
    } catch {
      if (!controller.signal.aborted) failed.add(index);
    } finally {
      loading.delete(index);
      pump();
      if (!controller.signal.aborted) onSettled();
    }
  }

  function pump() {
    if (controller.signal.aborted || document.hidden) return;
    for (const index of queue) {
      if (loading.size >= 2) return;
      if (!decoded.has(index) && !loading.has(index) && !failed.has(index)) void load(index);
    }
  }

  function prioritize(frame: number, target: number, direction: number) {
    const first = target === frame ? [frame] : [frame, target];
    queue = [...new Set([
      ...first, frame - 1, target - 1,
      ...Array.from({ length: decodeLimit }, (_, i) => frame + (i + 1) * direction),
      ...Array.from({ length: 3 }, (_, i) => frame - (i + 1) * direction),
    ])].filter(index => index >= WOVEN_ENTRY_FRAME && index < WOVEN_FRAME_COUNT).slice(0, decodeLimit);
    pump();
  }

  function prepareEntry() {
    if (queue.length !== 1 || queue[0] !== WOVEN_ENTRY_FRAME) queue = [WOVEN_ENTRY_FRAME];
    pump();
  }

  function cancelPlate() {
    plateRequest?.abort();
    plateRequest = undefined;
    plateTarget = -1;
  }

  async function requestPlate(frame: number, isCurrent: () => boolean) {
    if (frame < WOVEN_ENTRY_FRAME || plateTarget === frame || plates.has(frame) || failedPlates.has(frame)) return;
    cancelPlate();
    plateRequest = new AbortController();
    const request = plateRequest;
    plateTarget = frame;
    try {
      const response = await fetch(`/surveillance/woven-4k/${String(frame).padStart(3, '0')}.webp`, { signal: request.signal });
      if (!response.ok) throw new Error('Plate unavailable');
      const bitmap = await createImageBitmap(await response.blob());
      if (request.signal.aborted || controller.signal.aborted || !isCurrent()) { bitmap.close(); return; }
      plates.set(frame, bitmap);
      for (const [index, old] of plates) {
        if (plates.size <= (desktop ? 2 : 1)) break;
        if (index !== frame) { old.close(); plates.delete(index); }
      }
      onSettled();
    } catch {
      if (!request.signal.aborted && !controller.signal.aborted && isCurrent()) { failedPlates.add(frame); onSettled(); }
      // Keep the exact HD frame; never switch to a nearby 4K anchor.
    } finally {
      if (plateRequest === request) cancelPlate();
    }
  }

  function nearest(frame: number) {
    if (decoded.has(frame)) return frame;
    let best: number | undefined;
    for (const index of decoded.keys()) {
      if (frameAct(index) === frameAct(frame) && (best === undefined || Math.abs(index - frame) < Math.abs(best - frame))) best = index;
    }
    return best;
  }

  return {
    prioritize, nearest, requestPlate, cancelPlate, plateFailed: (index: number) => failedPlates.has(index), plate: (index: number) => plates.get(index),
    prepareEntry,
    get: (index: number) => decoded.get(index),
    failed: (index: number) => failed.has(index),
    retry() { failed.clear(); failedPlates.clear(); cancelPlate(); pump(); },
    dispose() {
      controller.abort();
      cancelPlate();
      for (const bitmap of plates.values()) bitmap.close();
      plates.clear();
      for (const bitmap of decoded.values()) bitmap.close();
      decoded.clear();
      bytes.clear();
    },
  };
}
