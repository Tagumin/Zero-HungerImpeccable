import { OSRM_ROUTE, OSRM_TABLE } from "./constants";
import { haversine } from "./haversine";

export async function getRoute(from, to) {
  const url = `${OSRM_ROUTE}${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    if (d.code !== "Ok") throw new Error("Route not found");
    const rt = d.routes[0];
    return {
      dist: rt.distance / 1000,
      time: rt.duration / 60,
      geom: rt.geometry.coordinates.map((c) => [c[1], c[0]]),
    };
  } catch (e) {
    // Fallback: straight line
    const dist = haversine(from, to);
    return {
      dist,
      time: dist * 2,
      geom: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
    };
  }
}

export async function getDistanceMatrix(nodes) {
  try {
    const coords = nodes.map((n) => `${n.lng},${n.lat}`).join(";");
    const tableUrl = `${OSRM_TABLE}${coords}?annotations=distance`;
    const tableR = await fetch(tableUrl);
    if (!tableR.ok) throw new Error("HTTP " + tableR.status);
    const tableD = await tableR.json();
    if (tableD.code !== "Ok") throw new Error(tableD.message || tableD.code);
    return tableD.distances.map((row) =>
      row.map((v) => (v === null ? Infinity : v / 1000)),
    );
  } catch (e) {
    // Fallback to Haversine
    return Array.from({ length: nodes.length }, (_, i) =>
      Array.from({ length: nodes.length }, (_, j) =>
        i === j ? 0 : haversine(nodes[i], nodes[j]),
      ),
    );
  }
}
