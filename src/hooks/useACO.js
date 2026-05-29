import { useCallback, useRef } from "react";
import { DEFAULT_ACO_PARAMS } from "../utils/constants";

export function useACO() {
  const abortRef = useRef(false);

  const runACO = useCallback(
    async (distMatrix, params = DEFAULT_ACO_PARAMS) => {
      const { nAnts, nIter, alpha, beta, rho, Q } = params;
      const n = distMatrix.length - 1; // excluding origin (index 0)

      const eta = distMatrix.map((row, i) =>
        row.map((d, j) => (i === j || d === 0 || d === Infinity ? 0 : 1 / d)),
      );

      const tau = Array.from({ length: n + 1 }, () =>
        new Array(n + 1).fill(1.0),
      );

      let bestTour = null;
      let bestDist = Infinity;
      let convergenceIter = -1;
      let stagnation = 0;
      let prevBest = Infinity;

      const onProgress = (iter, currentBest) => {
        // This will be called externally
      };

      for (let iter = 0; iter < nIter; iter++) {
        if (abortRef.current) break;

        const allTours = [];
        const allDists = [];

        for (let ant = 0; ant < nAnts; ant++) {
          const visited = new Set();
          const tour = [];
          let cur = 0;

          for (let step = 0; step < n; step++) {
            let total = 0;
            const probs = [];

            for (let j = 1; j <= n; j++) {
              const di = j - 1;
              if (visited.has(di)) {
                probs.push(0);
                continue;
              }
              const p =
                Math.pow(tau[cur][j], alpha) * Math.pow(eta[cur][j], beta);
              probs.push(p);
              total += p;
            }

            let r = Math.random() * total;
            let chosen = -1;
            for (let j = 0; j < probs.length; j++) {
              r -= probs[j];
              if (r <= 0) {
                chosen = j;
                break;
              }
            }

            if (chosen < 0) {
              for (let j = 0; j < n; j++) {
                if (!visited.has(j)) {
                  chosen = j;
                  break;
                }
              }
            }

            visited.add(chosen);
            tour.push(chosen);
            cur = chosen + 1;
          }

          let d = distMatrix[0][tour[0] + 1];
          for (let i = 0; i < tour.length - 1; i++) {
            d += distMatrix[tour[i] + 1][tour[i + 1] + 1];
          }

          allTours.push(tour);
          allDists.push(d);

          if (d < bestDist) {
            bestDist = d;
            bestTour = [...tour];
          }
        }

        // Evaporation
        for (let i = 0; i <= n; i++) {
          for (let j = 0; j <= n; j++) {
            tau[i][j] *= 1 - rho;
          }
        }

        // Deposit
        for (let ant = 0; ant < nAnts; ant++) {
          const dep = Q / allDists[ant];
          const tour = allTours[ant];
          tau[0][tour[0] + 1] += dep;
          tau[tour[0] + 1][0] += dep;
          for (let i = 0; i < tour.length - 1; i++) {
            const a = tour[i] + 1;
            const b = tour[i + 1] + 1;
            tau[a][b] += dep;
            tau[b][a] += dep;
          }
        }

        const iterBestD = Math.min(...allDists);
        if (Math.abs(prevBest - iterBestD) < 0.001) {
          stagnation++;
          if (stagnation >= 10 && convergenceIter < 0) {
            convergenceIter = iter;
          }
        } else {
          stagnation = 0;
        }
        prevBest = iterBestD;

        // Yield control for UI updates
        if (iter % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      return { order: bestTour, dist: bestDist, convergenceIter };
    },
    [],
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  const resetAbort = useCallback(() => {
    abortRef.current = false;
  }, []);

  return { runACO, abort, resetAbort };
}
