"""Run with python -m unittest discover -s tests -p test_*.py."""
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CERT = "3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC"

class DownloadVerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        scratch = Path(os.environ.get("DOUDIZHU_TEST_TMP", ROOT / "test-temp"))
        scratch.mkdir(parents=True, exist_ok=True)
        cls.temp = tempfile.TemporaryDirectory(dir=scratch)
        cls.fixture = Path(cls.temp.name) / "unsigned fixture.apk"
        with zipfile.ZipFile(cls.fixture, "w") as z:
            z.writestr("AndroidManifest.xml", "not an installable Android manifest")
            z.writestr("padding.txt", "fixture only " * 64)
        cls.sha = hashlib.sha256(cls.fixture.read_bytes()).hexdigest()

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def verify(self, path, *options):
        env = dict(os.environ)
        for key in ("ANDROID_HOME", "ANDROID_SDK_ROOT", "JAVA_HOME", "PSMODULEPATH"):
            env.pop(key, None)
        return subprocess.run(
            [os.environ.get("DOUDIZHU_TEST_POWERSHELL","powershell.exe"), "-NoProfile", "-ExecutionPolicy", "Bypass",
             "-File", str(ROOT / "tools/verify-apk.ps1"), "-Path", str(path), *options],
            text=True, capture_output=True, env=env, errors="replace")

    def test_unknown_file_cannot_pass_without_expected_hash(self):
        result = self.verify(self.fixture)
        self.assertNotEqual(result.returncode, 0, result.stdout)

    def test_requested_certificate_cannot_succeed_without_signature_verification(self):
        result = self.verify(self.fixture, "-ExpectedSha256", self.sha, "-TrustedCertSha256", CERT)
        self.assertNotEqual(result.returncode, 0, result.stdout)

    def test_wrong_hash_fails(self):
        self.assertNotEqual(self.verify(self.fixture, "-ExpectedSha256", "0" * 64).returncode, 0)

    def test_explicit_hash_is_labelled_as_file_integrity_only(self):
        result = self.verify(self.fixture, "-ExpectedSha256", self.sha)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("FILE_HASH_MATCH", result.stdout)
        self.assertIn("SIGNATURE_NOT_CHECKED", result.stdout)

    @unittest.skipUnless(os.environ.get("DOUDIZHU_TEST_APK"), "Set DOUDIZHU_TEST_APK to the published APK")
    def test_published_apk_uses_manifest_even_if_renamed(self):
        result = self.verify(Path(os.environ["DOUDIZHU_TEST_APK"]))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("FILE_HASH_MATCH", result.stdout)

    @unittest.skipUnless(os.environ.get("DOUDIZHU_TEST_APKSIGNER") and os.environ.get("DOUDIZHU_TEST_JAVA_HOME"),
                         "Set SDK tool and Java paths to verify signatures")
    def test_official_tool_rejects_unsigned_file(self):
        result = self.verify(self.fixture, "-ExpectedSha256", self.sha, "-ApkSigner",
                             os.environ["DOUDIZHU_TEST_APKSIGNER"], "-JavaHome", os.environ["DOUDIZHU_TEST_JAVA_HOME"])
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn("APK_SIGNATURE_CHECK_FAILED", result.stdout)

    @unittest.skipUnless(os.environ.get("DOUDIZHU_TEST_APK") and os.environ.get("DOUDIZHU_TEST_APKSIGNER"),
                         "Set published APK and official SDK tool paths")
    def test_official_tool_accepts_published_signature(self):
        result=self.verify(Path(os.environ["DOUDIZHU_TEST_APK"]), "-ApkSigner",
                           os.environ["DOUDIZHU_TEST_APKSIGNER"], "-JavaHome", os.environ["DOUDIZHU_TEST_JAVA_HOME"])
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
        self.assertIn("APK_SIGNATURE_VERIFIED",result.stdout)
        self.assertIn(CERT,result.stdout)

    @unittest.skipUnless(os.environ.get("DOUDIZHU_TEST_APK") and os.environ.get("DOUDIZHU_TEST_APKSIGNER"),
                         "Set published APK and official SDK tool paths")
    def test_wrong_trusted_certificate_fails(self):
        result=self.verify(Path(os.environ["DOUDIZHU_TEST_APK"]), "-ApkSigner",
                           os.environ["DOUDIZHU_TEST_APKSIGNER"], "-JavaHome", os.environ["DOUDIZHU_TEST_JAVA_HOME"],
                           "-TrustedCertSha256","0"*64)
        self.assertEqual(result.returncode,1,result.stdout+result.stderr)
        self.assertIn("CERTIFICATE_MISMATCH",result.stdout)

if __name__ == "__main__":
    unittest.main()
