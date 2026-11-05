"""Create a root-level Replit ZIP from an explicit public-file allowlist."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = (
    '.replit', 'replit.nix', '.gitignore', '.nvmrc', 'package.json',
    'package-lock.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.mjs', 'tailwind.config.ts',
    'postcss.config.mjs', 'README.md', 'REPLIT_DEPLOYMENT.md', 'replit.md',
    'AGENTS.md', 'CLAIM_AUDIT.md', 'VERIFICATION.md', 'SCROLL_DESIGN.md', 'PEAR_V1_1_ENGINE_SPEC.md', 'V1_1_VERIFICATION.md',
    'SECURITY.md', 'CONTRIBUTING.md', 'ROADMAP.md', 'HANDSHAKE_SUBMISSION_PACKET.md', 'RELEASE_BASELINE.json', 'RELEASE_VERIFICATION.md',
    'playwright.config.ts', 'BROWSER_TESTING.md',
)
BLOCKED = {'.git', '.qa', '.next', '.cache', 'node_modules', '__pycache__', '__MACOSX',
           'private', 'raw', 'backups', 'exports', '.venv'}
BLOCKED_EXTENSIONS = {'.pyc', '.tsbuildinfo', '.pem', '.key', '.zip', '.7z', '.rar', '.tar', '.gz', '.log'}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=ROOT.parent / 'replit-deploy.zip')
args = parser.parse_args()
output = args.output.resolve()
output.parent.mkdir(parents=True, exist_ok=True)
files = [ROOT / name for name in ROOT_FILES]
for folder in ('src', 'public', 'scripts', 'tests'):
    files.extend(p for p in (ROOT / folder).rglob('*') if p.is_file() and
                 not any(part in BLOCKED or part.startswith('.') for part in p.relative_to(ROOT).parts) and
                 p.suffix.lower() not in BLOCKED_EXTENSIONS and
                 (p.suffix.lower() != '.pdf' or p == ROOT / 'public' / 'resume-public.pdf'))
files.extend((ROOT / '.github' / 'workflows').glob('*.yml'))
files = sorted(set(files), key=lambda p: p.relative_to(ROOT).as_posix())
required = {'.replit', 'package.json', 'package-lock.json', 'src/app/page.tsx',
            'src/app/api/ambassador/route.ts', 'public/resume-public.pdf'}
# Public assets are recursively allowlisted above. Fail closed if a camera or its
# reduced-motion poster is missing, rather than exporting a partially working hero.
surveillance = (
    'cam-01-soc-wall', 'cam-02-night-pedestrians',
    'cam-03-fisheye-transit', 'cam-04-spherical-grid',
)
required.update(f'public/surveillance/{name}.{ext}'
                for name in surveillance for ext in ('mp4', 'jpg'))
assert sum((ROOT / f'public/surveillance/{name}.mp4').stat().st_size
           for name in surveillance) < 12 * 1024 * 1024, 'Camera payload exceeds release budget'
assert all(p.is_file() and not p.is_symlink() and p.resolve().is_relative_to(ROOT) for p in files), 'Missing file or unsafe export path'
paths = {p.relative_to(ROOT).as_posix() for p in files}
assert required <= paths
assert all(not name.startswith('/') and '..' not in Path(name).parts for name in paths)
assert not any(name.endswith('.pdf') and name != 'public/resume-public.pdf' for name in paths)
assert not any(Path(name).name.startswith('.env') for name in paths)
entries = []
assert not any(p.exists() for p in (output, output.with_suffix('.sha256'), output.with_suffix('.manifest.json'))), 'Choose a new archive path'
with zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in files:
        name = path.relative_to(ROOT).as_posix()
        data = path.read_bytes()
        archive.writestr(name, data)
        entries.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == paths
assert output.stat().st_size < 200 * 1024 * 1024
checksum = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.sha256').write_text(f'{checksum}  {output.name}\n')
output.with_suffix('.manifest.json').write_text(json.dumps({
    'archive': output.name, 'archiveSha256': checksum, 'archiveBytes': output.stat().st_size,
    'rootLayout': 'Application files at archive root; no wrapper folder', 'files': entries,
}, indent=2) + '\n')
print(f'Exported {len(files)} public application files ({output.stat().st_size:,} bytes).')
print(f'Archive: {output}')
