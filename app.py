from flask import Flask, request, jsonify, render_template
from optimizer import run_pso, run_ga
from crop_data import CROP_DATA
from optimizer import run_comparison
from optimizer import run_hybrid_pso_ga, run_sensitivity
from crop_data import UNIT_COSTS, get_crop

app = Flask(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE PRINCIPALE — affiche la page web
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    crops = list(CROP_DATA.keys())      # liste des 22 cultures
    return render_template("index.html", crops=crops)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE API — lance l'optimisation et retourne le résultat en JSON
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/optimize", methods=["POST"])
def optimize():
    data       = request.get_json()
    crop_name  = data.get("crop", "rice")
    algorithm  = data.get("algorithm", "PSO")   # "PSO" ou "GA"
    iterations = int(data.get("iterations", 50))

    custom_params = data.get("custom_params", None)

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Culture inconnue : {crop_name}"}), 400

    if algorithm == "PSO":
        result = run_pso(crop_name, n_iterations=iterations, custom_params=custom_params)
    else:
        result = run_ga(crop_name, n_generations=iterations, custom_params=custom_params)

    return jsonify(result)


@app.route("/compare", methods=["POST"])
def compare():

    data = request.get_json()

    crop = data.get("crop")
    iterations = int(
        data.get("iterations", 50)
    )
    custom_params = data.get("custom_params", None)

    result = run_comparison(
        crop,
        iterations,
        custom_params=custom_params
    )

    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE API — retourne la liste des cultures disponibles
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/crops", methods=["GET"])
def crops():
    return jsonify(list(CROP_DATA.keys()))

@app.route("/crop_defaults/<crop_name>", methods=["GET"])
def crop_defaults(crop_name):
    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400
    
    defaults = get_crop(crop_name)
    # Combine with unit costs
    defaults.update(UNIT_COSTS)
    return jsonify(defaults)


@app.route("/hybrid", methods=["POST"])
def hybrid():
    data       = request.get_json()
    crop_name  = data.get("crop", "rice")
    iterations = int(data.get("iterations", 50))
    custom_params = data.get("custom_params", None)

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400

    result = run_hybrid_pso_ga(crop_name, total_iterations=iterations, custom_params=custom_params)
    return jsonify(result)


@app.route("/sensitivity", methods=["POST"])
def sensitivity():
    data         = request.get_json()
    crop_name    = data.get("crop", "rice")
    water_ratio  = float(data.get("water_ratio",  0.7))
    fert_ratio   = float(data.get("fert_ratio",   0.7))
    labor_ratio  = float(data.get("labor_ratio",  0.7))
    custom_params = data.get("custom_params", None)

    if crop_name not in CROP_DATA:
        return jsonify({"error": f"Unknown crop: {crop_name}"}), 400

    result = run_sensitivity(crop_name, water_ratio, fert_ratio, labor_ratio, custom_params=custom_params)
    return jsonify(result)


if __name__ == "__main__":
    print("Server started on http://127.0.0.1:5001")
    app.run(port=5001, debug=True)
