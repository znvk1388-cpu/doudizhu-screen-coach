"""Stamp local script URLs with content hashes before publishing the website."""
from pathlib import Path
import hashlib
import re

DOCS = Path(__file__).resolve().parents[1] / "docs"
SCRIPTS = re.compile(r'(<script\b[^>]*\bsrc=")(\./[^"?]+\.js)(?:\?[^"]*)?(")')

def stamp_page(page):
    page = Path(page)
    source = page.read_text(encoding="utf-8-sig")
    def stamp(match):
        script = (page.parent / match[2]).resolve()
        if not script.is_relative_to(page.parent.resolve()):
            raise ValueError("Script must remain inside the page directory")
        digest = hashlib.sha256(script.read_bytes()).hexdigest()[:12]
        return match[1] + match[2] + "?v=" + digest + match[3]
    updated = SCRIPTS.sub(stamp, source)
    if updated != source:
        page.write_text(updated, encoding="utf-8", newline="\n")
        return True
    return False

if __name__ == "__main__":
    changed = sum(stamp_page(page) for page in DOCS.glob("*.html"))
    print("Script versions updated in", changed, "pages.")
