"""Build matched HD/4K woven frames directly from the original H.264 masters.

Requires FFmpeg, FFprobe, NumPy and opencv-python-headless.
Pass --masters to the folder containing the four original downloads.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import argparse
import json
import subprocess

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "public" / "surveillance"
MASTERS = (
    "16477662_1920_1080_25fps.mp4", "16894645_3840_2160_50fps.mp4",
    "15179427_3840_2160_60fps.mp4", "15389059_3840_2160_30fps.mp4",
)
ACT_FRAMES, HALF_BLEND, FPS = 48, 7, 12
FRAME_COUNT = len(MASTERS) * ACT_FRAMES


def run(*args):
    return subprocess.check_output(args)


def sharpen(image):
    # Sharpen luminance only, preserving the two color sources' chroma.
    ycc = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    light = ycc[:, :, 0]
    ycc[:, :, 0] = cv2.addWeighted(light, 1.3, cv2.GaussianBlur(light, (0, 0), .8), -.3, 0)
    return cv2.cvtColor(ycc, cv2.COLOR_YCrCb2BGR)


def decode(clip, count, folder, monochrome):
    metadata = json.loads(run("ffprobe", "-v", "error", "-select_streams", "v:0",
                              "-show_entries", "stream=width,height,duration", "-of", "json", str(clip)))
    source = metadata["streams"][0]
    width, height = source["width"], source["height"]
    duration = float(source["duration"])
    filters = f"tpad=stop_mode=clone:stop_duration=1,fps={count / duration:.10f}"
    process = subprocess.Popen(["ffmpeg", "-v", "error", "-threads", "2", "-filter_threads", "2",
                                "-i", str(clip), "-vf", filters, "-frames:v", str(count),
                                "-an", "-threads", "2", "-pix_fmt", "bgr24", "-f", "rawvideo", "-"],
                               stdout=subprocess.PIPE)
    try:
        for index in range(count):
            raw = process.stdout.read(width * height * 3)
            if len(raw) != width * height * 3:
                raise ValueError(f"Missing source frame in {clip.name}")
            image = np.frombuffer(raw, np.uint8).reshape(height, width, 3)
            if (width, height) != (3840, 2160):
                image = cv2.resize(image, (3840, 2160), interpolation=cv2.INTER_LANCZOS4)
            if monochrome:
                image = cv2.cvtColor(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
            image = sharpen(image)
            if not cv2.imwrite(str(folder / f"{index:03}.png"), image, [cv2.IMWRITE_PNG_COMPRESSION, 1]):
                raise ValueError("Could not stage source frame")
        if process.wait() != 0:
            raise ValueError(f"Decoder failed for {clip.name}")
    finally:
        process.stdout.close()
        if process.poll() is None:
            process.kill()
        process.wait()


def zoom(image, scale):
    height, width = image.shape[:2]
    transform = np.array([[scale, 0, width * (1 - scale) / 2],
                          [0, scale, height * (1 - scale) / 2]], dtype=np.float32)
    return cv2.warpAffine(image, transform, (width, height), flags=cv2.INTER_LANCZOS4,
                          borderMode=cv2.BORDER_REFLECT_101)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--masters", type=Path, default=Path.home() / "Downloads")
    args = parser.parse_args()
    sources = [args.masters / name for name in MASTERS]
    assert all(path.is_file() for path in sources), "All four master files are required"
    cv2.setNumThreads(4)
    starts = [max(0, act * ACT_FRAMES - HALF_BLEND) for act in range(len(MASTERS))]
    ends = [min(FRAME_COUNT, (act + 1) * ACT_FRAMES + HALF_BLEND) for act in range(len(MASTERS))]
    with TemporaryDirectory(prefix="woven-4k-") as temp:
        build = Path(temp)
        folders = []
        for act, source in enumerate(sources):
            folder = build / str(act)
            folder.mkdir()
            decode(source, ends[act] - starts[act], folder, act >= 2)
            folders.append(folder)
            print(f"Decoded master {act + 1} at 3840 x 2160", flush=True)
        for tier in ("woven-frames", "woven-4k"):
            (build / tier).mkdir()
        for frame in range(FRAME_COUNT):
            active = [i for i, start in enumerate(starts) if start <= frame < ends[i]]
            left = active[0]
            image = cv2.imread(str(folders[left] / f"{frame - starts[left]:03}.png"))
            if len(active) == 2:
                right = active[1]
                fraction = (frame - starts[right]) / (2 * HALF_BLEND - 1)
                blend = fraction * fraction * (3 - 2 * fraction)
                next_image = cv2.imread(str(folders[right] / f"{frame - starts[right]:03}.png"))
                image = cv2.addWeighted(zoom(image, 1 + .085 * blend), 1 - blend,
                                       zoom(next_image, 1 + .085 * (1 - blend)), blend, 0)
            for tier, size in (("woven-frames", (1920, 1080)), ("woven-4k", (3840, 2160))):
                output = image if size[0] == 3840 else cv2.resize(image, size, interpolation=cv2.INTER_LANCZOS4)
                ok, encoded = cv2.imencode(".webp", output, [cv2.IMWRITE_WEBP_QUALITY, 92])
                assert ok and bytes(encoded[:16])[8:16] == b"WEBPVP8 ", "Unexpected WebP container"
                (build / tier / f"{frame:03}.webp").write_bytes(encoded)
            if frame % 24 == 0:
                print(f"Encoded matched frame {frame + 1}/{FRAME_COUNT}", flush=True)
        reel = build / "woven-scroll-reel.mp4"
        run("ffmpeg", "-v", "error", "-framerate", str(FPS), "-i", str(build / "woven-frames/%03d.webp"),
            "-frames:v", str(FRAME_COUNT), "-c:v", "libx264", "-threads", "4", "-preset", "medium",
            "-crf", "20", "-pix_fmt", "yuv420p", "-an", "-map_metadata", "-1", "-movflags", "+faststart", str(reel))
        for tier in ("woven-frames", "woven-4k"):
            (ROOT / tier).mkdir(exist_ok=True)
            for path in (build / tier).glob("*.webp"):
                (ROOT / tier / path.name).write_bytes(path.read_bytes())
        (ROOT / reel.name).write_bytes(reel.read_bytes())
    print(f"Built {FRAME_COUNT} matched HD/4K pairs.", flush=True)


if __name__ == "__main__":
    main()
