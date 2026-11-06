"""Build the shared four-act timeline from the original surveillance clips.

Requires FFmpeg, FFprobe and Pillow. The browser uses the WebP frames directly.
The companion H.264 reel is encoded from those same frames.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "surveillance"
FEEDS = ("cam-01-soc-wall", "cam-02-night-pedestrians",
         "cam-03-fisheye-transit", "cam-04-spherical-grid")
WIDTH, HEIGHT = 768, 432
ACT_FRAMES, HALF_BLEND, FPS = 48, 7, 12
FRAME_COUNT = len(FEEDS) * ACT_FRAMES


def run(*args):
    return subprocess.check_output(args)


def decode(clip, count):
    source = json.loads(run("ffprobe", "-v", "error", "-select_streams", "v:0",
                            "-show_entries", "stream=duration", "-of", "json", str(clip)))
    duration = float(source["streams"][0]["duration"])
    # Include a little tail padding to absorb timestamps rounded by the source time base.
    filters = (f"tpad=stop_mode=clone:stop_duration=1,fps={count / duration:.10f},"
               f"scale={WIDTH}:{HEIGHT}:flags=lanczos:in_color_matrix=bt709")
    pixels = run("ffmpeg", "-v", "error", "-threads", "2", "-filter_threads", "2",
                 "-i", str(clip), "-vf", filters, "-frames:v", str(count),
                 "-an", "-threads", "2", "-pix_fmt", "rgb24", "-f", "rawvideo", "-")
    stride = WIDTH * HEIGHT * 3
    if len(pixels) != count * stride:
        raise ValueError(f"Incorrect frame count in {clip.name}")
    return [Image.frombytes("RGB", (WIDTH, HEIGHT), pixels[i:i + stride])
            for i in range(0, len(pixels), stride)]


def zoom(image, scale):
    width, height = WIDTH / scale, HEIGHT / scale
    return image.resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC,
                        ((WIDTH - width) / 2, (HEIGHT - height) / 2,
                         (WIDTH + width) / 2, (HEIGHT + height) / 2))


def main():
    starts = [max(0, act * ACT_FRAMES - HALF_BLEND) for act in range(len(FEEDS))]
    ends = [min(FRAME_COUNT, (act + 1) * ACT_FRAMES + HALF_BLEND) for act in range(len(FEEDS))]
    footage = [decode(ROOT / f"{name}.mp4", ends[i] - starts[i]) for i, name in enumerate(FEEDS)]
    with TemporaryDirectory(prefix="woven-") as temp:
        build = Path(temp)
        for frame in range(FRAME_COUNT):
            active = [i for i, start in enumerate(starts) if start <= frame < ends[i]]
            left = active[0]
            image = footage[left][frame - starts[left]]
            if len(active) == 2:
                right = active[1]
                fraction = (frame - starts[right]) / (2 * HALF_BLEND - 1)
                blend = fraction * fraction * (3 - 2 * fraction)
                image = Image.blend(zoom(image, 1 + .085 * blend),
                                    zoom(footage[right][frame - starts[right]], 1 + .085 * (1 - blend)),
                                    blend)
            image.save(build / f"{frame:03}.webp", quality=80, method=4)
        reel = build / "woven-scroll-reel.mp4"
        run("ffmpeg", "-v", "error", "-framerate", str(FPS), "-i", str(build / "%03d.webp"),
            "-frames:v", str(FRAME_COUNT), "-vf", "scale=out_color_matrix=bt709",
            "-c:v", "libx264", "-threads", "4", "-preset", "medium", "-crf", "20",
            "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_trc", "bt709",
            "-color_primaries", "bt709", "-an", "-map_metadata", "-1", "-movflags", "+faststart",
            str(reel))
        destination = ROOT / "woven-frames"
        destination.mkdir(exist_ok=True)
        for path in build.glob("*.webp"):
            (destination / path.name).write_bytes(path.read_bytes())
        (ROOT / reel.name).write_bytes(reel.read_bytes())
    print(f"Built {FRAME_COUNT} frames and a {FRAME_COUNT / FPS:g}s woven reel.")


if __name__ == "__main__":
    main()
