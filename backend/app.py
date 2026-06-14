"""
Combined Flask backend:
  - Plant disease image classification (Keras .keras model)
  - Crop optimizer (PSO / GA / Hybrid / Sensitivity / Compare)

All routes live in one Flask app on port 5000.

To run:
    pip install flask flask-cors tensorflow numpy pillow
    python app.py
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import io
from pathlib import Path
import numpy as np
from PIL import Image

# TensorFlow is heavy; only import it if the model file actually exists.
# (Optimizer routes still work even when TF is missing.)
try:
    import tensorflow as tf
    _TF_AVAILABLE = True
except Exception:  # pragma: no cover
    tf = None
    _TF_AVAILABLE = False

# ─────────────────────────────────────────────────────────────────────────────
# Optimizer-side imports (assumes optimizer.py and crop_data.py are siblings)
# ─────────────────────────────────────────────────────────────────────────────
try:
    from optimizer import (
        run_pso, run_ga, run_comparison,
        run_hybrid_pso_ga, run_sensitivity,
    )
    from crop_data import CROP_DATA, UNIT_COSTS, get_crop
    _OPTIMIZER_AVAILABLE = True
except Exception as e:
    print(f"[warn] optimizer modules not importable: {e}")
    _OPTIMIZER_AVAILABLE = False
    CROP_DATA, UNIT_COSTS = {}, {}
    def get_crop(*_a, **_k): return {}
    def run_pso(*_a, **_k): return {"error": "optimizer unavailable"}
    def run_ga(*_a, **_k): return {"error": "optimizer unavailable"}
    def run_comparison(*_a, **_k): return {"error": "optimizer unavailable"}
    def run_hybrid_pso_ga(*_a, **_k): return {"error": "optimizer unavailable"}
    def run_sensitivity(*_a, **_k): return {"error": "optimizer unavailable"}


# ─────────────────────────────────────────────────────────────────────────────
# Flask app
# ─────────────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload cap


# ─────────────────────────────────────────────────────────────────────────────
# 1) Plant-disease image classification
# ─────────────────────────────────────────────────────────────────────────────
BACKEND_DIR    = Path(__file__).resolve().parent.parent
MODEL_PATH  = BACKEND_DIR / "models" / "best_model.keras"
IMG_SIZE       = (224, 224)
ALLOWED_EXTS   = {"png", "jpg", "jpeg"}

CLASS_NAMES = [
    "Corn_Blight", "Corn_CommonRust", "Corn_GrayLeafSpot", "Corn_Healthy",
    "Potato_EarlyBlight", "Potato_Healthy", "Potato_Lateblight",
    "Rice_BacterialLeafBlight", "Rice_BrownSpot", "Rice_Healthy",
    "Rice_LeafBlast", "Rice_LeafScald", "Rice_SheathBlight",
    "Soybean_BacterialBlight", "Soybean_DownyMildew", "Soybean_Healthy",
    "Soybean_MosaicVirus", "Soybean_Rust", "Soybean__DiabroticaSpeciosa",
    "Soybean__PowderyMildew", "Soybean__SouthernBlight", "Wheat_BlackRust",
    "Wheat_BrownRust", "Wheat_FusariumHeadBlight", "Wheat_Healthy",
    "Wheat_LeafBlight", "Wheat_Mildew", "Wheat_Septoria", "Wheat_Smut",
    "Wheat_TanSpot", "Wheat_YellowRust",
]

# Patch Keras Layer to drop legacy args that newer TF doesn't recognise
if _TF_AVAILABLE:
    _orig_layer_init = tf.keras.layers.Layer.__init__

    def _patched_layer_init(self, *args, **kwargs):
        for k in ("renorm", "renorm_clipping",
                  "renorm_momentum", "quantization_config"):
            kwargs.pop(k, None)
        _orig_layer_init(self, *args, **kwargs)

    tf.keras.layers.Layer.__init__ = _patched_layer_init

# Load the model once at startup (only if file exists)
model = None
if _TF_AVAILABLE and MODEL_PATH.exists():
    try:
        model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
        print(f"[ok] Keras model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"[warn] failed to load Keras model: {e}")
        model = None
else:
    print(f"[warn] Keras model not found at {MODEL_PATH} — /predict will return 503")


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTS


def _predict_image(file_bytes: bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    preds = model.predict(arr)
    cls  = CLASS_NAMES[int(np.argmax(preds[0]))]
    conf = float(np.max(preds[0])) * 100
    return cls, conf


@app.route("/")
def index():
    # If you have templates/index.html, this still works.
    # Otherwise return a tiny landing page so the server is browsable.
    try:
        return render_template("index.html")
    except Exception:
        return (
            "<h3>Combined backend is running.</h3>"
            "<ul>"
            "<li>POST /predict  (image upload)</li>"
            "<li>POST /optimize (crop optimizer: PSO / GA)</li>"
            "<li>POST /compare  (crop optimizer: PSO vs GA)</li>"
            "<li>POST /hybrid   (PSO+GA hybrid)</li>"
            "<li>POST /sensitivity</li>"
            "<li>GET  /crops</li>"
            "<li>GET  /crop_defaults/&lt;name&gt;</li>"
            "</ul>"
        )


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({
            "error": "Model not loaded. Place best_model.keras in the "
                     "models/ folder and restart the server."
        }), 503

    if "file" not in request.files:
        return jsonify({"error": "Tidak ada file yang diupload"}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "File kosong"}), 400
    if not _allowed_file(f.filename):
        return jsonify({"error": "Format file tidak didukung"}), 400

    file_bytes = f.read()
    cls, conf = _predict_image(file_bytes)
    return jsonify({"class": cls, "confidence": f"{conf:.2f}%"})


# ─────────────────────────────────────────────────────────────────────────────
# 2) Crop optimizer routes
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/optimize", methods=["POST"])
def optimize():
    if not _OPTIMIZER_AVAILABLE:
        return jsonify({"error": "optimizer module unavailable"}), 503

    data       = request.get_json() or {}
    crop_name  = data.get("crop", "rice")
    algorithm  = data.get("algorithm", "PSO")
    iterations = int(data.get("iterations", 50))
    custom     = data.get("custom_params", None)

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400

    if algorithm == "PSO":
        result = run_pso(crop_name, n_iterations=iterations, custom_params=custom)
    else:
        result = run_ga(crop_name, n_generations=iterations, custom_params=custom)
    return jsonify(result)


@app.route("/compare", methods=["POST"])
def compare():
    if not _OPTIMIZER_AVAILABLE:
        return jsonify({"error": "optimizer module unavailable"}), 503

    data = request.get_json() or {}
    crop = data.get("crop")
    iters = int(data.get("iterations", 50))
    custom = data.get("custom_params", None)
    return jsonify(run_comparison(crop, iters, custom_params=custom))


@app.route("/crops", methods=["GET"])
def crops():
    return jsonify(list(CROP_DATA.keys()))


@app.route("/crop_defaults/<crop_name>", methods=["GET"])
def crop_defaults(crop_name):
    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400
    out = get_crop(crop_name)
    out.update(UNIT_COSTS)
    return jsonify(out)


@app.route("/hybrid", methods=["POST"])
def hybrid():
    if not _OPTIMIZER_AVAILABLE:
        return jsonify({"error": "optimizer module unavailable"}), 503

    data = request.get_json() or {}
    crop = data.get("crop", "rice")
    iters = int(data.get("iterations", 50))
    custom = data.get("custom_params", None)

    if crop not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop}"}), 400

    return jsonify(run_hybrid_pso_ga(crop, total_iterations=iters, custom_params=custom))


@app.route("/sensitivity", methods=["POST"])
def sensitivity():
    if not _OPTIMIZER_AVAILABLE:
        return jsonify({"error": "optimizer module unavailable"}), 503

    data = request.get_json() or {}
    crop = data.get("crop", "rice")
    wr   = float(data.get("water_ratio",  0.7))
    fr   = float(data.get("fert_ratio",   0.7))
    lr   = float(data.get("labor_ratio",  0.7))
    custom = data.get("custom_params", None)

    if crop not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop}"}), 400

    return jsonify(run_sensitivity(crop, wr, fr, lr, custom_params=custom))


# ─────────────────────────────────────────────────────────────────────────────
# 3) Health check — handy for the React frontend
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "model_loaded":  model is not None,
        "optimizer_ok":  _OPTIMIZER_AVAILABLE,
        "tensorflow":    _TF_AVAILABLE,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint — single port (5000)
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Combined backend running on http://127.0.0.1:5000")
    print("  - /predict         (image classification)")
    print("  - /optimize, /compare, /hybrid, /sensitivity  (optimizer)")
    print("  - /crops, /crop_defaults/<name>")
    print("  - /health")
    app.run(debug=True, port=5000)
