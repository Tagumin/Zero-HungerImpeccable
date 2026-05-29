import { useCallback } from "react";
import { NOM_REVERSE, NOM_SEARCH, NOM_H } from "../utils/constants";

export function useGeocode() {
  const reverseGeocode = useCallback(async (latlng) => {
    const fallback = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;

    // Try Nominatim
    try {
      const r = await fetch(
        `${NOM_REVERSE}?lat=${latlng.lat}&lon=${latlng.lng}&format=json&zoom=14`,
        { headers: NOM_H, mode: "cors" },
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (d.display_name) {
        return d.display_name.split(",").slice(0, 3).join(", ");
      }
    } catch (e) {
      // Nominatim failed
    }

    // Fallback: BigDataCloud
    try {
      const r = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latlng.lat}&longitude=${latlng.lng}&localityLanguage=en`,
        { mode: "cors" },
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (d.city && d.countryName) {
        return `${d.city}, ${d.locality || d.principalSubdivision || ""}, ${d.countryName}`
          .replace(/, ,/g, ",")
          .replace(/, $/, "");
      }
      if (d.locality) return d.locality;
    } catch (e) {
      // Both failed
    }

    return fallback;
  }, []);

  const searchLocations = useCallback(async (query) => {
    try {
      const r = await fetch(
        `${NOM_SEARCH}?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=id`,
        { headers: NOM_H, mode: "cors" },
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      return d.map((item) => ({
        name: item.display_name.split(",").slice(0, 3).join(", "),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    } catch (e) {
      return [];
    }
  }, []);

  return { reverseGeocode, searchLocations };
}
