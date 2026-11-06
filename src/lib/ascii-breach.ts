type Point = { x: number; y: number };
type Pointer = Point & { active: boolean };

const GLYPHS = '.:+*#%@';
const PALETTE = ['#ff1e38', '#ff4d5e', '#d5263d', '#b91c2f'];

export function smoothStep(start: number, end: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

function cellSeed(column: number, row: number) {
  const seed = Math.imul(column, 0x1f123bb5) ^ Math.imul(row, 0x5f356495);
  return Math.imul(seed ^ (seed >>> 15), 0x45d9f3b) >>> 0;
}

/** The transparent layer paints only glyphs. Scroll sets their envelope,
 * while time changes the brightness of individual cells.
 */
export function createBreachRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  return {
    draw(progress: number, time: number, center: Point, screenHeight: number, pointer: Pointer, width: number, height: number) {
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const fade = 1 - smoothStep(.14, .18, progress);
      if (fade <= 0) return;

      const cell = Math.min(16, Math.max(12, width / 140));
      const spread = smoothStep(.01, .16, progress);
      const proximity = pointer.active ? 1 - smoothStep(0, 240, Math.hypot(pointer.x - center.x, pointer.y - center.y)) : 0;
      const initialRadius = screenHeight * (.35 + .015 * proximity);
      const radius = initialRadius + (Math.hypot(width, height) * .53 - initialRadius) * spread;
      const hollow = smoothStep(.08, .115, progress);
      const inner = radius * .68 * hollow;
      const feather = Math.max(cell * 1.5, radius * .16);

      ctx.font = `bold ${Math.round(cell * .72)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const firstRow = Math.ceil(Math.max(-radius, -center.y) / cell);
      const lastRow = Math.floor(Math.min(radius, height - center.y) / cell);
      const firstColumn = Math.ceil(Math.max(-radius, -center.x) / cell);
      const lastColumn = Math.floor(Math.min(radius, width - center.x) / cell);
      for (let row = firstRow; row <= lastRow; row++) {
        for (let column = firstColumn; column <= lastColumn; column++) {
          const distance = Math.hypot(column, row) * cell;
          if (distance >= radius || distance < inner) continue;
          const seed = cellSeed(column, row);
          if ((seed & 255) > 209) continue;
          const edge = 1 - smoothStep(radius * (.5 + .31 * hollow), radius, distance);
          const innerEdge = 1 - hollow * (1 - smoothStep(inner, inner + feather, distance));
          const phase = ((seed >>> 8) & 255) / 27;
          const pulse = .74 + .19 * Math.sin(time * 2.6 + phase);
          ctx.globalAlpha = fade * edge * innerEdge * pulse * (.60 + proximity * .14);
          ctx.fillStyle = PALETTE[(seed >>> 16) % PALETTE.length];
          ctx.fillText(GLYPHS[(seed >>> 20) % GLYPHS.length], center.x + column * cell, center.y + row * cell);
        }
      }
      ctx.globalAlpha = 1;
    },
  };
}
