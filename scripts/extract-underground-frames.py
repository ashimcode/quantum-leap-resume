"""Rebuild 120 public frames from the candidate-supplied film; no private metadata."""
import argparse
import json
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'public' / 'underground-frames')
args = parser.parse_args()
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(args.source)]))
duration = float(probe['format']['duration']) - 1.8
assert duration > 0
args.output.mkdir(parents=True, exist_ok=True)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.8', '-i', str(args.source),
                '-vf', f'crop=450:606:0:100,fps={120/duration:.10f},scale=960:-2:flags=lanczos',
                '-frames:v', '120', '-start_number', '0', '-q:v', '4', '-map_metadata', '-1',
                str(args.output / 'frame-%03d.jpg')], check=True)
frames = sorted(args.output.glob('frame-*.jpg'))
assert len(frames) == 120, f'Expected 120 frames; found {len(frames)}'
print(f'{len(frames)} frames, {sum(p.stat().st_size for p in frames):,} compressed bytes')
