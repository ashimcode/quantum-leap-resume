type Pointer = { x: number; y: number; active: boolean };

export const BREACH_PALETTES = [
  { name: 'Crimson Breach', core: '#ff2a3c', mid: '#ff5263', outer: '#991b1b', glow: '#120103' },
  { name: 'Matrix Emerald', core: '#10b981', mid: '#34d399', outer: '#065f46', glow: '#010d09' },
  { name: 'Electric Cyan', core: '#06b6d4', mid: '#38bdf8', outer: '#155e75', glow: '#000d0f' },
  { name: 'Ultraviolet Pulse', core: '#d946ef', mid: '#a855f7', outer: '#6b21a8', glow: '#100511' },
  { name: 'Solar Amber', core: '#f59e0b', mid: '#fbbf24', outer: '#92400e', glow: '#120c01' },
  { name: 'Acid Lime', core: '#a3e635', mid: '#bef264', outer: '#3f6212', glow: '#0b1002' },
] as const;
export type BreachPalette = (typeof BREACH_PALETTES)[number];

const vertex = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const fragment = `
precision highp float;
uniform vec2 resolution, center, pointer;
uniform float progress, time, proximity, cellSize;
uniform vec3 coreColor, midColor, outerColor, glowColor;
uniform sampler2D glyphs;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.98, 78.23))) * 4375.85); }
float bayer(vec2 p) {
  vec2 a = mod(floor(p), 2.0);
  vec2 b = mod(floor(p / 2.0), 2.0);
  return (a.x * 2.0 + a.y * 3.0 - a.x * a.y * 4.0
    + (b.x * 2.0 + b.y * 3.0 - b.x * b.y * 4.0) / 4.0) / 4.0;
}
void main() {
  vec2 point = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
  vec2 cell = floor(point / cellSize);
  vec2 at = (cell + .5) * cellSize;
  vec2 delta = at - center;
  float distance = length(delta);
  float diagonal = length(resolution);
  float spread = smoothstep(.01, .13, progress);
  float radius = mix(resolution.y * .075, diagonal * 1.25, spread);
  float pulse = 1.0 + .035 * sin(time * 2.4) + .025 * proximity;
  float rim = 1.0 - smoothstep(radius * .75, radius * pulse, distance);
  float angle = atan(delta.y, delta.x);
  float ray = pow(max(0.0, sin(angle * 19.0 + time * .28)), 18.0);
  float rays = ray * exp(-distance / max(1.0, radius * 1.6)) * .28;
  float wave = .5 + .5 * sin(distance / max(radius, 1.0) * 15.0 - time * 2.2 + sin(angle * 7.0 + time));
  float light = clamp(rim * (.4 + .5 * wave) + rays, 0.0, 1.0);
  light *= 1.0 - .18 * bayer(cell);
  float glyph = floor(clamp(light + hash(cell) * .16, 0.0, .999) * 9.0);
  vec2 local = fract(point / cellSize);
  float ink = texture2D(glyphs, vec2((glyph + local.x) / 9.0, local.y)).a;
  float speck = step(.83, hash(cell + floor(time * 5.0))) * step(bayer(cell), light) * .15;
  vec3 breachColor = mix(outerColor, coreColor, wave);
  breachColor = mix(breachColor, midColor, pow(light, 4.0));
  float opacity = clamp((ink * light + speck * rim) * 1.35 + light * .13, 0.0, .94);
  vec3 color = breachColor;
  float storm = smoothstep(.055, .12, progress);
  // The dark bed follows the selected palette as the glyph front consumes the room.
  color = mix(color, mix(glowColor, breachColor, ink * light), storm);
  opacity = mix(opacity, .99, storm);
  float aperture = smoothstep(.14, .18, progress) * diagonal;
  float outside = smoothstep(aperture - cellSize * 2.0, aperture + cellSize * 2.0, distance);
  opacity *= progress > .14 ? outside : 1.0;
  gl_FragColor = vec4(color, opacity);
}`;

/** The only autonomous animation in the intro. The room has a separate buffer. */
export function createBreachRenderer(canvas: HTMLCanvasElement, palette: BreachPalette = BREACH_PALETTES[0]) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false });
  if (!gl) return null;
  function shader(kind: number, source: string) {
    const result = gl!.createShader(kind)!;
    gl!.shaderSource(result, source);
    gl!.compileShader(result);
    if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) {
      gl!.deleteShader(result);
      return null;
    }
    return result;
  }
  const vert = shader(gl.VERTEX_SHADER, vertex), frag = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vert || !frag) { if (vert) gl.deleteShader(vert); if (frag) gl.deleteShader(frag); return null; }
  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
  gl.useProgram(program);
  for (const shade of ['core', 'mid', 'outer', 'glow'] as const) {
    const channels = [1, 3, 5].map(offset => parseInt(palette[shade].slice(offset, offset + 2), 16) / 255);
    gl.uniform3f(gl.getUniformLocation(program, `${shade}Color`), channels[0], channels[1], channels[2]);
  }
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const atlas = document.createElement('canvas');
  atlas.width = 288;
  atlas.height = 32;
  const ctx = atlas.getContext('2d')!;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  [...'.:-=+*%#@'].forEach((char, index) => ctx.fillText(char, index * 32 + 16, 16));
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uniform = Object.fromEntries(['resolution','center','pointer','progress','time','proximity','cellSize'].map(name => [name, gl.getUniformLocation(program, name)]));
  return {
    draw(progress: number, time: number, center: { x: number; y: number }, pointer: Pointer, scale: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniform.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniform.center, center.x * scale, center.y * scale);
      gl.uniform2f(uniform.pointer, pointer.x * scale, pointer.y * scale);
      gl.uniform1f(uniform.progress, progress);
      gl.uniform1f(uniform.time, time);
      gl.uniform1f(uniform.proximity, pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - center.x, pointer.y - center.y) / 280) : 0);
      gl.uniform1f(uniform.cellSize, Math.max(7 * scale, canvas.width / 190));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    dispose() { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program); },
  };
}
