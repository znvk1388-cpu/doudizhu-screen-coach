import hashlib
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("stamp_web_assets", ROOT / "tools/stamp-web-assets.py")
ASSETS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ASSETS)

class WebAssetVersionTests(unittest.TestCase):
    def setUp(self):
        scratch = Path(os.environ.get("DOUDIZHU_TEST_TMP", ROOT / "test-temp"))
        scratch.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=scratch)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_changed_script_gets_new_url_and_repeating_is_stable(self):
        page = self.root / "index.html"
        script = self.root / "ui.js"
        page.write_text('<script src="./ui.js"></script>', encoding="utf-8")
        script.write_text("version-one", encoding="utf-8")
        ASSETS.stamp_page(page)
        first = page.read_bytes()
        self.assertIn(hashlib.sha256(script.read_bytes()).hexdigest()[:12].encode(), first)
        self.assertFalse(ASSETS.stamp_page(page))
        self.assertEqual(first, page.read_bytes())
        script.write_text("version-two", encoding="utf-8")
        ASSETS.stamp_page(page)
        self.assertNotEqual(first, page.read_bytes())
        self.assertIn(hashlib.sha256(script.read_bytes()).hexdigest()[:12].encode(), page.read_bytes())

    def test_external_urls_are_preserved_and_missing_local_scripts_fail(self):
        page = self.root / "index.html"
        original = '<script src="https://example.org/ui.js"></script>'
        page.write_text(original, encoding="utf-8")
        self.assertFalse(ASSETS.stamp_page(page))
        self.assertEqual(page.read_text(encoding="utf-8"), original)
        page.write_text('<script src="./missing.js"></script>', encoding="utf-8")
        with self.assertRaises(FileNotFoundError):
            ASSETS.stamp_page(page)

    def test_parent_directory_reference_is_rejected(self):
        page = self.root / "index.html"
        page.write_text('<script src="./../outside.js"></script>', encoding="utf-8")
        with self.assertRaises(ValueError):
            ASSETS.stamp_page(page)
