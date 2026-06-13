import numpy as np
import pyswarms as ps
import pygad
from crop_data import get_crop, compute_profit, compute_costs

# ─────────────────────────────────────────────────────────────────────────────
# FONCTION OBJECTIF COMMUNE (utilisée par PSO et GA)
# ─────────────────────────────────────────────────────────────────────────────
# Les 3 variables optimisées sont :
#   x[0] = water_ratio  (entre 0.01 et 1.0)
#   x[1] = fert_ratio   (entre 0.01 et 1.0)
#   x[2] = labor_ratio  (entre 0.01 et 1.0)
# ratio = 1.0 signifie qu'on utilise 100% de la ressource disponible

def profit_function(water_r, fert_r, labor_r, crop_name, custom_params=None):
    """
    Retourne le profit estimé en $/ha pour un jeu de ratios donné.
    Utilise compute_profit() de crop_data.py.
    """
    return compute_profit(crop_name, water_r, fert_r, labor_r, custom_params)


# ─────────────────────────────────────────────────────────────────────────────
# PSO — Particle Swarm Optimization (PySwarms)
# ─────────────────────────────────────────────────────────────────────────────

def run_pso(crop_name, n_particles=20, n_iterations=50, custom_params=None):
    """
    Lance l'optimisation PSO sur la culture donnée.
    Retourne un dict avec la meilleure allocation et l'historique.
    """

    # PySwarms MINIMISE → on retourne -profit pour maximiser
    def pso_objective(params):
        # params : array (n_particles, 3)
        profits = []
        for p in params:
            p_val = profit_function(p[0], p[1], p[2], crop_name, custom_params)
            profits.append(-p_val)          # négatif car PySwarms minimise
        return np.array(profits)

    # Limites des variables : [min, max] pour chaque dimension
    bounds = (
        np.array([0.01, 0.01, 0.01]),       # bornes basses
        np.array([1.00, 1.00, 1.00])        # bornes hautes
    )

    # Hyperparamètres PSO
    options = {
        'c1': 1.5,   # attraction vers pBest (personnel)
        'c2': 1.5,   # attraction vers gBest (global)
        'w':  0.7    # inertie
    }

    optimizer = ps.single.GlobalBestPSO(
        n_particles=n_particles,
        dimensions=3,
        options=options,
        bounds=bounds
    )

    best_cost, best_pos = optimizer.optimize(pso_objective, iters=n_iterations, verbose=False)

    # Reconstruire l'historique de convergence (coût → profit)
    history = [-c for c in optimizer.cost_history]   # repasser en positif

    best_water_r, best_fert_r, best_labor_r = best_pos
    best_profit  = -best_cost
    costs        = compute_costs(crop_name, best_water_r, best_fert_r, best_labor_r, custom_params)
    crop         = get_crop(crop_name, custom_params)
    
    import math
    yield_factor = (best_water_r**0.4) * (best_fert_r**0.35) * (best_labor_r**0.25)
    revenue      = crop['price_per_kg'] * crop['yield_kg_ha'] * min(yield_factor, 1.0)

    total = best_water_r + best_fert_r + best_labor_r
    return {
        "algorithm":    "PSO",
        "crop":         crop_name,
        "best_profit":  round(best_profit, 2),
        "revenue":      round(revenue, 2),
        "total_cost":   costs["total_cost"],
        "water_cost":   costs["water_cost"],
        "fert_cost":    costs["fert_cost"],
        "labor_cost":   costs["labor_cost"],
        "water_r":      float(best_water_r),
        "fert_r":       float(best_fert_r),
        "labor_r":      float(best_labor_r),
        "water_pct":    round(best_water_r / total * 100),
        "fert_pct":     round(best_fert_r  / total * 100),
        "labor_pct":    round(best_labor_r / total * 100),
        "iterations":   len(history),
        "history":      [round(h, 2) for h in history],
        "custom_params": custom_params,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GA — Genetic Algorithm (PyGAD)
# ─────────────────────────────────────────────────────────────────────────────

def run_ga(crop_name, n_generations=50, population_size=20, custom_params=None):
    """
    Lance l'optimisation GA sur la culture donnée.
    Retourne un dict avec la meilleure allocation et l'historique.
    """

    history = []

    # PyGAD MAXIMISE → on retourne directement le profit (pas de négatif)
    def ga_fitness(ga_instance, solution, solution_idx):
        water_r, fert_r, labor_r = solution
        return profit_function(water_r, fert_r, labor_r, crop_name, custom_params)

    # Callback appelé à chaque génération → on enregistre le meilleur profit
    def on_generation(ga_instance):
        try:
            fitness_vals = ga_instance.last_generation_fitness
            if fitness_vals is not None and len(fitness_vals) > 0:
                best_fitness = float(np.max(fitness_vals))
                history.append(round(best_fitness, 2))
        except Exception:
            pass

    ga = pygad.GA(
        num_generations=n_generations,
        num_parents_mating=4,
        fitness_func=ga_fitness,
        sol_per_pop=population_size,
        num_genes=3,                        # 3 variables : water, fert, labor
        gene_space=[
            {"low": 0.01, "high": 1.0},     # water_ratio
            {"low": 0.01, "high": 1.0},     # fert_ratio
            {"low": 0.01, "high": 1.0},     # labor_ratio
        ],
        mutation_percent_genes=20,
        on_generation=on_generation,
        suppress_warnings=True
    )

    ga.run()
    solution, best_fitness, _ = ga.best_solution()

    best_water_r, best_fert_r, best_labor_r = solution
    costs   = compute_costs(crop_name, best_water_r, best_fert_r, best_labor_r, custom_params)
    crop    = get_crop(crop_name, custom_params)

    yield_factor = (best_water_r**0.4) * (best_fert_r**0.35) * (best_labor_r**0.25)
    revenue      = crop['price_per_kg'] * crop['yield_kg_ha'] * min(yield_factor, 1.0)

    total = best_water_r + best_fert_r + best_labor_r
    return {
        "algorithm":    "GA",
        "crop":         crop_name,
        "best_profit":  round(float(best_fitness), 2),
        "revenue":      round(revenue, 2),
        "total_cost":   costs["total_cost"],
        "water_cost":   costs["water_cost"],
        "fert_cost":    costs["fert_cost"],
        "labor_cost":   costs["labor_cost"],
        "water_r":      float(best_water_r),
        "fert_r":       float(best_fert_r),
        "labor_r":      float(best_labor_r),
        "water_pct":    round(best_water_r / total * 100),
        "fert_pct":     round(best_fert_r  / total * 100),
        "labor_pct":    round(best_labor_r / total * 100),
        "iterations":   len(history),
        "history":      history,
        "custom_params": custom_params,
    }


def run_comparison(crop_name, iterations=50, custom_params=None):
    """
    Lance PSO, GA et Memetic sur la même culture.
    Retourne les 3 résultats + un résumé comparatif.
    """
    results = {
        "PSO":     run_pso(crop_name,     n_iterations=iterations, custom_params=custom_params),
        "GA":      run_ga(crop_name,      n_generations=iterations, custom_params=custom_params),
    }

    # Trouver le gagnant
    best_algo = max(results, key=lambda a: results[a]["best_profit"])

    return {
        "crop":      crop_name,
        "winner":    best_algo,
        "results":   results,
        "summary": {
            algo: {
                "profit":     r["best_profit"],
                "iterations": r["iterations"],
                "water_r":    r["water_r"],
                "fert_r":     r["fert_r"],
                "labor_r":    r["labor_r"],
                "water_pct":  r["water_pct"],
                "fert_pct":   r["fert_pct"],
                "labor_pct":  r["labor_pct"],
            }
            for algo, r in results.items()
        }
    }
# ─────────────────────────────────────────────────────────────────────────────
# ADDITION 1 — Hybrid PSO → GA
# PSO explores the space first, then seeds GA for fine-tuned refinement
# Paste this at the BOTTOM of your optimizer.py
# ─────────────────────────────────────────────────────────────────────────────

def run_hybrid_pso_ga(crop_name, total_iterations=50, n_particles=20, custom_params=None):
    """
    Phase 1 (PSO)  : Explores the solution space broadly to find a good region.
    Phase 2 (GA)   : Starts from PSO's best position → refines for higher profit.
    Result is always >= PSO result alone.
    """
    pso_iters = total_iterations // 2
    ga_gens   = total_iterations // 2

    # ── Phase 1: PSO ────────────────────────────────────────────────────────
    def pso_objective(params):
        return np.array([-profit_function(p[0], p[1], p[2], crop_name, custom_params) for p in params])

    bounds  = (np.array([0.01, 0.01, 0.01]), np.array([1.0, 1.0, 1.0]))
    options = {'c1': 1.5, 'c2': 1.5, 'w': 0.7}

    pso_opt = ps.single.GlobalBestPSO(
        n_particles=n_particles,
        dimensions=3,
        options=options,
        bounds=bounds
    )
    best_cost, best_pos = pso_opt.optimize(pso_objective, iters=pso_iters, verbose=False)
    pso_history = [-c for c in pso_opt.cost_history]
    pso_profit  = -best_cost

    # ── Phase 2: GA seeded from PSO best position ────────────────────────────
    ga_history = []

    # Build initial population: 60% near PSO best, 40% random (keeps diversity)
    initial_pop = np.random.uniform(0.01, 1.0, (20, 3))
    for i in range(12):
        noise          = np.random.normal(0, 0.04, 3)
        initial_pop[i] = np.clip(best_pos + noise, 0.01, 1.0)
    initial_pop[0] = best_pos   # slot 0 = exact PSO winner

    def ga_fitness(ga_instance, solution, idx):
        return profit_function(solution[0], solution[1], solution[2], crop_name, custom_params)

    def on_gen(ga_instance):
        try:
            fitness_vals = ga_instance.last_generation_fitness
            if fitness_vals is not None and len(fitness_vals) > 0:
                ga_history.append(round(float(np.max(fitness_vals)), 2))
        except Exception:
            pass

    ga = pygad.GA(
        num_generations=ga_gens,
        num_parents_mating=4,
        fitness_func=ga_fitness,
        initial_population=initial_pop,
        gene_space=[
        {"low": 0.01, "high": 1.0},
        {"low": 0.01, "high": 1.0},
        {"low": 0.01, "high": 1.0},
        ],
        mutation_percent_genes=15,   # less mutation — we're already near optimum
        on_generation=on_gen,
        suppress_warnings=True
    )
    ga.run()

    try:
        solution, final_profit_raw, _ = ga.best_solution()
    except Exception:
        # fallback: pick best from last generation manually
        best_idx     = int(np.argmax(ga.last_generation_fitness))
        solution     = ga.population[best_idx]
        final_profit_raw = ga.last_generation_fitness[best_idx]
    
    final_profit = float(final_profit_raw)
    w, f, l      = solution
    costs        = compute_costs(crop_name, w, f, l, custom_params)
    crop         = get_crop(crop_name, custom_params)
    yf           = (w**0.4) * (f**0.35) * (l**0.25)
    revenue      = crop['price_per_kg'] * crop['yield_kg_ha'] * min(yf, 1.0)
    total        = w + f + l
    improvement  = round(final_profit - pso_profit, 2)

    return {
        "algorithm":       "Hybrid PSO→GA",
        "crop":            crop_name,
        "pso_profit":      round(pso_profit, 2),
        "best_profit":     round(final_profit, 2),
        "improvement":     improvement,
        "improvement_pct": round(improvement / max(abs(pso_profit), 1) * 100, 1),
        "revenue":         round(revenue, 2),
        "total_cost":      costs["total_cost"],
        "water_cost":      costs["water_cost"],
        "fert_cost":       costs["fert_cost"],
        "labor_cost":      costs["labor_cost"],
        "water_r":         float(w),
        "fert_r":          float(f),
        "labor_r":         float(l),
        "water_pct":       round(w / total * 100),
        "fert_pct":        round(f / total * 100),
        "labor_pct":       round(l / total * 100),
        "pso_iters":       len(pso_history),
        "ga_gens":         len(ga_history),
        "pso_history":     [round(h, 2) for h in pso_history],
        "ga_history":      ga_history,
        "custom_params":   custom_params,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADDITION 2 — Sensitivity Analysis
# Shows how profit reacts when you manually change each resource ratio
# Paste this right below run_hybrid_pso_ga
# ─────────────────────────────────────────────────────────────────────────────

def run_sensitivity(crop_name, water_ratio, fert_ratio, labor_ratio, steps=30, custom_params=None):
    """
    For given ratio values, computes how the profit changes
    as EACH ratio slides from 0 → 1 while the other two stay fixed.
    Returns 3 curves — one per resource — for charting.
    """
    r_range = np.linspace(0.01, 1.0, steps).tolist()

    water_curve = [
        round(profit_function(r, fert_ratio, labor_ratio, crop_name, custom_params), 2)
        for r in r_range
    ]
    fert_curve = [
        round(profit_function(water_ratio, r, labor_ratio, crop_name, custom_params), 2)
        for r in r_range
    ]
    labor_curve = [
        round(profit_function(water_ratio, fert_ratio, r, crop_name, custom_params), 2)
        for r in r_range
    ]

    current_profit = profit_function(water_ratio, fert_ratio, labor_ratio, crop_name, custom_params)
    costs          = compute_costs(crop_name, water_ratio, fert_ratio, labor_ratio, custom_params)

    # Find which resource has the steepest slope → most sensitive
    def slope(curve):
        return max(curve) - min(curve)

    sensitivities  = {"water": slope(water_curve), "fert": slope(fert_curve), "labor": slope(labor_curve)}
    most_sensitive = max(sensitivities, key=sensitivities.get)

    return {
        "crop":           crop_name,
        "water_ratio":    round(water_ratio, 2),
        "fert_ratio":     round(fert_ratio, 2),
        "labor_ratio":    round(labor_ratio, 2),
        "current_profit": round(current_profit, 2),
        "costs":          costs,
        "ratio_range":    [round(r, 2) for r in r_range],
        "water_curve":    water_curve,
        "fert_curve":     fert_curve,
        "labor_curve":    labor_curve,
        "most_sensitive": most_sensitive,
        "sensitivity_scores": {k: round(v, 2) for k, v in sensitivities.items()},
    }
