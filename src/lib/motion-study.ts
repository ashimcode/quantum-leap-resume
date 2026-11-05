// Small, local frame analysis for the visual study. Coordinates are in sample pixels.
export const SAMPLE_WIDTH = 128;
export const SAMPLE_HEIGHT = 72;
export type MotionBox = { x: number; y: number; w: number; h: number; score: number };
export type FeaturePoint = { x: number; y: number; strength: number };

export function inspectFrame(luma: Uint8Array, previous?: Uint8Array) {
  const w = SAMPLE_WIDTH, h = SAMPLE_HEIGHT;
  const points: FeaturePoint[] = [];
  for (let y = 2; y < h - 2; y += 2) {
    for (let x = 2; x < w - 2; x += 2) {
      const i = y * w + x;
      const gx = Math.abs(luma[i + 1] - luma[i - 1]);
      const gy = Math.abs(luma[i + w] - luma[i - w]);
      const strength = Math.min(gx, gy) * 2 + Math.max(gx, gy) * .25;
      if (strength >= 24) points.push({ x: x / w, y: y / h, strength });
    }
  }
  points.sort((a, b) => b.strength - a.strength);
  const keypoints: FeaturePoint[] = [];
  for (const point of points) {
    if (keypoints.every(old => Math.hypot((old.x - point.x) * w, (old.y - point.y) * h) > 6)) keypoints.push(point);
    if (keypoints.length === 32) break;
  }
  if (!previous) return { keypoints, boxes: [] as MotionBox[] };

  // Estimate the dominant camera translation. Clipping each pixel's error
  // keeps a few foreground movers from steering the background alignment.
  let best = Infinity, dx = 0, dy = 0;
  for (let sy = -3; sy <= 3; sy++) {
    for (let sx = -4; sx <= 4; sx++) {
      let error = (Math.abs(sx) + Math.abs(sy)) * 6;
      for (let y = 5; y < h - 5; y += 4) {
        for (let x = 5; x < w - 5; x += 4) {
          error += Math.min(40, Math.abs(luma[y * w + x] - previous[(y + sy) * w + x + sx]));
        }
      }
      if (error < best) { best = error; dx = sx; dy = sy; }
    }
  }

  const delta = new Uint8Array(w * h);
  const histogram = new Uint16Array(256);
  let samples = 0;
  for (let y = 5; y < h - 5; y++) {
    for (let x = 5; x < w - 5; x++) {
      const i = y * w + x;
      const value = Math.abs(luma[i] - previous[(y + dy) * w + x + dx]);
      delta[i] = value;
      histogram[value]++;
      samples++;
    }
  }
  let median = 0, total = histogram[0];
  while (total < samples / 2) total += histogram[++median];
  const threshold = Math.max(17, Math.min(75, median * 2.8 + 10));
  if (median > 34) return { keypoints, boxes: [] as MotionBox[] };

  // Join adjacent moving edges, then measure the original support pixels
  // inside each component so dilation never inflates the drawn bounds.
  const mask = new Uint8Array(w * h);
  for (let y = 5; y < h - 5; y++) {
    for (let x = 5; x < w - 5; x++) {
      const i = y * w + x;
      if (delta[i] < threshold) continue;
      for (let oy = -2; oy <= 2; oy++) {
        for (let ox = -2; ox <= 2; ox++) mask[i + oy * w + ox] = 1;
      }
    }
  }
  const queue = new Int32Array(w * h);
  const boxes: MotionBox[] = [];
  for (let index = 0; index < mask.length; index++) {
    if (!mask[index]) continue;
    let head = 0, tail = 1, count = 0, strength = 0;
    let left = w, right = 0, top = h, bottom = 0;
    mask[index] = 0;
    queue[0] = index;
    while (head < tail) {
      const i = queue[head++];
      if (delta[i] >= threshold) {
        const x = i % w, y = Math.floor(i / w);
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
        count++; strength += delta[i];
      }
      for (const next of [i - 1, i + 1, i - w, i + w]) {
        if (mask[next] !== 1) continue;
        mask[next] = 0;
        queue[tail++] = next;
      }
    }
    const bw = right - left + 3, bh = bottom - top + 3;
    const area = bw * bh;
    if (count < 18 || bw < 6 || bh < 5 || area > w * h * .39 || count / area < .09) continue;
    const score = Math.min(99, Math.max(51, Math.round(51 + count / area * 36 + (strength / count - threshold) * .32)));
    boxes.push({ x: (left - 1) / w, y: (top - 1) / h, w: bw / w, h: bh / h, score });
  }
  boxes.sort((a, b) => b.score - a.score);
  return { keypoints, boxes: boxes.slice(0, 6) };
}
