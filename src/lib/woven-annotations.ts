// Hand-marked rectangles in the 384 × 216 reference grid, indexed to the woven
// frames. Only interpolate while the same subject is visible in the footage.
type Key = readonly [frame: number, left: number, top: number, right: number, bottom: number];
const landmarks: { label: string; keys: readonly Key[] }[] = [
  { label: 'Monitor_Wall', keys: [[0, 0, 14, 383, 157], [8, 0, 13, 371, 158], [15, 0, 7, 323, 151],
    [22, 0, 3, 302, 139], [29, 0, 1, 293, 131], [40, 0, 0, 282, 127]] },
  { label: 'Operator_Station', keys: [[8, 308, 132, 383, 215], [15, 278, 119, 365, 207], [22, 229, 97, 317, 179],
    [29, 216, 93, 290, 168], [40, 213, 92, 286, 164]] },
  { label: 'Billboard_Display', keys: [[55, 198, 36, 261, 119], [63, 198, 35, 260, 115], [70, 198, 34, 261, 113],
    [77, 198, 34, 260, 114], [88, 197, 32, 259, 112]] },
  { label: 'Pedestrian', keys: [[56, 114, 119, 168, 216], [63, 136, 118, 197, 216], [70, 161, 119, 211, 216],
    [77, 170, 119, 226, 216], [84, 182, 115, 224, 216], [88, 196, 119, 240, 216]] },
  { label: 'Transit_Bus', keys: [[115, 0, 51, 23, 130], [116, 0, 51, 65, 157], [117, 0, 51, 95, 160],
    [118, 0, 57, 114, 168], [119, 11, 73, 126, 144], [120, 64, 81, 132, 128],
    [121, 92, 81, 144, 119], [122, 113, 79, 151, 112]] },
  { label: 'Urban_Cab', keys: [[112, 127, 133, 202, 184], [113, 145, 132, 217, 179], [114, 154, 125, 234, 173],
    [115, 164, 121, 254, 170], [116, 178, 120, 277, 170], [117, 191, 120, 295, 172],
    [118, 206, 117, 327, 174], [119, 216, 115, 350, 181], [120, 240, 116, 383, 198],
    [121, 254, 120, 383, 215], [122, 270, 126, 383, 216], [123, 286, 137, 383, 216]] },
  { label: 'Spherical_Vehicle', keys: [[152, 165, 77, 237, 131], [166, 165, 76, 237, 131], [191, 165, 76, 237, 131]] },
];

export function annotatedBoxes(frame: number) {
  return landmarks.flatMap(({ label, keys }) => {
    if (frame < keys[0][0] || frame > keys[keys.length - 1][0]) return [];
    const upper = Math.max(1, keys.findIndex(key => key[0] >= frame));
    const from = keys[upper - 1], to = keys[upper];
    const fraction = (frame - from[0]) / (to[0] - from[0]);
    const left = from[1] + (to[1] - from[1]) * fraction;
    const top = from[2] + (to[2] - from[2]) * fraction;
    const right = from[3] + (to[3] - from[3]) * fraction;
    const bottom = from[4] + (to[4] - from[4]) * fraction;
    return [{ label, x: left / 384, y: top / 216, w: (right - left) / 384, h: (bottom - top) / 216 }];
  });
}
