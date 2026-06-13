import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import Navbar from "@/components/layout/Navbar";
import "./CostOptimizer.css";

export default function CostOptimizer() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("rice");
  const [optMode, setOptMode] = useState("standard"); // standard, compare, hybrid
  const [algo, setAlgo] = useState("PSO");
  const [iterations, setIterations] = useState(50);

  const [customParams, setCustomParams] = useState({
    price_per_kg: 0,
    yield_kg_ha: 0,
    water_m3_ha: 0,
    fert_kg_ha: 0,
    labor_hours_ha: 0,
    water_per_m3: 0,
    fert_per_kg: 0,
    labor_per_hour: 0,
  });
  const [isParamsCollapsed, setIsParamsCollapsed] = useState(true);
  const [useCustomParams, setUseCustomParams] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState(""); // running, done, error

  const [isComparing, setIsComparing] = useState(false);
  const [isHybrid, setIsHybrid] = useState(false);

  // Results
  const [result, setResult] = useState(null);
  const [compResult, setCompResult] = useState(null);
  const [hybridResult, setHybridResult] = useState(null);
  const [sensResult, setSensResult] = useState(null);

  // Sensitivity state
  const [sensWater, setSensWater] = useState(0.70);
  const [sensFert, setSensFert] = useState(0.70);
  const [sensLabor, setSensLabor] = useState(0.70);

  // Collapse states
  const [isPrimaryCollapsed, setIsPrimaryCollapsed] = useState(false);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [isCompCollapsed, setIsCompCollapsed] = useState(false);
  const [isHybridCollapsed, setIsHybridCollapsed] = useState(false);
  const [isSensCollapsed, setIsSensCollapsed] = useState(false);

  // Charts
  const convChartRef = useRef(null);
  const hybChartRef = useRef(null);
  const sensChartRef = useRef(null);
  const convChartInst = useRef(null);
  const hybChartInst = useRef(null);
  const sensChartInst = useRef(null);
  const sensTimer = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/crops")
      .then(res => res.json())
      .then(data => { setCrops(data); if (data.length > 0) setSelectedCrop(data[0]); })
      .catch(err => console.error("Failed to fetch crops:", err));
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      fetch(`http://127.0.0.1:5001/crop_defaults/${selectedCrop}`)
        .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then(data => {
          setCustomParams({
            price_per_kg: data.price_per_kg || 0,
            yield_kg_ha: data.yield_kg_ha || 0,
            water_m3_ha: data.water_m3_ha || 0,
            fert_kg_ha: data.fert_kg_ha || 0,
            labor_hours_ha: data.labor_hours_ha || 0,
            water_per_m3: data.water_per_m3 || 0,
            fert_per_kg: data.fert_per_kg || 0,
            labor_per_hour: data.labor_per_hour || 0,
          });
        })
        .catch(err => console.error("Failed to fetch crop defaults:", err));
    }
  }, [selectedCrop]);

  useEffect(() => {
    if (selectedCrop) {
      clearTimeout(sensTimer.current);
      sensTimer.current = setTimeout(fetchSensitivity, 300);
    }
  }, [selectedCrop, sensWater, sensFert, sensLabor, customParams, useCustomParams]);

  useEffect(() => {
    if (result && !isChartCollapsed) {
      // Small timeout to ensure canvas is painted if just uncollapsed
      setTimeout(() => drawChart(result.history), 0);
    }
  }, [result, isChartCollapsed]);

  useEffect(() => {
    if (compResult && !isChartCollapsed) {
      setTimeout(() => drawComparisonChart(compResult.results.PSO.history, compResult.results.GA.history), 0);
    }
  }, [compResult, isChartCollapsed]);

  useEffect(() => {
    if (hybridResult && !isHybridCollapsed) {
      setTimeout(() => {
        drawHybridChart(hybridResult.pso_history, hybridResult.ga_history);
        document.getElementById("hybrid-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [hybridResult, isHybridCollapsed]);

  const setStatus = (msg, type) => {
    setStatusMsg(msg);
    setStatusType(type);
  };

  const clearAll = () => {
    setResult(null);
    setCompResult(null);
    setHybridResult(null);
    setStatusMsg("");
    setStatusType("");
    if (convChartInst.current) {
      convChartInst.current.destroy();
      convChartInst.current = null;
    }
    if (hybChartInst.current) {
      hybChartInst.current.destroy();
      hybChartInst.current = null;
    }
  };

  const drawChart = (history) => {
    if (convChartInst.current) convChartInst.current.destroy();
    if (!convChartRef.current) return;
    convChartInst.current = new Chart(convChartRef.current, {
      type: "line",
      data: {
        labels: history.map((_, i) => i + 1),
        datasets: [{
          label: "Best profit ($/ha)",
          data: history,
          borderColor: "#2E7D32",
          backgroundColor: "rgba(46,125,50,0.08)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: "Iteration", font: { size: 12, weight: 600 } }, ticks: { autoSkip: true, maxTicksLimit: 12 } },
          y: { title: { display: true, text: "Profit ($/ha)", font: { size: 12, weight: 600 } }, ticks: { callback: v => "$" + v.toLocaleString() } }
        }
      }
    });
  };

  const drawComparisonChart = (psoHistory, gaHistory) => {
    if (convChartInst.current) convChartInst.current.destroy();
    if (!convChartRef.current) return;
    const maxLen = Math.max(psoHistory.length, gaHistory.length);
    convChartInst.current = new Chart(convChartRef.current, {
      type: "line",
      data: {
        labels: Array.from({ length: maxLen }, (_, i) => i + 1),
        datasets: [
          { label: "PSO", data: psoHistory, borderColor: "#2E7D32", backgroundColor: "rgba(46,125,50,0.08)", fill: false, tension: 0.35, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 },
          { label: "Genetic Algorithm", data: gaHistory, borderColor: "#F57F17", backgroundColor: "rgba(245,127,23,0.08)", fill: false, tension: 0.35, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { boxWidth: 14, padding: 15, font: { size: 12, weight: 600 } } } },
        scales: {
          x: { title: { display: true, text: "Iteration", font: { size: 12, weight: 600 } }, ticks: { autoSkip: true, maxTicksLimit: 12 } },
          y: { title: { display: true, text: "Profit ($/ha)", font: { size: 12, weight: 600 } }, ticks: { callback: v => "$" + v.toLocaleString() } }
        }
      }
    });
  };

  const drawHybridChart = (psoHistory, gaHistory) => {
    if (hybChartInst.current) hybChartInst.current.destroy();
    if (!hybChartRef.current) return;
    const psoLen = psoHistory.length;
    const gaLen = gaHistory.length;
    const labels = Array.from({ length: psoLen + gaLen }, (_, i) => i + 1);
    const psoData = [...psoHistory, ...Array(gaLen).fill(null)];
    const gaData = [...Array(psoLen).fill(null), ...gaHistory];
    const bridgeData = Array(psoLen + gaLen).fill(null);
    bridgeData[psoLen - 1] = psoHistory[psoLen - 1];
    bridgeData[psoLen] = gaHistory[0];
    hybChartInst.current = new Chart(hybChartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "PSO Phase", data: psoData, borderColor: "#2E7D32", backgroundColor: "rgba(46,125,50,0.10)", borderWidth: 3, fill: true, tension: 0.35, pointRadius: 0 },
          { label: "GA Phase", data: gaData, borderColor: "#6A1B9A", backgroundColor: "rgba(106,27,154,0.15)", borderWidth: 3, fill: true, tension: 0.35, pointRadius: 0 },
          { label: "Transition", data: bridgeData, borderColor: "#1976D2", borderWidth: 3, borderDash: [5, 5], fill: false, tension: 0, pointRadius: 6, pointBackgroundColor: "#1976D2", pointBorderColor: "#fff" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: "Generation / Iteration", font: { size: 11, weight: 600 } }, ticks: { autoSkip: true, maxTicksLimit: 12 } },
          y: { title: { display: true, text: "Profit ($/ha)", font: { size: 11, weight: 600 } }, ticks: { callback: v => "$" + v.toLocaleString() } }
        }
      }
    });
  };

  const drawSensitivityChart = (data) => {
    if (sensChartInst.current) sensChartInst.current.destroy();
    if (!sensChartRef.current) return;
    sensChartInst.current = new Chart(sensChartRef.current, {
      type: "line",
      data: {
        labels: data.ratio_range.map(r => r.toFixed(2)),
        datasets: [
          { label: "Water", data: data.water_curve, borderColor: "#1976D2", borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 5 },
          { label: "Fertilizer", data: data.fert_curve, borderColor: "#2E7D32", borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 5 },
          { label: "Labor", data: data.labor_curve, borderColor: "#F57F17", borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 5 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
          annotation: {
            annotations: {
              lineW: { type: "line", xMin: sensWater.toFixed(2), xMax: sensWater.toFixed(2), borderColor: "#1976D2", borderDash: [4, 4], borderWidth: 1 },
              lineF: { type: "line", xMin: sensFert.toFixed(2), xMax: sensFert.toFixed(2), borderColor: "#2E7D32", borderDash: [4, 4], borderWidth: 1 },
              lineL: { type: "line", xMin: sensLabor.toFixed(2), xMax: sensLabor.toFixed(2), borderColor: "#F57F17", borderDash: [4, 4], borderWidth: 1 }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: "Allocation Ratio (0.0 → 1.0)", font: { size: 11, weight: 600 } }, ticks: { maxTicksLimit: 10 } },
          y: { title: { display: true, text: "Est. Profit ($/ha)", font: { size: 11, weight: 600 } }, ticks: { callback: v => "$" + v.toLocaleString() } }
        }
      }
    });
  };

  const runOptimization = async () => {
    setStatus(`Running ${algo} on "${selectedCrop}" for ${iterations} iterations…`, "running");
    setIsComparing(false);
    try {
      const res = await fetch("http://127.0.0.1:5001/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: selectedCrop, algorithm: algo, iterations, custom_params: useCustomParams ? customParams : null })
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setResult(data);
      setIsPrimaryCollapsed(false);
      setIsChartCollapsed(false);
      
      if (data.best_profit < 0) {
        setStatus(`Optimization complete. Estimated loss: $${Math.abs(data.best_profit).toLocaleString()}/ha`, "error");
      } else {
        setStatus(`Done! Best profit: $${data.best_profit.toLocaleString()}/ha`, "done");
      }
    } catch(err) {
      setStatus("Error: " + err.message, "error");
    }
  };

  const runComparison = async () => {
    setStatus(`Comparing PSO vs GA for ${iterations} iterations…`, "running");
    setIsComparing(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: selectedCrop, iterations, custom_params: useCustomParams ? customParams : null })
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setCompResult(data);
      setIsCompCollapsed(false);
      setIsChartCollapsed(false);
      setStatus(`Comparison done. Winner: ${data.winner}`, "done");
    } catch(err) {
      setStatus("Error: " + err.message, "error");
    }
  };

  const runHybrid = async () => {
    setStatus(`Running Hybrid PSO→GA on "${selectedCrop}" — Phase 1: PSO, Phase 2: GA…`, "running");
    setIsHybrid(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/hybrid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: selectedCrop, iterations, custom_params: useCustomParams ? customParams : null })
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setHybridResult(data);
      setIsHybridCollapsed(false);
      
      const sign = data.improvement >= 0 ? "+" : "";
      if (data.best_profit < 0) {
        setStatus(`Hybrid done! PSO loss: $${Math.abs(data.pso_profit).toLocaleString()} → GA refined loss: $${Math.abs(data.best_profit).toLocaleString()}`, "error");
      } else {
        setStatus(`Hybrid done! PSO: $${data.pso_profit.toLocaleString()} → GA refined: $${data.best_profit.toLocaleString()} (${sign}${data.improvement_pct}%)`, "done");
      }
    } catch(err) {
      setStatus("Error: " + err.message, "error");
    }
  };

  const fetchSensitivity = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5001/sensitivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: selectedCrop, water_ratio: sensWater, fert_ratio: sensFert, labor_ratio: sensLabor, custom_params: useCustomParams ? customParams : null })
      });
      if (!res.ok) return;
      const data = await res.json();
      setSensResult(data);
      setTimeout(() => drawSensitivityChart(data), 0);
    } catch (err) {
      console.error(err);
    }
  };

  const onSensSlider = (type, val) => {
    const v = parseFloat(val);
    if (type === "water") setSensWater(v);
    else if (type === "fert") setSensFert(v);
    else if (type === "labor") setSensLabor(v);
  };

  const updateParam = (key, val) => {
    setCustomParams(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  return (
    <div className="co-page-container">
      <Navbar />

      <header className="co-header" style={{ marginTop: "80px" }}>
        <div>
          <h1>Smart Agriculture System</h1>
          <p>Optimization Module — Resource Allocation</p>
        </div>
        <span className="sdg-badge">SDG 2 — Zero Hunger</span>
      </header>

      <div className="co-container">
        <div className="formula">
          Maximize Profit = Revenue − (Water Cost + Fertilizer Cost + Labor Cost)
        </div>

        {/* ── Top: Parameters + Primary Result ── */}
        <div className="grid-2" style={optMode === "standard" ? {} : { gridTemplateColumns: "1fr" }}>

          {/* Parameters Card */}
          <div className="card">
            <div className="card-title">Parameters</div>

            <div className="control-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
              <label>Crop</label>
              <select value={selectedCrop} onChange={(e) => { setSelectedCrop(e.target.value); clearAll(); }}>
                {crops.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "1rem", background: "var(--co-bg)", borderRadius: "8px", padding: "10px", border: "1px solid var(--co-gray-line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, color: "var(--co-text)" }}>
                  <input 
                    type="checkbox" 
                    checked={useCustomParams}
                    onChange={(e) => setUseCustomParams(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  Use Custom Crop & Cost Settings
                </label>
                <button 
                  className="co-collapse-btn" 
                  onClick={() => setIsParamsCollapsed(!isParamsCollapsed)}
                  style={{ background: "transparent", border: "none", fontSize: "1rem", cursor: "pointer" }}
                >
                  {isParamsCollapsed ? "+" : "−"}
                </button>
              </div>
              
              {!isParamsCollapsed && (
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", opacity: useCustomParams ? 1 : 0.5, pointerEvents: useCustomParams ? "auto" : "none" }}>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Price ($/kg)</label>
                    <input type="number" step="0.01" value={customParams.price_per_kg} onChange={e => updateParam('price_per_kg', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Yield (kg/ha)</label>
                    <input type="number" step="100" value={customParams.yield_kg_ha} onChange={e => updateParam('yield_kg_ha', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Water Req (m³/ha)</label>
                    <input type="number" step="10" value={customParams.water_m3_ha} onChange={e => updateParam('water_m3_ha', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Fertilizer Req (kg/ha)</label>
                    <input type="number" step="10" value={customParams.fert_kg_ha} onChange={e => updateParam('fert_kg_ha', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Labor Req (hours/ha)</label>
                    <input type="number" step="5" value={customParams.labor_hours_ha} onChange={e => updateParam('labor_hours_ha', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <hr style={{ margin: "0.5rem 0", borderColor: "var(--co-gray-line)" }} />
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Water Cost ($/m³)</label>
                    <input type="number" step="0.01" value={customParams.water_per_m3} onChange={e => updateParam('water_per_m3', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Fertilizer Cost ($/kg)</label>
                    <input type="number" step="0.01" value={customParams.fert_per_kg} onChange={e => updateParam('fert_per_kg', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                  <div className="param-input-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--co-text-muted)" }}>Labor Cost ($/hr)</label>
                    <input type="number" step="0.5" value={customParams.labor_per_hour} onChange={e => updateParam('labor_per_hour', e.target.value)} style={{ width: "80px", padding: "4px", fontSize: "0.8rem", textAlign: "right" }} />
                  </div>
                </div>
              )}
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--co-text-muted)", margin: "1.25rem 0 0.4rem", fontWeight: 600 }}>Optimization Mode</p>
            <div className="algo-group">
              <button className={`algo-btn ${optMode === "standard" ? "active" : ""}`} onClick={() => { setOptMode("standard"); clearAll(); }}>Standard</button>
              <button className={`algo-btn ${optMode === "compare" ? "active" : ""}`} onClick={() => { setOptMode("compare"); clearAll(); }}>Compare</button>
              <button className={`algo-btn ${optMode === "hybrid" ? "active" : ""}`} onClick={() => { setOptMode("hybrid"); clearAll(); }}>Hybrid</button>
            </div>

            {optMode === "standard" && (
              <>
                <p style={{ fontSize: "0.82rem", color: "var(--co-text-muted)", margin: "1.25rem 0 0.4rem", fontWeight: 600 }}>Algorithm Engine</p>
                <div className="algo-group">
                  <button className={`algo-btn ${algo === "PSO" ? "active" : ""}`} onClick={() => { setAlgo("PSO"); clearAll(); }}>PSO</button>
                  <button className={`algo-btn ${algo === "GA" ? "active" : ""}`} onClick={() => { setAlgo("GA"); clearAll(); }}>Genetic Algorithm</button>
                </div>
              </>
            )}

            <div className="control-row" style={{ marginTop: "1.25rem" }}>
              <label>Iterations</label>
              <input type="range" min="20" max="150" step="10" value={iterations} onChange={(e) => setIterations(parseInt(e.target.value))} />
              <span className="val-badge">{iterations}</span>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem" }}>
              <button
                className={`run-btn ${optMode === "compare" ? "compare" : optMode === "hybrid" ? "hybrid" : ""}`}
                style={{ flex: 1, marginTop: 0 }}
                onClick={() => {
                  if (optMode === "standard") runOptimization();
                  else if (optMode === "compare") runComparison();
                  else if (optMode === "hybrid") runHybrid();
                }}
                disabled={statusType === "running"}
              >
                {statusType === "running" ? "Running…" :
                  optMode === "standard" ? "Run Optimization" :
                  optMode === "compare" ? "Compare Algorithms" :
                  "Run Hybrid PSO→GA"
                }
              </button>

              <button
                className="algo-btn"
                onClick={clearAll}
                disabled={statusType === "running"}
                style={{ padding: "0 1.25rem", margin: 0, fontWeight: 600, color: "var(--co-text)", background: "transparent", border: "1px solid var(--co-gray-line)" }}
              >
                Clear All
              </button>
            </div>

            <div className={`status ${statusType}`} style={{ display: statusMsg ? "block" : "none" }}>{statusMsg}</div>
          </div>

          {/* Primary Results Card */}
          {optMode === "standard" && (
            <div className={`card ${isPrimaryCollapsed ? "collapsed" : ""}`}>
            <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isPrimaryCollapsed ? 0 : undefined }}>
              <span>Primary Execution</span>
              <button className="co-collapse-btn" onClick={() => setIsPrimaryCollapsed(!isPrimaryCollapsed)}>
                {isPrimaryCollapsed ? "+" : "−"}
              </button>
            </div>

            {!isPrimaryCollapsed && (
              <>
                <div className="metrics-grid">
                  <div className="metric">
                    <div className="metric-label">Best Profit ($/ha)</div>
                    <div className={`metric-value ${result && result.best_profit < 0 ? "red" : "green"}`}>
                      {result ? (result.best_profit < 0 ? `-$${Math.abs(result.best_profit).toLocaleString()}` : `$${result.best_profit.toLocaleString()}`) : "—"}
                    </div>
                  </div>
                  <div className="metric amber-left">
                    <div className="metric-label">Revenue ($/ha)</div>
                    <div className="metric-value">{result ? `$${result.revenue.toLocaleString()}` : "—"}</div>
                  </div>
                  <div className="metric blue-left">
                    <div className="metric-label">Total Cost ($/ha)</div>
                    <div className="metric-value amber">{result ? `$${result.total_cost.toLocaleString()}` : "—"}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <div className="metric blue-left">
                    <div className="metric-label">Iterations Completed</div>
                    <div className="metric-value blue">{result ? result.iterations : "—"}</div>
                  </div>
                </div>

                <p className="section-eyebrow">Optimal Resource Allocation</p>

                {result && (() => {
                  // Derive actual usage ratios from cost breakdown (works with old & new backend)
                  const wR = result.water_r != null ? result.water_r
                    : (customParams.water_m3_ha > 0 && customParams.water_per_m3 > 0
                        ? result.water_cost / (customParams.water_m3_ha * customParams.water_per_m3)
                        : null);
                  const fR = result.fert_r != null ? result.fert_r
                    : (customParams.fert_kg_ha > 0 && customParams.fert_per_kg > 0
                        ? result.fert_cost / (customParams.fert_kg_ha * customParams.fert_per_kg)
                        : null);
                  const lR = result.labor_r != null ? result.labor_r
                    : (customParams.labor_hours_ha > 0 && customParams.labor_per_hour > 0
                        ? result.labor_cost / (customParams.labor_hours_ha * customParams.labor_per_hour)
                        : null);

                  return (
                    <>
                      <div style={{ padding: "12px", background: "var(--co-green-pale)", border: "1px solid var(--co-green-light)", borderRadius: "8px", marginBottom: "1.25rem", color: "var(--co-green-dark)", fontSize: "0.88rem", lineHeight: "1.4" }}>
                        <strong>Insight:</strong> For <strong>{selectedCrop}</strong> cultivation, the maximum profit of <strong>${result.best_profit.toLocaleString()}</strong> per hectare can be achieved by utilizing <strong>{wR != null ? (wR * 100).toFixed(1) : result.water_pct}%</strong> of the available water resources, <strong>{fR != null ? (fR * 100).toFixed(1) : result.fert_pct}%</strong> of the fertilizer resources, and <strong>{lR != null ? (lR * 100).toFixed(1) : result.labor_pct}%</strong> of the labor resources.
                      </div>

                      <div className="alloc-row" style={{ marginBottom: "1.2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                          <strong>Water Usage</strong>
                          <strong style={{ color: "var(--co-text-muted)" }}>${result.water_cost.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "0.4rem" }}>
                          {wR != null
                            ? <span>{(wR * customParams.water_m3_ha).toFixed(1)} / {customParams.water_m3_ha} m³/ha</span>
                            : <span>—</span>}
                          <span>{wR != null ? `${(wR * 100).toFixed(1)}%` : `${result.water_pct}%`}</span>
                        </div>
                        <div className="bar-bg"><div className="bar-fill" style={{ background: "#1976D2", width: wR != null ? `${Math.min(wR * 100, 100)}%` : `${result.water_pct ?? 0}%` }}></div></div>
                      </div>

                      <div className="alloc-row" style={{ marginBottom: "1.2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                          <strong>Fertilizer Usage</strong>
                          <strong style={{ color: "var(--co-text-muted)" }}>${result.fert_cost.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "0.4rem" }}>
                          {fR != null
                            ? <span>{(fR * customParams.fert_kg_ha).toFixed(1)} / {customParams.fert_kg_ha} kg/ha</span>
                            : <span>—</span>}
                          <span>{fR != null ? `${(fR * 100).toFixed(1)}%` : `${result.fert_pct}%`}</span>
                        </div>
                        <div className="bar-bg"><div className="bar-fill" style={{ background: "#2E7D32", width: fR != null ? `${Math.min(fR * 100, 100)}%` : `${result.fert_pct ?? 0}%` }}></div></div>
                      </div>

                      <div className="alloc-row" style={{ marginBottom: "1.2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                          <strong>Labor Usage</strong>
                          <strong style={{ color: "var(--co-text-muted)" }}>${result.labor_cost.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "0.4rem" }}>
                          {lR != null
                            ? <span>{(lR * customParams.labor_hours_ha).toFixed(1)} / {customParams.labor_hours_ha} hrs/ha</span>
                            : <span>—</span>}
                          <span>{lR != null ? `${(lR * 100).toFixed(1)}%` : `${result.labor_pct}%`}</span>
                        </div>
                        <div className="bar-bg"><div className="bar-fill" style={{ background: "#F57F17", width: lR != null ? `${Math.min(lR * 100, 100)}%` : `${result.labor_pct ?? 0}%` }}></div></div>
                      </div>
                    </>
                  );
                })()}
                
                {result && result.custom_params && (
                  <div style={{ marginTop: "1.5rem", background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                    <p className="section-eyebrow" style={{ marginBottom: "0.5rem" }}>Parameters Used for Optimization</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Price:</span> <span>${result.custom_params.price_per_kg}/kg</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Yield:</span> <span>{result.custom_params.yield_kg_ha} kg/ha</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Water Req:</span> <span>{result.custom_params.water_m3_ha} m³/ha</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Fert Req:</span> <span>{result.custom_params.fert_kg_ha} kg/ha</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Labor Req:</span> <span>{result.custom_params.labor_hours_ha} hrs/ha</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Water Cost:</span> <span>${result.custom_params.water_per_m3}/m³</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Fert Cost:</span> <span>${result.custom_params.fert_per_kg}/kg</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--co-text-muted)" }}>Labor Cost:</span> <span>${result.custom_params.labor_per_hour}/hr</span></div>
                    </div>
                  </div>
                )}
              </>
            )}
            </div>
          )}
        </div>{/* end .grid-2 */}

        {/* ── Dashboard Grid: Convergence + Comparison + Hybrid + Sensitivity ── */}
        <div className="co-dashboard-grid">

          {/* Convergence Chart — full width */}
          {(optMode === "standard" || optMode === "compare") && (
            <div className={`card ${isChartCollapsed ? "collapsed" : ""}`} style={{ gridColumn: "1 / -1" }}>
            <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isChartCollapsed ? 0 : undefined }}>
              <span>Convergence Curve</span>
              <button className="co-collapse-btn" onClick={() => setIsChartCollapsed(!isChartCollapsed)}>
                {isChartCollapsed ? "+" : "−"}
              </button>
            </div>
            {!isChartCollapsed && (
              <>
                <p style={{ fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "1rem" }}>Best profit improving over iterations</p>
                <div className="chart-container">
                  <canvas ref={convChartRef}></canvas>
                </div>
              </>
            )}
            </div>
          )}

          {/* Comparison Results */}
          {optMode === "compare" && isComparing && compResult && (
            <div className={`card ${isCompCollapsed ? "collapsed" : ""}`} style={{ gridColumn: "1 / -1" }}>
              <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isCompCollapsed ? 0 : undefined }}>
                <span>Algorithm Comparison</span>
                <button className="co-collapse-btn" onClick={() => setIsCompCollapsed(!isCompCollapsed)}>
                  {isCompCollapsed ? "+" : "−"}
                </button>
              </div>

              {!isCompCollapsed && (
                <>
                  <div className="winner-badge">Winner: {compResult.winner === "PSO" ? "PSO" : "Genetic Algorithm"}</div>
                  <p style={{ fontSize: "0.88rem", color: "var(--co-text-muted)", marginBottom: "1.25rem" }}>
                    Comparison for <strong>{compResult.crop}</strong>
                  </p>
                  <div className="comparison-grid">
                    {/* PSO column */}
                    {(() => {
                      const p = compResult.results.PSO;
                      const wR = p.water_r != null ? p.water_r : (customParams.water_m3_ha > 0 && customParams.water_per_m3 > 0 ? p.water_cost / (customParams.water_m3_ha * customParams.water_per_m3) : null);
                      const fR = p.fert_r  != null ? p.fert_r  : (customParams.fert_kg_ha  > 0 && customParams.fert_per_kg   > 0 ? p.fert_cost  / (customParams.fert_kg_ha  * customParams.fert_per_kg)   : null);
                      const lR = p.labor_r != null ? p.labor_r : (customParams.labor_hours_ha > 0 && customParams.labor_per_hour > 0 ? p.labor_cost / (customParams.labor_hours_ha * customParams.labor_per_hour) : null);
                      return (
                        <div className="algo-result">
                          <div className="algo-result-title">PSO</div>
                          <div className="result-item"><span>Best Profit</span><span>${p.best_profit.toLocaleString()}</span></div>
                          <div className="result-item"><span>Revenue</span><span>${p.revenue.toLocaleString()}</span></div>
                          <div className="result-item"><span>Total Cost</span><span>${p.total_cost.toLocaleString()}</span></div>
                          <div className="result-item"><span>Iterations</span><span>{p.iterations}</span></div>
                          <hr style={{ margin: "0.8rem 0", border: "none", borderTop: "1px solid var(--co-gray-line)" }} />
                          <div className="result-item"><span>Water</span><span>{wR != null ? `${(wR * customParams.water_m3_ha).toFixed(1)} / ${customParams.water_m3_ha} m³/ha (${(wR*100).toFixed(1)}%)` : `${p.water_pct}%`}</span></div>
                          <div className="result-item"><span>Fertilizer</span><span>{fR != null ? `${(fR * customParams.fert_kg_ha).toFixed(1)} / ${customParams.fert_kg_ha} kg/ha (${(fR*100).toFixed(1)}%)` : `${p.fert_pct}%`}</span></div>
                          <div className="result-item"><span>Labor</span><span>{lR != null ? `${(lR * customParams.labor_hours_ha).toFixed(1)} / ${customParams.labor_hours_ha} hrs/ha (${(lR*100).toFixed(1)}%)` : `${p.labor_pct}%`}</span></div>
                        </div>
                      );
                    })()}
                    {/* GA column */}
                    {(() => {
                      const g = compResult.results.GA;
                      const wR = g.water_r != null ? g.water_r : (customParams.water_m3_ha > 0 && customParams.water_per_m3 > 0 ? g.water_cost / (customParams.water_m3_ha * customParams.water_per_m3) : null);
                      const fR = g.fert_r  != null ? g.fert_r  : (customParams.fert_kg_ha  > 0 && customParams.fert_per_kg   > 0 ? g.fert_cost  / (customParams.fert_kg_ha  * customParams.fert_per_kg)   : null);
                      const lR = g.labor_r != null ? g.labor_r : (customParams.labor_hours_ha > 0 && customParams.labor_per_hour > 0 ? g.labor_cost / (customParams.labor_hours_ha * customParams.labor_per_hour) : null);
                      return (
                        <div className="algo-result ga">
                          <div className="algo-result-title">Genetic Algorithm</div>
                          <div className="result-item"><span>Best Profit</span><span>${g.best_profit.toLocaleString()}</span></div>
                          <div className="result-item"><span>Revenue</span><span>${g.revenue.toLocaleString()}</span></div>
                          <div className="result-item"><span>Total Cost</span><span>${g.total_cost.toLocaleString()}</span></div>
                          <div className="result-item"><span>Iterations</span><span>{g.iterations}</span></div>
                          <hr style={{ margin: "0.8rem 0", border: "none", borderTop: "1px solid var(--co-gray-line)" }} />
                          <div className="result-item"><span>Water</span><span>{wR != null ? `${(wR * customParams.water_m3_ha).toFixed(1)} / ${customParams.water_m3_ha} m³/ha (${(wR*100).toFixed(1)}%)` : `${g.water_pct}%`}</span></div>
                          <div className="result-item"><span>Fertilizer</span><span>{fR != null ? `${(fR * customParams.fert_kg_ha).toFixed(1)} / ${customParams.fert_kg_ha} kg/ha (${(fR*100).toFixed(1)}%)` : `${g.fert_pct}%`}</span></div>
                          <div className="result-item"><span>Labor</span><span>{lR != null ? `${(lR * customParams.labor_hours_ha).toFixed(1)} / ${customParams.labor_hours_ha} hrs/ha (${(lR*100).toFixed(1)}%)` : `${g.labor_pct}%`}</span></div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Hybrid Result */}
          {optMode === "hybrid" && isHybrid && hybridResult && (
            <div className={`card ${isHybridCollapsed ? "collapsed" : ""}`} id="hybrid-card" style={{ gridColumn: "1 / -1" }}>
              <div className="card-title purple" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isHybridCollapsed ? 0 : undefined }}>
                <span>Hybrid PSO-GA — Two-Phase Optimization</span>
                <button className="co-collapse-btn" onClick={() => setIsHybridCollapsed(!isHybridCollapsed)}>
                  {isHybridCollapsed ? "+" : "−"}
                </button>
              </div>

              {!isHybridCollapsed && (
                <>
                  {/* Pipeline */}
                  <div className="pipeline">
                    <div className="pipeline-box pso">
                      <div className="pipeline-icon">1</div>
                      <div className="pipeline-label pso">Phase 1 — PSO</div>
                      <div className="pipeline-sub">Exploration</div>
                      <div className="pipeline-value green">${hybridResult.pso_profit.toLocaleString()}</div>
                    </div>
                    <div className="pipeline-arrow">→</div>
                    <div className="pipeline-box seed">
                      <div className="pipeline-icon">2</div>
                      <div className="pipeline-label seed">Seeds GA</div>
                      <div className="pipeline-sub">PSO best → initial pop</div>
                      <div className="pipeline-value" style={{ color: "var(--co-blue)", fontSize: "0.75rem", marginTop: 6 }}>
                        {hybridResult.pso_iters} iters → seeds {hybridResult.ga_gens} GA gens
                      </div>
                    </div>
                    <div className="pipeline-arrow">→</div>
                    <div className="pipeline-box ga">
                      <div className="pipeline-icon">3</div>
                      <div className="pipeline-label ga">Phase 2 — GA</div>
                      <div className="pipeline-sub">Refinement</div>
                      <div className="pipeline-value purple">{hybridResult.ga_gens} gens</div>
                    </div>
                    <div className="pipeline-arrow">→</div>
                    <div className="pipeline-box final">
                      <div className="pipeline-icon">4</div>
                      <div className="pipeline-label final">Final Result</div>
                      <div className="pipeline-sub">Best profit</div>
                      <div className="pipeline-value amber">${hybridResult.best_profit.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Improvement strip */}
                  <div className="improvement-strip">
                    <div className="improv-item">
                      <div className="improv-label">PSO alone</div>
                      <div className="improv-val green">${hybridResult.pso_profit.toLocaleString()}</div>
                    </div>
                    <div className="improv-divider">→</div>
                    <div className="improv-item">
                      <div className="improv-label">Improvement</div>
                      <div className="improv-val purple">
                        {hybridResult.improvement >= 0 ? "+" : ""}${hybridResult.improvement.toLocaleString()} ({hybridResult.improvement >= 0 ? "+" : ""}{hybridResult.improvement_pct}%)
                      </div>
                    </div>
                    <div className="improv-divider">→</div>
                    <div className="improv-item">
                      <div className="improv-label">Hybrid Final</div>
                      <div className="improv-val amber">${hybridResult.best_profit.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Allocation + chart */}
                  <div className="grid-2">
                    <div>
                      <p className="section-eyebrow">Optimal Allocation (Hybrid)</p>

                      {(() => {
                        const wR = hybridResult.water_r != null ? hybridResult.water_r : (customParams.water_m3_ha > 0 && customParams.water_per_m3 > 0 ? hybridResult.water_cost / (customParams.water_m3_ha * customParams.water_per_m3) : null);
                        const fR = hybridResult.fert_r  != null ? hybridResult.fert_r  : (customParams.fert_kg_ha  > 0 && customParams.fert_per_kg   > 0 ? hybridResult.fert_cost  / (customParams.fert_kg_ha  * customParams.fert_per_kg)   : null);
                        const lR = hybridResult.labor_r != null ? hybridResult.labor_r : (customParams.labor_hours_ha > 0 && customParams.labor_per_hour > 0 ? hybridResult.labor_cost / (customParams.labor_hours_ha * customParams.labor_per_hour) : null);
                        return (
                          <>
                            <div style={{ padding: "12px", background: "var(--co-purple-light)", border: "1px solid #D1C4E9", borderRadius: "8px", marginBottom: "1.25rem", color: "var(--co-purple)", fontSize: "0.88rem", lineHeight: "1.4" }}>
                              <strong>Insight:</strong> For <strong>{selectedCrop}</strong> cultivation, the maximum profit of <strong>${hybridResult.best_profit.toLocaleString()}</strong> per hectare can be achieved by utilizing <strong>{wR != null ? (wR * 100).toFixed(1) : hybridResult.water_pct}%</strong> of the available water resources, <strong>{fR != null ? (fR * 100).toFixed(1) : hybridResult.fert_pct}%</strong> of the fertilizer resources, and <strong>{lR != null ? (lR * 100).toFixed(1) : hybridResult.labor_pct}%</strong> of the labor resources.
                            </div>

                            <div className="alloc-row" style={{ marginBottom: "1.2rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                                <strong>Water Usage</strong>
                                <strong style={{ color: "var(--co-text-muted)" }}>${hybridResult.water_cost.toLocaleString()}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "0.4rem" }}>
                                {wR != null ? <span>{(wR * customParams.water_m3_ha).toFixed(1)} / {customParams.water_m3_ha} m³/ha</span> : <span>—</span>}
                                <span>{wR != null ? `${(wR * 100).toFixed(1)}%` : `${hybridResult.water_pct}%`}</span>
                              </div>
                              <div className="bar-bg"><div className="bar-fill" style={{ background: "#1976D2", width: `${Math.min((wR ?? hybridResult.water_pct / 100) * 100, 100)}%` }}></div></div>
                            </div>

                            <div className="alloc-row" style={{ marginBottom: "1.2rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                                <strong>Fertilizer Usage</strong>
                                <strong style={{ color: "var(--co-text-muted)" }}>${hybridResult.fert_cost.toLocaleString()}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "0.4rem" }}>
                                {fR != null ? <span>{(fR * customParams.fert_kg_ha).toFixed(1)} / {customParams.fert_kg_ha} kg/ha</span> : <span>—</span>}
                                <span>{fR != null ? `${(fR * 100).toFixed(1)}%` : `${hybridResult.fert_pct}%`}</span>
                              </div>
                              <div className="bar-bg"><div className="bar-fill" style={{ background: "#2E7D32", width: `${Math.min((fR ?? hybridResult.fert_pct / 100) * 100, 100)}%` }}></div></div>
                            </div>

                            <div className="alloc-row" style={{ marginBottom: "1.2rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                                <strong>Labor Usage</strong>
                                <strong style={{ color: "var(--co-text-muted)" }}>${hybridResult.labor_cost.toLocaleString()}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "0.4rem" }}>
                                {lR != null ? <span>{(lR * customParams.labor_hours_ha).toFixed(1)} / {customParams.labor_hours_ha} hrs/ha</span> : <span>—</span>}
                                <span>{lR != null ? `${(lR * 100).toFixed(1)}%` : `${hybridResult.labor_pct}%`}</span>
                              </div>
                              <div className="bar-bg"><div className="bar-fill" style={{ background: "#6A1B9A", width: `${Math.min((lR ?? hybridResult.labor_pct / 100) * 100, 100)}%` }}></div></div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="section-eyebrow">Two-Phase Convergence</p>
                      <div className="phase-legend">
                        <span className="phase-dot"><span className="dot" style={{ background: "#2E7D32" }}></span>PSO Exploration</span>
                        <span className="phase-dot"><span className="dot" style={{ background: "#6A1B9A" }}></span>GA Refinement</span>
                      </div>
                      <div className="hybrid-chart-container">
                        <canvas ref={hybChartRef}></canvas>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sensitivity Analysis — full width */}
          <div className={`card ${isSensCollapsed ? "collapsed" : ""}`} style={{ gridColumn: "1 / -1" }}>
            <div className="card-title blue" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isSensCollapsed ? 0 : undefined }}>
              <span>Sensitivity Analysis — How Ratios Affect Profit</span>
              <button className="co-collapse-btn" onClick={() => setIsSensCollapsed(!isSensCollapsed)}>
                {isSensCollapsed ? "+" : "−"}
              </button>
            </div>

            {!isSensCollapsed && (
              <>
                <p style={{ fontSize: "0.85rem", color: "var(--co-text-muted)", marginBottom: "1.5rem" }}>
                  Move the sliders to set resource allocation ratios and instantly see how profit changes.
                  Each curve shows profit as that resource varies while the others stay fixed.
                </p>

                <div className="sens-sliders-grid">
                  <div className="sens-slider-card water">
                    <div className="sens-slider-header">
                      <span className="sens-slider-title water">Water Ratio</span>
                      <span className="sens-ratio-badge water">{sensWater.toFixed(2)}</span>
                    </div>
                    <input type="range" className="water-slider" min="0.01" max="1.0" step="0.01" value={sensWater} onChange={(e) => onSensSlider("water", e.target.value)} />
                    <div className="sens-sub">Current usage: <span>{Math.round(sensWater * 100)}%</span> of water need</div>
                  </div>

                  <div className="sens-slider-card fert">
                    <div className="sens-slider-header">
                      <span className="sens-slider-title fert">Fertilizer Ratio</span>
                      <span className="sens-ratio-badge fert">{sensFert.toFixed(2)}</span>
                    </div>
                    <input type="range" className="fert-slider" min="0.01" max="1.0" step="0.01" value={sensFert} onChange={(e) => onSensSlider("fert", e.target.value)} />
                    <div className="sens-sub">Current usage: <span>{Math.round(sensFert * 100)}%</span> of fert need</div>
                  </div>

                  <div className="sens-slider-card labor">
                    <div className="sens-slider-header">
                      <span className="sens-slider-title labor">Labor Ratio</span>
                      <span className="sens-ratio-badge labor">{sensLabor.toFixed(2)}</span>
                    </div>
                    <input type="range" className="labor-slider" min="0.01" max="1.0" step="0.01" value={sensLabor} onChange={(e) => onSensSlider("labor", e.target.value)} />
                    <div className="sens-sub">Current usage: <span>{Math.round(sensLabor * 100)}%</span> of labor need</div>
                  </div>
                </div>

                <div className="live-profit-box">
                  <div>
                    <div className="live-profit-label">Current Profit at these ratios</div>
                    <div className="live-profit-value">{sensResult ? `$${sensResult.current_profit.toLocaleString()}` : "$—"}</div>
                  </div>
                  <div className="live-cost-grid">
                    <div className="live-cost-item">
                      <div className="live-cost-label">Water Cost</div>
                      <div className="live-cost-val">{sensResult ? `$${sensResult.costs.water_cost.toLocaleString()}` : "—"}</div>
                    </div>
                    <div className="live-cost-item">
                      <div className="live-cost-label">Fertilizer Cost</div>
                      <div className="live-cost-val">{sensResult ? `$${sensResult.costs.fert_cost.toLocaleString()}` : "—"}</div>
                    </div>
                    <div className="live-cost-item">
                      <div className="live-cost-label">Labor Cost</div>
                      <div className="live-cost-val">{sensResult ? `$${sensResult.costs.labor_cost.toLocaleString()}` : "—"}</div>
                    </div>
                    <div className="live-cost-item">
                      <div className="live-cost-label">Total Cost</div>
                      <div className="live-cost-val">{sensResult ? `$${sensResult.costs.total_cost.toLocaleString()}` : "—"}</div>
                    </div>
                  </div>
                </div>

                {sensResult && (
                  <div style={{ marginBottom: "1rem" }}>
                    Most sensitive resource:
                    <span className={`sensitivity-badge ${sensResult.most_sensitive}`} style={{ marginLeft: "10px" }}>
                      {sensResult.most_sensitive === "water" ? "Water" : sensResult.most_sensitive === "fert" ? "Fertilizer" : "Labor"}
                    </span>
                  </div>
                )}

                <div className="sens-chart-container">
                  <canvas ref={sensChartRef}></canvas>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--co-text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
                  Steeper curve = more sensitive to that resource. Dashed line = current ratio.
                </p>
              </>
            )}
          </div>

        </div>{/* end .co-dashboard-grid */}
      </div>{/* end .co-container */}
    </div>
  );
}
