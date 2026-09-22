"""
Integration & Unit Tests for AgriN Groundnut Disease Classification Model & API
-------------------------------------------------------------------------------
Tests:
1. Groundnut model loading & inference on real test images
2. Healthy leaf vs disease classes detection
3. Low-confidence safety threshold warnings
4. API response normalization schema (crop, disease, confidence, recommendation, warning)
5. AgriAI / LLM advisory structured diagnosis context integration
"""

import sys
import os
import unittest
import json
import io
import base64
import numpy as np
from PIL import Image

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from engines.disease_diagnosis import diagnosis_engine, DiseaseDiagnosisEngine
from engines.llm_advisory import llm_localizer


def make_synthetic_image(color=(34, 139, 34), width=224, height=224, noise=False) -> bytes:
    """Helper to generate in-memory synthetic leaf images."""
    if noise:
        arr = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
        img = Image.fromarray(arr)
    else:
        img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


class TestGroundnutModelIntegration(unittest.TestCase):
    """Test suite for Groundnut Deep Neural Network Model and Diagnosis System."""

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.dataset_root = os.path.abspath(os.path.join(BACKEND_DIR, "..", "..", "datasets", "groundnut", "Raw_Data"))

    def test_model_loaded_successfully(self):
        """Verify the trained Keras model is loaded with 5 classes."""
        self.assertTrue(diagnosis_engine.is_real_weights)
        self.assertEqual(diagnosis_engine.model_engine_type, "groundnut_keras")
        self.assertEqual(len(diagnosis_engine.classes), 5)
        self.assertIn("early_leaf_spot", diagnosis_engine.classes)
        self.assertIn("healthy leaf", diagnosis_engine.classes)
        self.assertIn("late leaf spot", diagnosis_engine.classes)
        self.assertIn("nutrition deficiency", diagnosis_engine.classes)
        self.assertIn("rust", diagnosis_engine.classes)

    def test_real_dataset_image_inference(self):
        """Test inference on real images from dataset if present."""
        if os.path.exists(self.dataset_root):
            for class_name in diagnosis_engine.classes:
                class_dir = os.path.join(self.dataset_root, class_name)
                if os.path.exists(class_dir):
                    files = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                    if files:
                        sample_img_path = os.path.join(class_dir, files[0])
                        result = diagnosis_engine.diagnose_image(sample_img_path, crop_name="Groundnut")
                        
                        self.assertEqual(result["status"], "success")
                        self.assertEqual(result["crop"], "groundnut")
                        self.assertIn(result["disease"], diagnosis_engine.classes)
                        self.assertGreaterEqual(result["confidence"], 0.0)
                        self.assertLessEqual(result["confidence"], 1.0)
                        self.assertEqual(result["diagnosis_source"], "groundnut_trained_model")
                        self.assertEqual(result["model_status"], "LIVE")
                        self.assertTrue(len(result["recommendation"]) > 0)

    def test_low_confidence_safety_threshold(self):
        """Verify that low-confidence images trigger safety warning message."""
        custom_engine = DiseaseDiagnosisEngine(confidence_threshold=0.999)
        img_bytes = make_synthetic_image(noise=True)
        result = custom_engine.diagnose_image(img_bytes, crop_name="Groundnut")

        self.assertEqual(result["status"], "success")
        self.assertTrue(result["primary_diagnosis"]["is_low_confidence"])
        self.assertIn("not sufficiently confident", result["warning"])

    def test_api_post_multipart_normalized_response(self):
        """Verify /api/v1/diagnoses returns the exact normalized JSON schema."""
        img_bytes = make_synthetic_image(color=(50, 180, 50))
        data = {
            "image": (io.BytesIO(img_bytes), "leaf.jpg"),
            "crop_name": "groundnut"
        }
        res = self.client.post("/api/v1/diagnoses", data=data, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 200)
        body = res.get_json()

        # Normalized schema validation
        self.assertEqual(body["status"], "success")
        self.assertEqual(body["crop"], "groundnut")
        self.assertIn("disease", body)
        self.assertIn("confidence", body)
        self.assertEqual(body["diagnosis_source"], "groundnut_trained_model")
        self.assertEqual(body["model_status"], "LIVE")
        self.assertIn("recommendation", body)
        self.assertIn("warning", body)
        self.assertIn("data", body)

    def test_api_post_base64_payload(self):
        """Verify /api/v1/diagnoses accepts JSON Base64."""
        img_bytes = make_synthetic_image()
        b64_str = base64.b64encode(img_bytes).decode("utf-8")
        payload = {
            "image_base64": f"data:image/jpeg;base64,{b64_str}",
            "crop_name": "Groundnut"
        }
        res = self.client.post("/api/v1/diagnoses", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.get_json()
        self.assertEqual(body["status"], "success")
        self.assertEqual(body["crop"], "groundnut")

    def test_claude_advisory_context_integration(self):
        """Verify LLM advisory localizer consumes ML diagnosis context."""
        fake_diagnosis = {
            "crop": "groundnut",
            "disease": "early_leaf_spot",
            "confidence": 0.91,
            "primary_diagnosis": {
                "condition": "Tikka Early Leaf Spot (Cercospora arachidicola)",
                "severity": "Moderate",
                "description": "Necrotic circular spots with yellow halos."
            },
            "organic_treatment_plan": [
                "Foliar spray of 5% Neem Seed Kernel Extract (NSKE).",
                "Apply biocontrol agent Trichoderma viride."
            ]
        }

        advisory_res = llm_localizer.generate_plain_advisory(
            diagnosis_data=fake_diagnosis,
            language="en"
        )
        self.assertEqual(advisory_res["status"], "success")
        self.assertIn("audio_script", advisory_res)
        self.assertIn("urgent_actions", advisory_res)
        self.assertTrue(len(advisory_res["urgent_actions"]) > 0)


if __name__ == "__main__":
    unittest.main()
