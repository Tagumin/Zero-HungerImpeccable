import { useEffect } from "react";

const API_BASE = "http://localhost:5000";

const DAMAGE_STYLE = {
  high: {
    bg: "#7f1d1d",
    color: "#fca5a5",
    dot: "#ef4444",
    label: "HIGH DAMAGE",
  },
  medium: {
    bg: "#78350f",
    color: "#fcd34d",
    dot: "#f59e0b",
    label: "MEDIUM DAMAGE",
  },
  low: { bg: "#14532d", color: "#86efac", dot: "#22c55e", label: "LOW DAMAGE" },
};

export default function InfoModal({ modal, onClose }) {
  const { open, type, name, data, loading, error } = modal;

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isPest = type === "pest";
  const imageBase = isPest ? "pest_image" : "disease_image";
  const imageUrl = `${API_BASE}/${imageBase}/${encodeURIComponent(name)}.jpg`;
  const chemicals = isPest ? data?.pesticides : data?.chemicals;
  const dmg = DAMAGE_STYLE[data?.damage_level] ?? DAMAGE_STYLE.medium;

  const formatName = (str) =>
    str ? str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Modal box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1f1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "88vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* ── Image ── */}
        <div
          style={{
            height: 200,
            overflow: "hidden",
            borderRadius: "16px 16px 0 0",
            background: "#111",
          }}
        >
          <img
            src={imageUrl}
            alt={name}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.85,
            }}
          />
        </div>

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.55)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            cursor: "pointer",
            color: "#fff",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* ── Content ── */}
        <div style={{ padding: "24px 28px 28px" }}>
          {/* Loading */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#6b7280",
              }}
            >
              Loading...
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {/* Data */}
          {data && (
            <>
              {/* Title + badge */}
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#f0f0f0",
                  marginBottom: 12,
                }}
              >
                {formatName(name)}
              </h2>

              {data.damage_level && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: dmg.bg,
                    color: dmg.color,
                    borderRadius: 99,
                    padding: "4px 12px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: dmg.dot,
                      display: "inline-block",
                    }}
                  />
                  {dmg.label}
                </span>
              )}

              {/* Description */}
              <p
                style={{
                  color: "#a1a1aa",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  fontSize: "0.95rem",
                }}
              >
                {data.description}
              </p>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  marginBottom: 20,
                }}
              />

              {/* Sections */}
              {[
                { icon: "⚠", label: "ATTACK SYMPTOMS", value: data.symptoms },
                { icon: "○", label: "PREVENTION", value: data.prevention },
                { icon: "💉", label: "TREATMENT", value: data.treatment },
              ].map(
                ({ icon, label, value }) =>
                  value && (
                    <div key={label} style={{ marginBottom: 18 }}>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: "#6b7280",
                          marginBottom: 6,
                        }}
                      >
                        {icon} {label}
                      </p>
                      <p
                        style={{
                          color: "#d1d5db",
                          fontSize: "0.92rem",
                          lineHeight: 1.65,
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ),
              )}

              {/* Pesticides / Chemicals */}
              {chemicals?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#6b7280",
                      marginBottom: 10,
                    }}
                  >
                    🧪 {isPest ? "PESTICIDES" : "CHEMICALS"}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {chemicals.map((c) => (
                      <span
                        key={c}
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#4ade80",
                          border: "1px solid rgba(34,197,94,0.25)",
                          borderRadius: 99,
                          padding: "4px 12px",
                          fontSize: "0.82rem",
                          fontWeight: 500,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active season */}
              {data.active_season && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    🕐 Active season:
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#e5e7eb",
                    }}
                  >
                    {data.active_season}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
