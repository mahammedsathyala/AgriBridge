"""
AgriN Crop Disease Diagnosis Route (MVP 3)
------------------------------------------
Accepts leaf image uploads via multipart/form-data or JSON Base64,
runs YOLOv8 vision diagnosis, and returns identified plant diseases
with organic & biological remedies.
"""

from datetime import datetime, timezone
import base64
import io
from flask import Blueprint, request, jsonify
from engines.disease_diagnosis import diagnosis_engine

diagnose_bp = Blueprint("diagnose", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp"}


def allowed_file(filename: str) -> bool:
    """Check if file extension is supported."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@diagnose_bp.route("/diagnose", methods=["GET"])
@diagnose_bp.route("/api/diagnose", methods=["GET"])
def diagnose_info():
    """Returns endpoint documentation and sample curl commands."""
    return jsonify({
        "service": "AgriN Crop Disease Diagnosis API",
        "stage": "MVP 3: YOLOv8 Computer Vision Active",
        "method": "POST",
        "endpoints": ["/diagnose", "/api/diagnose"],
        "supported_input_methods": {
            "method_1_multipart": {
                "content_type": "multipart/form-data",
                "field_name": "image (or 'file')",
                "optional_fields": {"crop_name": "e.g. Groundnut, Tomato, Wheat"},
                "sample_curl": "curl -X POST http://localhost:5000/diagnose -F 'image=@leaf.jpg' -F 'crop_name=Groundnut'"
            },
            "method_2_json_base64": {
                "content_type": "application/json",
                "required_fields": {"image_base64": "<Base64 string>"},
                "optional_fields": {"crop_name": "Groundnut"}
            }
        },
        "supported_pathologies": [
            "Tikka Leaf Spot (Cercospora arachidicola)",
            "Leaf Rust (Puccinia spp.)",
            "Bacterial Leaf Blight (Xanthomonas)",
            "Powdery Mildew (Erysiphe spp.)",
            "Healthy Foliage"
        ],
        "organic_remedies_included": True
    }), 200


@diagnose_bp.route("/diagnose", methods=["POST"])
@diagnose_bp.route("/api/diagnose", methods=["POST"])
def diagnose_crop():
    """
    Diagnoses crop diseases from uploaded leaf image.
    Accepts multipart file or JSON with base64 encoded image.
    """
    crop_name = request.form.get("crop_name") or request.args.get("crop_name") or "General Crop"
    image_bytes = None

    # 1. Check for multipart/form-data upload
    if request.files:
        file_obj = (
            request.files.get("image")
            or request.files.get("file")
            or request.files.get("photo")
        )
        if not file_obj or file_obj.filename == "":
            return jsonify({
                "status": "error",
                "error_code": "EMPTY_FILE_UPLOAD",
                "message": "No file was selected for upload. Expected field name 'image' or 'file'."
            }), 400

        if not allowed_file(file_obj.filename):
            return jsonify({
                "status": "error",
                "error_code": "INVALID_IMAGE_FORMAT",
                "message": f"Unsupported file extension. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            }), 400

        image_bytes = file_obj.read()

    # 2. Check for JSON Base64 payload
    elif request.is_json:
        data = request.get_json(silent=True) or {}
        b64_str = data.get("image_base64") or data.get("image")
        if not b64_str:
            return jsonify({
                "status": "error",
                "error_code": "MISSING_IMAGE_PAYLOAD",
                "message": "JSON body must contain 'image_base64' string or upload file via multipart/form-data."
            }), 400

        if "crop_name" in data:
            crop_name = data["crop_name"]

        # Strip optional data URI header (e.g. data:image/jpeg;base64,...)
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]

        try:
            image_bytes = base64.b64decode(b64_str)
        except Exception as err:
            return jsonify({
                "status": "error",
                "error_code": "INVALID_BASE64",
                "message": f"Failed to decode base64 image: {str(err)}"
            }), 400

    else:
        return jsonify({
            "status": "error",
            "error_code": "INVALID_REQUEST_CONTENT_TYPE",
            "message": "Request must be multipart/form-data with 'image' file, or application/json with 'image_base64'."
        }), 400

    if not image_bytes or len(image_bytes) == 0:
        return jsonify({
            "status": "error",
            "error_code": "EMPTY_IMAGE_BYTES",
            "message": "The uploaded image file or payload was empty."
        }), 400

    # Run diagnosis engine
    result = diagnosis_engine.diagnose_image(image_bytes, crop_name=crop_name)

    if result.get("status") == "error":
        return jsonify(result), 400

    response = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "3.0.0-mvp3",
        **result
    }
    return jsonify(response), 200
