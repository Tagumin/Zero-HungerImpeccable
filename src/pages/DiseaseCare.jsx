import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./DiseaseCare.css";

// ─── Disease database ─────────────────────────────────────────────────────────

//just fort testing and demo, nanti diganti dengan API call ke backend untuk dapat data real dari model AI
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
  // ✅ Hooks di level atas komponen ini
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.background =
          window.scrollY > 60 ? "rgba(0,0,0,0.88)" : "rgba(0,0,0,0.55)";
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <svg width="28" height="24" viewBox="0 0 32 27" fill="none">
            <path
              d="M16 2L30 25H2L16 2Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <path d="M16 9L24 23H8L16 9Z" fill="rgba(244,186,106,0.75)" />
          </svg>
          <span className="logo-text">IDK</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <a href="#features-preview" onClick={closeMenu}>
              About
            </a>
          </li>
          <li>
            <Link
              to="/#contact"
              className="btn-contact-nav"
              onClick={closeMenu}
            >
              Contact us
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiseaseCare() {
  // ✅ SEMUA hooks di sini, sebelum return, tidak ada kondisi
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAnalysis = () => {
    if (!preview) {
      setImageError(true);
      setResult(null);
      return;
    }
    setImageError(false);
    setLoading(true);

    setTimeout(() => {
      const data = diseaseDB[Math.floor(Math.random() * diseaseDB.length)];
      const conf = (75 + Math.random() * 23).toFixed(1);
      setResult({ ...data, conf });
      setLoading(false);
    }, 1600);
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
        {/* Feature Cards */}
        <div className="features-preview" id="features-preview">
          {[
            {
              icon: "📸",
              title: "Image Analysis",
              text: "Upload a clear photo of your affected crop. Our model scans visual symptoms with high precision.",
            },
            {
              icon: "🔬",
              title: "Disease Detection",
              text: "Identifies common fungal, bacterial, and viral diseases across major crop types within seconds.",
            },
            {
              icon: "💊",
              title: "Treatment Guide",
              text: "Get actionable treatment recommendations and prevention tips tailored to the detected disease.",
            },
          ].map((c) => (
            <div className="feature-card" key={c.title}>
              <div className="icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
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
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.55)",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
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
            <div className="intel-label" style={{ marginBottom: 16 }}>
              AI Output
            </div>
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 4,
                }}
              >
                Prediction Results
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--green-mid)" }}>
                Your crop likely suffers from a detected disease based on visual
                pattern analysis.
              </p>
            </div>

            {/* Disease Hero */}
            <div className="result-hero" style={{ marginBottom: 20 }}>
              <div className="result-hero-header">
                <div>
                  <div className="ai-badge">🔬 AI Analysis</div>
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

            <div className="intel-label" style={{ marginBottom: 16 }}>
              Crop Intelligence
            </div>

            {/* Treatment */}
            <div className="info-card" style={{ marginBottom: 16 }}>
              <div className="intel-label">❤️ Treatment Recommendation</div>
              <div className="tip-list">
                {result.treatment.map((t, i) => (
                  <div className="tip-item" key={i}>
                    <div className="tip-dot tip-dot-red" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prevention */}
            <div className="info-card">
              <div className="intel-label">💪 Prevention Tips</div>
              <div className="tip-list">
                {result.prevention.map((p, i) => (
                  <div className="tip-item" key={i}>
                    <div className="tip-dot tip-dot-green" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer id="contact">
        <div className="footer-brand">IDK</div>
        <p className="footer-tagline">
          Intelligent agriculture for the next generation of farmers
        </p>
        <ul className="footer-links">
          <li>
            <a href="#">Privacy</a>
          </li>
          <li>
            <a href="#">Terms</a>
          </li>
          <li>
            <a href="#">Documentation</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
        <p className="footer-copy">© 2025 IDK. All rights reserved.</p>
      </footer>
    </>
  );
}
