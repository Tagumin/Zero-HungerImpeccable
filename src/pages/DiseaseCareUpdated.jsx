import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "./DiseaseCare.css";

// ─── Disease database ─────────────────────────────────────────────────────────
// TODO: Replace with API call to backend for real AI model data

const diseaseDB = [
  {
    name: "Rice Blast",
    sci: "Magnaporthe grisea",
    treatment: [
      "Apply tricyclazole or azoxystrobin fungicides",
      "Remove infected leaves immediately",
      "Drain fields for 5–7 days",
    ],
    prevention: [
      "Use resistant varieties (IR64, Mahsuri)",
      "Avoid excess nitrogen",
      "Split fertilizer application",
    ],
  },
  {
    name: "Bacterial Leaf Blight",
    sci: "Xanthomonas oryzae",
    treatment: [
      "Apply copper-based bactericides",
      "Remove infected plants",
      "Avoid flood-spread",
    ],
    prevention: [
      "Use resistant varieties",
      "Proper plant spacing",
      "Avoid excess nitrogen",
    ],
  },
  {
    name: "Yellow Rust",
    sci: "Puccinia striiformis",
    treatment: [
      "Apply propiconazole fungicide",
      "Remove infected debris",
      "Improve airflow between rows",
    ],
    prevention: [
      "Use resistant varieties",
      "Monitor at early stage",
      "Plant at correct season",
    ],
  },
  {
    name: "Northern Leaf Blight",
    sci: "Exserohilum turcicum",
    treatment: [
      "Apply mancozeb or chlorothalonil",
      "Remove crop residues",
      "Improve field drainage",
    ],
    prevention: [
      "Practice crop rotation",
      "Use resistant seeds",
      "Avoid overhead irrigation",
    ],
  },
  {
    name: "Late Blight",
    sci: "Phytophthora infestans",
    treatment: [
      "Apply metalaxyl + mancozeb",
      "Destroy all infected plants",
      "Avoid wetting leaves",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Ensure good drainage",
      "Monitor during cool wet weather",
    ],
  },
  {
    name: "Tomato Mosaic Virus",
    sci: "Tomato mosaic virus (ToMV)",
    treatment: [
      "Remove and destroy infected plants",
      "Disinfect tools with 10% bleach",
      "Control aphid vectors",
    ],
    prevention: [
      "Use virus-resistant varieties",
      "Avoid tobacco contamination",
      "Control insect populations",
    ],
  },
  {
    name: "Fusarium Wilt",
    sci: "Fusarium oxysporum",
    treatment: [
      "Apply carbendazim drench",
      "Remove and burn wilted plants",
      "Improve soil drainage",
    ],
    prevention: [
      "Practice 3–4 year crop rotation",
      "Use resistant seeds",
      "Treat seeds before planting",
    ],
  },
  {
    name: "Soybean Rust",
    sci: "Phakopsora pachyrhizi",
    treatment: [
      "Apply triazole or strobilurin fungicide",
      "Spray at first sign of pustules",
      "Repeat every 14–21 days",
    ],
    prevention: [
      "Plant early to avoid peak infection",
      "Monitor lower leaf surfaces",
      "Maintain proper plant spacing",
    ],
  },
  {
    name: "Black Sigatoka",
    sci: "Pseudocercospora fijiensis",
    treatment: [
      "Apply systemic fungicide (propiconazole)",
      "Remove heavily infected leaves",
      "De-leaf plants regularly",
    ],
    prevention: [
      "Use tolerant cultivars where available",
      "Ensure adequate plant spacing",
      "Use drip irrigation instead of overhead",
    ],
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function DiseaseNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <svg width="32" height="27" viewBox="0 0 32 27" fill="none">
            <path d="M16 2L30 25H2L16 2Z" stroke="white" strokeWidth="2" fill="none" />
            <path d="M16 9L24 23H8L16 9Z" fill="var(--amber)" />
          </svg>
          <span className="logo-text">Harvest.AI</span>
        </Link>

        <button
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/#about" onClick={closeMenu}>About</Link></li>
          <li><Link to="/#features" onClick={closeMenu}>Features</Link></li>
          <li>
            <Link to="/#contact" className="btn-primary-nav" onClick={closeMenu}>
              Get Started
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiseaseCare() {
  // All hooks at component top level, before any conditionals
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null); // base64 image string
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [barWidth, setBarWidth] = useState(0);

  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  // Animate confidence bar setelah result muncul
  useEffect(() => {
    if (!result) return;
    // Reset dulu ke 0, lalu animasikan ke nilai confidence
    setBarWidth(0);
    const timer = setTimeout(() => {
      setBarWidth(parseFloat(result.conf));
    }, 100);
    return () => clearTimeout(timer);
  }, [result]);

  // Scroll ke result setelah muncul
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [result]);

  // ─── Handlers ───
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

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

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
    setLoading(true);

    // Prepare the image to be sent as multipart/form-data
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Call the Flask API
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      // Match the API result with your local database for treatments
      // Note: Ensure your diseaseDB names match the formatted names coming from the API (e.g., "Corn Blight")
      const matchedDisease = diseaseDB.find(d => d.name === data.disease) || {
        name: data.disease,
        sci: "Scientific classification pending",
        treatment: ["Please consult your local agricultural extension for specific treatments."],
        prevention: ["Ensure proper field drainage and monitor crops regularly."]
      };

      setResult({ 
        ...matchedDisease, 
        conf: data.confidence 
      });

    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to connect to the AI server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived values ───
  const uploadZoneClass = [
    "upload-zone",
    dragOver ? "dragover" : "",
    preview ? "has-image" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <DiseaseNavbar />

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
        {/* Feature Cards - Bento Refactoring */}
        <div className="features-preview" id="features-preview">
          {/* Card 1: Hero Asymmetrical Bento Card */}
          <div className="feature-card hero-card">
            <div className="hero-left">
              <div className="icon-container">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="oklch(60% 0.12 155)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <h3>01 / Image Analysis</h3>
              <p>Upload a clear photo of your affected crop. Our model scans visual symptoms with high precision.</p>
            </div>
            <div className="hero-right">
              <div className="scanning-visual">
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />
                <div className="scan-box" />
                <div className="scan-line" />
                <svg className="leaf-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--deep-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="22" y1="12" x2="18" y2="12"/>
                <line x1="6" y1="12" x2="2" y2="12"/>
                <line x1="12" y1="6" x2="12" y2="2"/>
                <line x1="12" y1="22" x2="12" y2="18"/>
              </svg>
            </div>
            <h3>02 / Disease Detection</h3>
            <p>Identifies common fungal, bacterial, and viral diseases across major crop types within seconds.</p>
          </div>

          {/* Card 3: Treatment Guide */}
          <div className="feature-card">
            <div className="icon-container">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>03 / Treatment Guide</h3>
            <p>Get actionable treatment recommendations and prevention tips tailored to the detected disease.</p>
          </div>
        </div>

        {/* Upload Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-label">📤 Upload &amp; Analyse</span>
          </div>

          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Upload a photo of your crop — AI will scan it, identify diseases and
            recommend treatments instantly.
          </p>

          <div className="upload-layout">
            <label>Crop Image</label>

            <div className="field">
              <div
                className={uploadZoneClass}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !preview && fileInputRef.current?.click()}
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleInputChange}
                />

                {/* Preview */}
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
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#555"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                    <p>
                      Click or drag &amp; drop
                      <br />
                      your crop photo here
                    </p>
                    <span>JPG, PNG, WEBP · Max 10 MB</span>
                  </div>
                )}
              </div>

              {imageError && (
                <span className="error-msg" style={{ display: "block" }}>
                  Please upload a crop image
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                background: "#f7f5ee",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              💡 <strong>Tips:</strong> For best results, take a close-up photo
              of the affected leaf or stem in natural daylight.
            </div>
          </div>

          <button
            className={`btn-analyze${loading ? " loading" : ""}`}
            onClick={runAnalysis}
            disabled={loading}
          >
            <div className="spinner" />
            <span className="btn-label">🔍 Analyze Disease</span>
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="result-section visible" ref={resultRef}>
            <div className="intel-label">
              AI Output
            </div>
            
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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

            <div className="intel-label">
              Crop Intelligence
            </div>

            <div className="results-grid">
              {/* Treatment */}
              <div className="info-card treatment-card">
                <div className="card-heading-group">
                  <div className="icon-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <h4>Treatment Recommendation</h4>
                </div>
                <div className="tip-list">
                  {result.treatment.map((t, i) => (
                    <div className="tip-item" key={i}>
                      <svg className="tip-bullet tip-bullet-treatment" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h4>Prevention Tips</h4>
                </div>
                <div className="tip-list">
                  {result.prevention.map((p, i) => (
                    <div className="tip-item" key={i}>
                      <svg className="tip-bullet tip-bullet-prevention" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Footer */}
      <Footer />
    </>
  );
}
