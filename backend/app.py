from flask import Flask, request, jsonify
from flask_cors import CORS
from optimizer import run_pso, run_ga, run_comparison, run_hybrid_pso_ga, run_sensitivity
from crop_data import CROP_DATA

app = Flask(__name__)
CORS(app)  # Allow React dev server to call this API


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE API — launch optimization and return result as JSON
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/optimize", methods=["POST"])
def optimize():
    data       = request.get_json()
    crop_name  = data.get("crop", "rice")
    algorithm  = data.get("algorithm", "PSO")   # "PSO" or "GA"
    iterations = int(data.get("iterations", 50))

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400

    if algorithm == "PSO":
        result = run_pso(crop_name, n_iterations=iterations)
    else:
        result = run_ga(crop_name, n_generations=iterations)

    return jsonify(result)


@app.route("/compare", methods=["POST"])
def compare():
    data = request.get_json()
    crop = data.get("crop")
    iterations = int(data.get("iterations", 50))
    result = run_comparison(crop, iterations)
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE API — return the list of available crops
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/crops", methods=["GET"])
def crops():
    return jsonify(list(CROP_DATA.keys()))


@app.route("/hybrid", methods=["POST"])
def hybrid():
    data       = request.get_json()
    crop_name  = data.get("crop", "rice")
    iterations = int(data.get("iterations", 50))

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400

    result = run_hybrid_pso_ga(crop_name, total_iterations=iterations)
    return jsonify(result)


@app.route("/sensitivity", methods=["POST"])
def sensitivity():
    data         = request.get_json()
    crop_name    = data.get("crop", "rice")
    water_ratio  = float(data.get("water_ratio",  0.7))
    fert_ratio   = float(data.get("fert_ratio",   0.7))
    labor_ratio  = float(data.get("labor_ratio",  0.7))

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400

    result = run_sensitivity(crop_name, water_ratio, fert_ratio, labor_ratio)
    return jsonify(result)


if __name__ == "__main__":
    print("Optimizer API → http://127.0.0.1:5001")
    app.run(debug=True, port=5001)
