export const COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#9b59b6",
  "#f39c12",
  "#1abc9c",
  "#e67e22",
  "#e91e63",
];

export const OSRM_ROUTE = "https://router.project-osrm.org/route/v1/driving/";
export const OSRM_TABLE = "https://router.project-osrm.org/table/v1/driving/";
export const NOM_SEARCH = "https://nominatim.openstreetmap.org/search";
export const NOM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

export const NOM_H = {
  "Accept-Language": "en",
  "User-Agent": "FoodDistributionACO/1.0",
};

export const DEFAULT_ACO_PARAMS = {
  nAnts: 30,
  nIter: 80,
  alpha: 1.0,
  beta: 3.0,
  rho: 0.3,
  Q: 100,
};
