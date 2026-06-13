import numpy as np
UNIT_COSTS = {
    "water_per_m3":  0.23,   # RM/mÂ³   
    "fert_per_kg":   2.25,   # RM/kg   
    "labor_per_hour": 9.00,  # RM/hour 
}

CROP_DATA = {
    "rice": {
        "category":      "Grains",
        "price_per_kg":  1.8,
        "yield_kg_ha":   4500,
        "water_m3_ha":   1200,
        "fert_kg_ha":    150,
        "labor_hours_ha":80,
        "source":        "FAO 2023 / IRRI",
    },
    "maize": {
        "category":      "Grains",
        "price_per_kg":  0.99,
        "yield_kg_ha":   5500,
        "water_m3_ha":   500,
        "fert_kg_ha":    150,
        "labor_hours_ha":50,
        "source":        "FAO 2023 / CIMMYT",
    },
    "chickpea": {
        "category":      "Legumes",
        "price_per_kg":  3.6,
        "yield_kg_ha":   1000,
        "water_m3_ha":   350,
        "fert_kg_ha":    60,
        "labor_hours_ha":40,
        "source":        "FAO 2022 / ICRISAT",
    },
    "kidneybeans": {
        "category":      "Legumes",
        "price_per_kg":  5.4,
        "yield_kg_ha":   1500,
        "water_m3_ha":   400,
        "fert_kg_ha":    80,
        "labor_hours_ha":60,
        "source":        "FAO 2022",
    },
    "pigeonpeas": {
        "category":      "Legumes",
        "price_per_kg":  3.15,
        "yield_kg_ha":   900,
        "water_m3_ha":   300,
        "fert_kg_ha":    50,
        "labor_hours_ha":45,
        "source":        "ICRISAT 2021",
    },
    "mothbeans": {
        "category":      "Legumes",
        "price_per_kg":  2.93,
        "yield_kg_ha":   700,
        "water_m3_ha":   250,
        "fert_kg_ha":    40,
        "labor_hours_ha":35,
        "source":        "ICRISAT 2021",
    },
    "mungbean": {
        "category":      "Legumes",
        "price_per_kg":  3.83,
        "yield_kg_ha":   1200,
        "water_m3_ha":   380,
        "fert_kg_ha":    60,
        "labor_hours_ha":50,
        "source":        "FAO 2022",
    },
    "blackgram": {
        "category":      "Legumes",
        "price_per_kg":  4.05,
        "yield_kg_ha":   900,
        "water_m3_ha":   350,
        "fert_kg_ha":    55,
        "labor_hours_ha":45,
        "source":        "FAO 2022 / ICAR",
    },
    "lentil": {
        "category":      "Legumes",
        "price_per_kg":  3.38,
        "yield_kg_ha":   1100,
        "water_m3_ha":   350,
        "fert_kg_ha":    60,
        "labor_hours_ha":40,
        "source":        "FAO 2022",
    },
    "pomegranate": {
        "category":      "Fruits",
        "price_per_kg":  6.75,
        "yield_kg_ha":   12000,
        "water_m3_ha":   750,
        "fert_kg_ha":    120,
        "labor_hours_ha":200,
        "source":        "FAO 2023",
    },
    "banana": {
        "category":      "Fruits",
        "price_per_kg":  1.35,
        "yield_kg_ha":   20000,
        "water_m3_ha":   1500,
        "fert_kg_ha":    300,
        "labor_hours_ha":250,
        "source":        "FAO 2023 / Bioversity",
    },
    "mango": {
        "category":      "Fruits",
        "price_per_kg":  3.6,
        "yield_kg_ha":   8000,
        "water_m3_ha":   600,
        "fert_kg_ha":    150,
        "labor_hours_ha":180,
        "source":        "FAO 2023",
    },
    "grapes": {
        "category":      "Fruits",
        "price_per_kg":  5.4,
        "yield_kg_ha":   15000,
        "water_m3_ha":   700,
        "fert_kg_ha":    180,
        "labor_hours_ha":300,
        "source":        "FAO 2023 / OIV",
    },
    "watermelon": {
        "category":      "Fruits",
        "price_per_kg":  1.13,
        "yield_kg_ha":   25000,
        "water_m3_ha":   500,
        "fert_kg_ha":    120,
        "labor_hours_ha":80,
        "source":        "FAO 2022",
    },
    "muskmelon": {
        "category":      "Fruits",
        "price_per_kg":  1.58,
        "yield_kg_ha":   18000,
        "water_m3_ha":   450,
        "fert_kg_ha":    110,
        "labor_hours_ha":75,
        "source":        "FAO 2022",
    },
    "apple": {
        "category":      "Fruits",
        "price_per_kg":  4.5,
        "yield_kg_ha":   20000,
        "water_m3_ha":   800,
        "fert_kg_ha":    200,
        "labor_hours_ha":400,
        "source":        "FAO 2023",
    },
    "orange": {
        "category":      "Fruits",
        "price_per_kg":  2.25,
        "yield_kg_ha":   18000,
        "water_m3_ha":   900,
        "fert_kg_ha":    180,
        "labor_hours_ha":200,
        "source":        "FAO 2023",
    },
    "papaya": {
        "category":      "Fruits",
        "price_per_kg":  1.8,
        "yield_kg_ha":   35000,
        "water_m3_ha":   1000,
        "fert_kg_ha":    200,
        "labor_hours_ha":200,
        "source":        "FAO 2022",
    },
    "coconut": {
        "category":      "Fruits",
        "price_per_kg":  1.13,
        "yield_kg_ha":   10000,
        "water_m3_ha":   1200,
        "fert_kg_ha":    150,
        "labor_hours_ha":150,
        "source":        "FAO 2023 / APCC",
    },
    "cotton": {
        "category":      "Commercial",
        "price_per_kg":  2.93,
        "yield_kg_ha":   2500,
        "water_m3_ha":   700,
        "fert_kg_ha":    160,
        "labor_hours_ha":120,
        "source":        "USDA / ICAC 2023",
    },
    "jute": {
        "category":      "Commercial",
        "price_per_kg":  1.58,
        "yield_kg_ha":   2500,
        "water_m3_ha":   500,
        "fert_kg_ha":    100,
        "labor_hours_ha":100,
        "source":        "FAO 2022 / IJSG",
    },
    "coffee": {
        "category":      "Commercial",
        "price_per_kg":  11.25,
        "yield_kg_ha":   800,
        "water_m3_ha":   600,
        "fert_kg_ha":    150,
        "labor_hours_ha":200,
        "source":        "ICO 2023",
    },
}


def get_crop(name: str, custom_params: dict = None) -> dict:
    """This Function returns all the informations about one crop type the one we chose"""
    key = name.lower().replace(' ', '').replace('-', '')
    crop = dict(CROP_DATA[key])
    if custom_params:
        for k in ['price_per_kg', 'yield_kg_ha', 'water_m3_ha', 'fert_kg_ha', 'labor_hours_ha']:
            if k in custom_params and custom_params[k] is not None:
                crop[k] = float(custom_params[k])
    return crop


def compute_max_revenue(crop_name: str, custom_params: dict = None) -> float:
    """Maximum Revenue= price Ã— yield (without any costs) so this is the perfect revenue without any water or labor cost taken """
    c = get_crop(crop_name, custom_params)
    return c['price_per_kg'] * c['yield_kg_ha']


def compute_costs(crop_name: str, water_ratio=1.0, fert_ratio=1.0, labor_ratio=1.0, custom_params: dict = None) -> dict:
    """
    compute the costs depending on the Allocation ratio choice (0.0 â†’ 1.0).
    ratio=1.0 = complete use  of the crop ressources needed 
    """
    c = get_crop(crop_name, custom_params)
    u = dict(UNIT_COSTS)
    if custom_params:
        for k in ['water_per_m3', 'fert_per_kg', 'labor_per_hour']:
            if k in custom_params and custom_params[k] is not None:
                u[k] = float(custom_params[k])
    
    water_cost = water_ratio * c['water_m3_ha']   * u['water_per_m3']
    fert_cost  = fert_ratio  * c['fert_kg_ha']    * u['fert_per_kg']
    labor_cost = labor_ratio * c['labor_hours_ha'] * u['labor_per_hour']
    total_cost = water_cost + fert_cost + labor_cost
    return {
        'water_cost': round(water_cost, 2),
        'fert_cost':  round(fert_cost,  2),
        'labor_cost': round(labor_cost, 2),
        'total_cost': round(total_cost, 2),
    }


def compute_profit(crop_name: str, water_ratio=1.0, fert_ratio=1.0, labor_ratio=1.0, custom_params: dict = None) -> float:
    """Profit = Revenue Ã— yield_factor âˆ’ total_cost."""
    c       = get_crop(crop_name, custom_params)
    costs   = compute_costs(crop_name, water_ratio, fert_ratio, labor_ratio, custom_params)
    if water_ratio <= 0 or fert_ratio <= 0 or labor_ratio <= 0:
        return -1e12
    yield_f = (water_ratio**0.4) * (fert_ratio**0.35) * (labor_ratio**0.25)
    if np.isnan(yield_f) or np.isinf(yield_f):
        return -1e12
    revenue = c['price_per_kg'] * c['yield_kg_ha'] * min(yield_f, 1.0)
    profit  = revenue - costs['total_cost']
    return round(profit, 2)
