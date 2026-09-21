"""
Integration & Unit Tests for AgriN MVP 3 (Crop Disease Diagnosis Endpoint)
"""

import sys
import os
import unittest
import json
import io
import base64
from PIL import Image

# Add backend root to path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from engines.disease_diagnosis import diagnosis_engine


def create_test_image_bytes(color=(34, 139, 34), width=100, height=100, format="JPEG") -> bytes:
    """Helper to generate in-memory synthetic image bytes."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


class TestDiseaseDiagnosis(unittest.TestCase):
    """Test suite for YOLOv8 disease diagnosis engine and API."""

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_direct_engine_synthetic_green_leaf(self):
        img_bytes = create_test_image_bytes(color=(40, 160, 40))
        res = diagnosis_engine.diagnose_image(img_bytes, crop_name="Groundnut")
        self.assertEqual(res["status"], "success")
        self.assertIn("primary_diagnosis", res)
        self.assertIn("organic_treatment_plan", res)
        self.assertGreater(len(res["organic_treatment_plan"]), 0)

    def test_direct_engine_sample_leaf_if_exists(self):
        sample_path = os.path.abspath(os.path.join(BACKEND_DIR, "..", "..", "src", "assets", "sample_leaf.jpg"))
        if os.path.exists(sample_path):
            res = diagnosis_engine.diagnose_image(sample_path, crop_name="Groundnut")
            self.assertEqual(res["status"], "success")
            self.assertIn("primary_diagnosis", res)
            self.assertIn("confidence", res["primary_diagnosis"])

    def test_get_diagnose_docs(self):
        res = self.client.get("/diagnose")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("supported_input_methods", data)
        self.assertIn("supported_pathologies", data)

    def test_post_diagnose_empty_body(self):
        res = self.client.post("/diagnose")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()["status"], "error")

    def test_post_diagnose_multipart_upload(self):
        img_bytes = create_test_image_bytes()
        data = {
            "image": (io.BytesIO(img_bytes), "test_leaf.jpg"),
            "crop_name": "Groundnut"
        }
        res = self.client.post(
            "/diagnose",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(res.status_code, 200)
        payload = res.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertEqual(payload["version"], "3.0.0-mvp3")
        self.assertIn("primary_diagnosis", payload)
        self.assertIn("organic_treatment_plan", payload)
        self.assertIn("regenerative_prevention", payload)

    def test_post_diagnose_base64_payload(self):
        img_bytes = create_test_image_bytes()
        b64_str = base64.b64encode(img_bytes).decode("utf-8")
        payload = {
            "image_base64": f"data:image/jpeg;base64,{b64_str}",
            "crop_name": "Tomato"
        }
        res = self.client.post(
            "/diagnose",
            json=payload
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("primary_diagnosis", data)

    def test_invalid_extension_upload(self):
        fake_bytes = b"not an image"
        data = {
            "image": (io.BytesIO(fake_bytes), "malicious.exe")
        }
        res = self.client.post(
            "/diagnose",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()["error_code"], "INVALID_IMAGE_FORMAT")

    def test_api_diagnose_alias(self):
        img_bytes = create_test_image_bytes()
        data = {
            "file": (io.BytesIO(img_bytes), "leaf.png")
        }
        res = self.client.post(
            "/api/diagnose",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["status"], "success")


if __name__ == "__main__":
    unittest.main()
