"""Build the self-contained verification download from the current tools."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "docs/downloads/apk-check-tools.zip"
MEMBERS = ["verify-apk.ps1", "verify-apk.bat", "releases.json", "README.md"]

def build():
    DEST.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(DEST, "w", ZIP_DEFLATED) as archive:
        for name in MEMBERS:
            archive.write(ROOT / "tools" / name, name)
    with ZipFile(DEST) as archive:
        assert archive.testzip() is None
        for name in MEMBERS:
            assert archive.read(name) == (ROOT / "tools" / name).read_bytes()
    print("Built and verified:", DEST)

if __name__ == "__main__":
    build()
