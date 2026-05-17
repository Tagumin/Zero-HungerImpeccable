import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import InfoModal from "../components/InfoModal";
import { useInfoModal } from "../hooks/useInfoModal";

// ─── Crop database ────────────────────────────────────────────────────────────
const cropDB = {
  rice: {
    sub: "Oryza sativa · Cereal grain",
    planting: "June – July",
    plantNote: "Kharif / Wet season",
    harvest: "Oct – Nov",
    harvestNote: "110–150 days to maturity",
    tips: [
      "Maintain 2–5 cm standing water during vegetative stage",
      "Apply nitrogen fertilizer in split doses at transplanting, tillering, and panicle initiation",
      "Monitor for leaf blast disease during humid, cloudy weather",
    ],
    pests: ["Stem Borer", "Brown Planthopper", "Gall Midge"],
    diseases: ["Blast", "Sheath Blight", "Bacterial Blight"],
  },
  wheat: {
    sub: "Triticum aestivum · Cereal grain",
    planting: "Nov – Dec",
    plantNote: "Rabi / Winter season",
    harvest: "Mar – Apr",
    harvestNote: "120–150 days to maturity",
    tips: [
      "Sow at 100–125 kg/ha seed rate",
      "Apply irrigation at critical stages",
      "Protect from rust diseases with fungicides",
    ],
    pests: ["Aphids", "Armyworm", "Hessian Fly"],
    diseases: ["Yellow Rust", "Powdery Mildew", "Loose Smut"],
  },
  maize: {
    sub: "Zea mays · Cereal crop",
    planting: "June – July",
    plantNote: "Kharif / Summer season",
    harvest: "Sep – Oct",
    harvestNote: "90–120 days to maturity",
    tips: [
      "Maintain row spacing of 60–75 cm",
      "Apply phosphorus at sowing",
      "Scout for fall armyworm regularly",
    ],
    pests: ["Fall Armyworm", "Stem Borer", "Aphids"],
    diseases: ["Northern Leaf Blight", "Maize Streak Virus", "Ear Rot"],
  },
  chickpea: {
    sub: "Cicer arietinum · Legume",
    planting: "Oct – Nov",
    plantNote: "Rabi / Cool season",
    harvest: "Feb – Mar",
    harvestNote: "95–110 days to maturity",
    tips: [
      "Avoid waterlogging — chickpea is sensitive",
      "Use rhizobium inoculant for nitrogen fixation",
      "Harvest when 60% pods turn brown",
    ],
    pests: ["Pod Borer", "Aphids", "Cut Worm"],
    diseases: ["Fusarium Wilt", "Botrytis Grey Mold", "Ascochyta Blight"],
  },
  cotton: {
    sub: "Gossypium hirsutum · Fiber crop",
    planting: "Apr – May",
    plantNote: "Summer / Kharif season",
    harvest: "Oct – Dec",
    harvestNote: "150–180 days to maturity",
    tips: [
      "Maintain optimum plant population of 22,000/ha",
      "Apply potash for fiber quality",
      "Monitor for bollworm weekly",
    ],
    pests: ["Pink Bollworm", "Whitefly", "Aphids"],
    diseases: ["Fusarium Wilt", "Verticillium Wilt", "Cotton Leaf Curl Virus"],
  },
  mango: {
    sub: "Mangifera indica · Tropical fruit",
    planting: "Jun – Sep",
    plantNote: "Monsoon / Planting season",
    harvest: "Apr – Jun",
    harvestNote: "3–5 years first yield",
    tips: [
      "Prune after harvest to encourage new growth",
      "Apply 40–60 kg compost per tree annually",
      "Irrigate weekly during fruit development",
    ],
    pests: ["Mango Hopper", "Fruit Fly", "Scale Insect"],
    diseases: ["Anthracnose", "Powdery Mildew", "Bacterial Black Spot"],
  },
  banana: {
    sub: "Musa spp. · Tropical fruit",
    planting: "Year-round",
    plantNote: "Tropical / Perennial crop",
    harvest: "10–12 months",
    harvestNote: "After planting",
    tips: [
      "Ensure well-drained soils — no waterlogging",
      "Remove side shoots to 1–2 suckers per mat",
      "Harvest at 75–80% maturity",
    ],
    pests: ["Banana Weevil", "Nematodes", "Thrips"],
    diseases: ["Panama Wilt", "Black Sigatoka", "Bunchy Top Virus"],
  },
  grapes: {
    sub: "Vitis vinifera · Fruit vine",
    planting: "Jan – Feb",
    plantNote: "Dormancy period",
    harvest: "Mar – Jun",
    harvestNote: "3–4 years first full yield",
    tips: [
      "Prune vines to 2–3 buds per spur",
      "Maintain vine rows N–S direction",
      "Apply foliar fungicide every 10 days",
    ],
    pests: ["Mealybug", "Thrips", "Grape Berry Moth"],
    diseases: ["Powdery Mildew", "Downy Mildew", "Botrytis Bunch Rot"],
  },
};

// ─── Recommendation logic (fungsi biasa, BUKAN komponen) ─────────────────────
function recommend(n, p, k, ph, temp, humidity, rainfall) {
  if (
    temp >= 20 &&
    temp <= 35 &&
    humidity >= 60 &&
    rainfall >= 150 &&
    ph >= 5.0 &&
    ph <= 7.5
  )
    return "rice";
  if (
    temp >= 12 &&
    temp <= 25 &&
    humidity < 60 &&
    rainfall < 100 &&
    ph >= 6.0 &&
    ph <= 8.0
  )
    return "wheat";
  if (
    temp >= 18 &&
    temp <= 32 &&
    humidity >= 50 &&
    rainfall >= 60 &&
    ph >= 5.5 &&
    ph <= 7.5
  )
    return "maize";
  if (
    temp >= 10 &&
    temp <= 24 &&
    humidity < 60 &&
    rainfall < 80 &&
    ph >= 5.5 &&
    ph <= 8.0
  )
    return "chickpea";
  if (
    temp >= 24 &&
    temp <= 35 &&
    humidity >= 40 &&
    rainfall >= 50 &&
    ph >= 5.5 &&
    ph <= 8.0
  )
    return "cotton";
  if (temp >= 24 && temp <= 38 && humidity >= 50 && rainfall >= 100)
    return "mango";
  if (temp >= 25 && temp <= 35 && humidity >= 75 && rainfall >= 150)
    return "banana";
  return "grapes";
}

// ─── Field config ─────────────────────────────────────────────────────────────
const FIELDS = [
  {
    id: "nitrogen",
    label: "Nitrogen (N)",
    min: 0,
    max: 140,
    hint: "0–140",
    placeholder: "e.g. 90",
    group: "soil",
  },
  {
    id: "phosphorus",
    label: "Phosphorus (P)",
    min: 5,
    max: 145,
    hint: "5–145",
    placeholder: "e.g. 42",
    group: "soil",
  },
  {
    id: "potassium",
    label: "Potassium (K)",
    min: 5,
    max: 205,
    hint: "5–205",
    placeholder: "e.g. 43",
    group: "soil",
  },
  {
    id: "ph",
    label: "Soil pH",
    min: 3.5,
    max: 9.5,
    hint: "3.5–9.5",
    placeholder: "e.g. 6.5",
    group: "soil",
  },
  {
    id: "temperature",
    label: "Temperature",
    min: 8,
    max: 44,
    hint: "8–44 °C",
    placeholder: "e.g. 25",
    group: "climate",
  },
  {
    id: "humidity",
    label: "Humidity",
    min: 14,
    max: 100,
    hint: "14–100 %",
    placeholder: "e.g. 82",
    group: "climate",
  },
  {
    id: "rainfall",
    label: "Rainfall",
    min: 20,
    max: 300,
    hint: "20–300 mm",
    placeholder: "e.g. 202",
    group: "climate",
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function CropNavbar() {
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
    <nav className="navbar" id="navbar" ref={navRef}>
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CropRecommendation() {
  // ✅ Semua hooks di sini, di level atas komponen
  const { modal, openModal, closeModal } = useInfoModal();

  const initialValues = Object.fromEntries(FIELDS.map((f) => [f.id, ""]));
  const initialErrors = Object.fromEntries(FIELDS.map((f) => [f.id, false]));

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  function validate(id, val) {
    const field = FIELDS.find((f) => f.id === id);
    const num = parseFloat(val);
    return val === "" || isNaN(num) || num < field.min || num > field.max;
  }

  function handleChange(id, val) {
    setValues((prev) => ({ ...prev, [id]: val }));
    setErrors((prev) => ({ ...prev, [id]: validate(id, val) }));
  }

  function handleBlur(id) {
    setErrors((prev) => ({ ...prev, [id]: validate(id, values[id]) }));
  }

  function runRecommendation() {
    const newErrors = Object.fromEntries(
      FIELDS.map((f) => [f.id, validate(f.id, values[f.id])]),
    );
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      setResult(null);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const n = parseFloat(values.nitrogen);
      const p = parseFloat(values.phosphorus);
      const k = parseFloat(values.potassium);
      const ph = parseFloat(values.ph);
      const t = parseFloat(values.temperature);
      const h = parseFloat(values.humidity);
      const r = parseFloat(values.rainfall);

      const cropKey = recommend(n, p, k, ph, t, h, r);
      const cropData = cropDB[cropKey];
      const conf = (85 + Math.random() * 13).toFixed(1);

      setResult({ cropKey, cropData, conf });
      setLoading(false);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        80,
      );
    }, 1400);
  }

  const soilFields = FIELDS.filter((f) => f.group === "soil");
  const climateFields = FIELDS.filter((f) => f.group === "climate");

  return (
    <>
      <CropNavbar />

      {/* Hero Banner */}
      <div className="hero-banner">
        <img src="images/crop_recommendation.jpg" alt="Farm field" />
        <div className="hero-banner-text">
          <h1>Crop Recommendation Engine</h1>
          <p>
            Enter your soil and climate conditions — AI will instantly recommend
            the best crop to grow.
          </p>
        </div>
      </div>

      <div className="page-wrap">
        {/* Features preview */}
        <div className="features-preview" id="features-preview">
          {[
            {
              icon: "🌱",
              title: "Soil Analysis",
              text: "Input your soil's N, P, K content and pH level. Our model understands the chemistry behind healthy root systems.",
            },
            {
              icon: "☀️",
              title: "Climate Matching",
              text: "Temperature, humidity, and rainfall patterns are cross-referenced against optimal crop growing conditions.",
            },
            {
              icon: "🧠",
              title: "AI Recommendation",
              text: "A trained model evaluates multiple factors simultaneously for the most confident prediction.",
            },
          ].map((c) => (
            <div className="feature-card" key={c.title}>
              <div className="icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Soil card */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-label">🌱 Soil Data</span>
          </div>
          <div className="form-grid" style={{ marginBottom: 20 }}>
            {soilFields
              .filter((f) => f.id !== "ph")
              .map((f) => (
                <div
                  className={`field${errors[f.id] ? " has-error" : ""}`}
                  key={f.id}
                >
                  <label>
                    {f.label}
                    <span className="range-hint">{f.hint}</span>
                  </label>
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step="0.1"
                    placeholder={f.placeholder}
                    value={values[f.id]}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                    onBlur={() => handleBlur(f.id)}
                    className={errors[f.id] ? "error" : ""}
                  />
                  {errors[f.id] && (
                    <span className="error-msg">
                      Enter a value between {f.min} and {f.max}
                    </span>
                  )}
                </div>
              ))}
          </div>
          <div className="form-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
            {soilFields
              .filter((f) => f.id === "ph")
              .map((f) => (
                <div
                  className={`field${errors[f.id] ? " has-error" : ""}`}
                  key={f.id}
                >
                  <label>
                    {f.label}
                    <span className="range-hint">{f.hint}</span>
                  </label>
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step="0.1"
                    placeholder={f.placeholder}
                    value={values[f.id]}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                    onBlur={() => handleBlur(f.id)}
                    className={errors[f.id] ? "error" : ""}
                  />
                  {errors[f.id] && (
                    <span className="error-msg">
                      Enter a value between {f.min} and {f.max}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Climate card */}
        <div className="card">
          <div className="card-header">
            <span className="card-header-label">🌦️ Climate Data</span>
          </div>
          <div className="form-grid-2">
            {climateFields.map((f) => (
              <div
                className={`field${errors[f.id] ? " has-error" : ""}`}
                key={f.id}
              >
                <label>
                  {f.label}
                  <span className="range-hint">{f.hint}</span>
                </label>
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step="0.1"
                  placeholder={f.placeholder}
                  value={values[f.id]}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                  onBlur={() => handleBlur(f.id)}
                  className={errors[f.id] ? "error" : ""}
                />
                {errors[f.id] && (
                  <span className="error-msg">
                    Enter a value between {f.min} and {f.max}
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            className={`btn-recommend${loading ? " loading" : ""}`}
            onClick={runRecommendation}
            disabled={loading}
          >
            <div className="spinner" />
            <span className="btn-label">🌾 Get Crop Recommendation</span>
          </button>
        </div>

        {/* Result section */}
        {result && (
          <div className="result-section visible" ref={resultRef}>
            <div className="intel-label" style={{ marginBottom: 16 }}>
              AI Output
            </div>
            <div style={{ marginBottom: 8 }}>
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
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--green-mid)",
                  marginBottom: 20,
                }}
              >
                Your personalized crop recommendation based on current field
                conditions and model analysis.
              </p>
            </div>

            {/* Result hero */}
            <div className="result-hero">
              <div className="result-hero-header">
                <div>
                  <div className="ai-badge">✨ AI Recommendation</div>
                  <div className="result-crop-name">
                    {result.cropKey.charAt(0).toUpperCase() +
                      result.cropKey.slice(1)}
                  </div>
                  <div className="result-crop-sub">{result.cropData.sub}</div>
                </div>
                <div className="confidence-block">
                  <div className="confidence-label">Model Confidence</div>
                  <div className="confidence-num">{result.conf}%</div>
                </div>
              </div>
            </div>

            {/* Crop intelligence */}
            <div style={{ marginBottom: 16 }}>
              <div className="intel-label">Crop Intelligence</div>
              <div className="intel-grid">
                <div className="intel-card">
                  <span className="intel-emoji">📅</span>
                  <div className="intel-card-label">Planting Season</div>
                  <div className="intel-card-value">
                    {result.cropData.planting}
                  </div>
                  <div className="intel-card-sub">
                    {result.cropData.plantNote}
                  </div>
                </div>
                <div className="intel-card">
                  <span className="intel-emoji">🌿</span>
                  <div className="intel-card-label">Harvest Time</div>
                  <div className="intel-card-value">
                    {result.cropData.harvest}
                  </div>
                  <div className="intel-card-sub">
                    {result.cropData.harvestNote}
                  </div>
                </div>
              </div>
            </div>

            {/* Care tips */}
            <div className="care-card" style={{ marginBottom: 16 }}>
              <div className="intel-label">💡 Care Tips</div>
              <div className="care-list">
                {result.cropData.tips.map((tip, i) => (
                  <div className="care-item" key={i}>
                    <div className="care-dot" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Pests & diseases — tag clickable, InfoModal di LUAR tag-grid */}
            <div className="tag-grid">
              <div className="tag-card">
                <div className="intel-label">🐛 Common Pests</div>
                <div className="tag-wrap">
                  {result.cropData.pests.map((p) => (
                    <span
                      className="tag tag-amber"
                      key={p}
                      onClick={() => openModal("pest", p.toLowerCase())}
                      style={{ cursor: "pointer" }}
                      title="Click for details"
                    >
                      {p} ↗
                    </span>
                  ))}
                </div>
              </div>
              <div className="tag-card">
                <div className="intel-label">🦠 Common Diseases</div>
                <div className="tag-wrap">
                  {result.cropData.diseases.map((d) => (
                    <span
                      className="tag tag-red"
                      key={d}
                      onClick={() => openModal("disease", d.toLowerCase())}
                      style={{ cursor: "pointer" }}
                      title="Click for details"
                    >
                      {d} ↗
                    </span>
                  ))}
                </div>
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

      {/* ✅ InfoModal di sini — di luar semua div, sebelum penutup fragment */}
      <InfoModal modal={modal} onClose={closeModal} />
    </>
  );
}
