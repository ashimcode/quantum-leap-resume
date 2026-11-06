export const WOVEN_FRAME_COUNT = 192;
export const WOVEN_ACT_LENGTH = WOVEN_FRAME_COUNT / 4;

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
  let queue: number[] = [];

  function trim() {
    const needed = new Set(queue.slice(0, 24));
    for (const [index, bitmap] of decoded) {
      if (decoded.size <= 32) break;
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
      if (loading.size >= 4) return;
      if (!decoded.has(index) && !loading.has(index) && !failed.has(index)) void load(index);
    }
  }

  function prioritize(frame: number, target: number, direction: number) {
    const first = target === frame ? [frame] : [frame, target];
    queue = [...new Set([
      ...first, frame - 1, target - 1,
      ...Array.from({ length: 12 }, (_, i) => frame + (i + 1) * direction),
      ...Array.from({ length: 5 }, (_, i) => frame - (i + 1) * direction),
    ])].filter(index => index >= 0 && index < WOVEN_FRAME_COUNT);
    pump();
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
    prioritize, nearest, get: (index: number) => decoded.get(index),
    failed: (index: number) => failed.has(index),
    retry() { failed.clear(); pump(); },
    dispose() {
      controller.abort();
      for (const bitmap of decoded.values()) bitmap.close();
      decoded.clear();
      bytes.clear();
    },
  };
}
