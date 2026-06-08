import { useState, useEffect, useRef, useCallback } from "react";
import diseaseDB from "./diseaseDb";
import "./DiseaseCare.css";

export default function DiseaseCareSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [barWidth, setBarWidth] = useState(0);
  const [networkError, setNetworkError] = useState(false);

  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!result) return;
    setBarWidth(0);
    const timer = setTimeout(() => {
      setBarWidth(parseFloat(result.conf));
    }, 100);
    return () => clearTimeout(timer);
  }, [result]);

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [result]);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImageError(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = (e) => handleFile(e.target.files[0]);
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setImageError(true);
      setResult(null);
      return;
    }

    setImageError(false);
    setNetworkError(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      const diseaseLabel = data?.class || data?.disease || "Unknown_Disease";
      let confidence = 0;
      if (typeof data?.confidence === "number") {
        confidence = data.confidence;
      } else if (typeof data?.confidence === "string") {
        confidence = parseFloat(data.confidence.replace("%", ""));
      }

      const matchedDisease = diseaseDB.find(
         (d) => d.label === diseaseLabel,
      ) || {
        label: diseaseLabel,
        name: diseaseLabel.replace(/_/g, " "),
        sci: "Scientific classification pending",
        treatment: [
          "Please consult your local agricultural extension for specific treatments.",
        ],
        prevention: [
          "Ensure proper field drainage and monitor crops regularly.",
        ],
      };

      setResult({
        ...matchedDisease,
        conf: confidence,
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  const uploadZoneClass = [
    "upload-zone",
    dragOver ? "dragover" : "",
    preview ? "has-image" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Hero Banner */}
      <div className="hero-banner">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80"
          alt="Crop field"
          onError={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,#1a2e1a,#4a6741)";
            e.currentTarget.style.display = "block";
          }}
        />
        <div className="hero-banner-text">
          <h1>Disease Care</h1>
          <p>
            Our AI model analyzes crop images to identify diseases and recommend
            treatments instantly.
          </p>
        </div>
      </div>

      <div className="page-wrap">
        {/* Feature Cards */}
        <div className="features-preview" id="features-preview">
          {/* Card 1: Hero Asymmetrical Bento Card */}
          <div className="feature-card hero-card">
            <div className="hero-left">
              <div className="icon-container">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="oklch(60% 0.12 155)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h3>01 / Image Analysis</h3>
              <p>
                Upload a clear photo of your affected crop. Our model scans
                visual symptoms with high precision.
              </p>
            </div>
            <div className="hero-right">
              <div className="scanning-visual">
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />
                <div className="scan-box" />
                <div className="scan-line" />
                <svg
                  className="leaf-outline"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 3 1.5 5.5 3.5 7.5L12 22l6.5-2.5C20.5 17.5 22 15 22 12c0-5.5-4.5-10-10-10z" />
                  <path d="M12 2v20" />
                  <path d="M12 7c2.5 1 4 3 4 5" />
                  <path d="M12 12c2.5 1 4 3 4 5" />
                  <path d="M12 9c-2.5 1-4 3-4 5" />
                  <path d="M12 14c-2.5 1-4 3-4 5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Disease Detection */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--deep-green)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="22" y1="12" x2="18" y2="12" />
                <line x1="6" y1="12" x2="2" y2="12" />
                <line x1="12" y1="6" x2="12" y2="2" />
                <line x1="12" y1="22" x2="12" y2="18" />
              </svg>
            </div>
            <h3>02 / Disease Detection</h3>
            <p>
              Identifies common fungal, bacterial, and viral diseases across
              major crop types within seconds.
            </p>
          </div>

          {/* Card 3: Treatment Guide */}
          <div className="feature-card">
            <div className="icon-container">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>03 / Treatment Guide</h3>
            <p>
              Get actionable treatment recommendations and prevention tips
              tailored to the detected disease.
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <div className="card">
          <div className="card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
            <span className="card-header-label">Upload &amp; Analyse</span>
          </div>

          <p className="card-desc">
            Upload a photo of your crop — AI will scan it, identify diseases and
            recommend treatments instantly.
          </p>

          <div className="upload-layout">
            {networkError && (
              <div className="network-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Failed to connect to the AI server. Please ensure the backend is running on port 5000.</span>
              </div>
            )}
            
            <label>Crop Image</label>

            <div className="field">
              <div
                className={uploadZoneClass}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !preview && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleInputChange}
                />

                {preview ? (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      minHeight: 180,
                    }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="upload-preview"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="upload-remove-btn"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M4 12V4h8" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M40 12V4h-8" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 32v8h8" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M40 32v8h-8" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path
                          d="M22 32c-5 0-10-4-10-10 0-7 10-14 10-14s10 7 10 14c0 6-5 10-10 10z"
                          stroke="var(--deep-green)"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="oklch(90% 0.04 155 / 0.4)"
                        />
                        <path d="M22 32V18" stroke="var(--deep-green)" strokeWidth="1.25" strokeLinecap="round" opacity="0.5"/>
                      </svg>
                    </div>
                    <p>Drop your crop photo to scan</p>
                    <span>or click to browse · JPG, PNG, WEBP · Max 10 MB</span>
                  </div>
                )}
              </div>

              {imageError && (
                <span className="error-msg">
                  Please upload a crop image before analysing.
                </span>
              )}
            </div>

            <div className="upload-tip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>For best results, take a close-up photo of the affected leaf or stem in natural daylight.</span>
            </div>
          </div>

          <button
            className={`btn-analyze${loading ? " loading" : ""}`}
            onClick={runAnalysis}
            disabled={loading || !selectedFile}
            aria-label="Analyse uploaded crop image"
          >
            <div className="spinner" />
            <span className="btn-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Analyse Disease
            </span>
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="result-section visible" ref={resultRef}>
            <div className="intel-label">AI Output</div>

            <div className="result-header-group">
              <h2 className="result-header-title">Prediction Results</h2>
              <p className="result-header-subtitle">
                Your crop likely suffers from a detected disease based on visual
                pattern analysis.
              </p>
            </div>

            {/* Disease Hero */}
            <div className="result-hero">
              <div className="result-hero-header">
                <div>
                  <div className="ai-badge">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        marginRight: 6,
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    AI Analysis
                  </div>
                  <div className="result-disease-name">{result.name}</div>
                  <div className="result-disease-sub">{result.sci}</div>
                </div>
                <div className="confidence-block">
                  <div className="confidence-label">Model Confidence</div>
                  <div className="confidence-num">{result.conf}%</div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="conf-bar-wrap">
                <div className="conf-bar-label">Model Confidence</div>
                <div className="conf-bar-track">
                  <div
                    className="conf-bar-fill"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="intel-label">Crop Intelligence</div>

            <div className="results-grid">
              {/* Treatment */}
              <div className="info-card treatment-card">
                <div className="card-heading-group">
                  <div className="icon-badge">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <h4>Treatment Recommendation</h4>
                </div>
                <div className="tip-list">
                  {result.treatment.map((t, i) => (
                    <div className="tip-item" key={i}>
                      <svg
                        className="tip-bullet tip-bullet-treatment"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prevention */}
              <div className="info-card prevention-card">
                <div className="card-heading-group">
                  <div className="icon-badge">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h4>Prevention Tips</h4>
                </div>
                <div className="tip-list">
                  {result.prevention.map((p, i) => (
                    <div className="tip-item" key={i}>
                      <svg
                        className="tip-bullet tip-bullet-prevention"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
