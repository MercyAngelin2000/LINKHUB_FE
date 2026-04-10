"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { PRESET_THEMES, ThemeConfig } from "@/lib/theme";
import { motion } from "framer-motion";

const PRESETS = [
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    desc: "Deep purple gradient, pill buttons",
    preview: {
      bg: "linear-gradient(135deg, #0f0c29, #302b63)",
      btn: "linear-gradient(135deg, #a855f7, #6366f1)",
      text: "#f1f5f9",
      radius: "999px"
    }
  },
  {
    id: "minimal",
    name: "Minimal",
    emoji: "◽",
    desc: "Clean white, outlined buttons",
    preview: {
      bg: "#ffffff",
      btn: "#ffffff",
      text: "#111827",
      radius: "8px",
      border: "2px solid #111827"
    }
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    desc: "Dark with amber glow effect",
    preview: {
      bg: "linear-gradient(180deg, #000, #1a0a00)",
      btn: "transparent",
      text: "#fef3c7",
      radius: "4px",
      glow: "#f59e0b"
    }
  }
];

function ThemePreviewCard({
  preset,
  active,
  onClick
}: {
  preset: typeof PRESETS[0];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      className={`preset-card ${active ? "active" : ""}`}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {/* Mini preview */}
      <div
        className="mini-preview"
        style={{ background: preset.preview.bg }}
      >
        <div className="mini-avatar" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mini-btn"
            style={{
              background: preset.preview.btn,
              borderRadius: preset.preview.radius,
              border: preset.preview.border || "none",
              boxShadow: preset.preview.glow
                ? `0 0 8px ${preset.preview.glow}`
                : "none",
            }}
          />
        ))}
      </div>

      <div className="preset-info">
        <div className="preset-name">
          <span>{preset.emoji}</span>
          <span>{preset.name}</span>
          {active && <span className="active-badge">Active</span>}
        </div>
        <p className="preset-desc">{preset.desc}</p>
      </div>
    </motion.button>
  );
}

export default function ThemePage() {
  const [activePreset, setActivePreset] = useState("midnight");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current theme from API
    api.get("/links/").then((res) => {
      const preset = res.data.theme?.preset;
      if (preset) setActivePreset(preset);
    });
  }, []);

  const handleSave = async () => {
    const theme = PRESET_THEMES[activePreset];
    setLoading(true);
    try {
      await api.put("/links/theme", theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const current = PRESETS.find((p) => p.id === activePreset)!;

  return (
    <div className="theme-page">
      <div className="page-header">
        <h1 className="page-title">Theme</h1>
        <p className="page-sub">Choose how your profile page looks to visitors</p>
      </div>

      {/* Preset grid */}
      <div className="section-label">Choose a preset</div>
      <div className="presets-grid">
        {PRESETS.map((preset) => (
          <ThemePreviewCard
            key={preset.id}
            preset={preset}
            active={activePreset === preset.id}
            onClick={() => setActivePreset(preset.id)}
          />
        ))}
      </div>

      {/* Theme details */}
      <div className="theme-details">
        <div className="section-label">Theme details — {current.name}</div>
        <div className="detail-grid">
          {Object.entries(PRESET_THEMES[activePreset] || {}).map(([key, val]) => (
            key !== "preset" && (
              <div key={key} className="detail-row">
                <span className="detail-key">{key}</span>
                <div className="detail-val-wrap">
                  {typeof val === "string" && (val.startsWith("#") || val.startsWith("linear")) && (
                    <div
                      className="color-swatch"
                      style={{ background: val }}
                    />
                  )}
                  <span className="detail-val">{val as string}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="save-wrap">
        <motion.button
          className="save-btn"
          onClick={handleSave}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? "Saving..." : saved ? "✓ Saved!" : "Apply theme"}
        </motion.button>
        <p className="save-hint">
          Changes will appear on your public profile at{" "}
          <span className="subdomain-hint">yourname.linkhub.com</span>
        </p>
      </div>

      <style jsx>{`
        .theme-page { padding-bottom: 3rem; }
        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
        .page-sub { color: #94a3b8; margin: 0.25rem 0 0; font-size: 0.875rem; }
        .section-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }

        .presets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }

        :global(.preset-card) {
          background: #fff; border: 2px solid #f1f5f9;
          border-radius: 16px; padding: 0;
          cursor: pointer; text-align: left;
          transition: all 0.2s; overflow: hidden;
        }
        :global(.preset-card:hover) { border-color: #c7d2fe; }
        :global(.preset-card.active) { border-color: #6366f1; }

        :global(.mini-preview) {
          height: 110px; padding: 12px;
          display: flex; flex-direction: column; align-items: center;
          gap: 6px;
        }
        :global(.mini-avatar) {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.3); margin-bottom: 2px;
        }
        :global(.mini-btn) {
          width: 75%; height: 14px;
          background: rgba(255,255,255,0.25);
        }

        :global(.preset-info) { padding: 0.875rem; }
        :global(.preset-name) {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.9rem; font-weight: 600; color: #0f172a;
          margin-bottom: 0.25rem;
        }
        :global(.active-badge) {
          margin-left: auto; background: rgba(99,102,241,0.1);
          color: #6366f1; font-size: 0.7rem; padding: 0.15rem 0.5rem;
          border-radius: 999px; font-weight: 500;
        }
        :global(.preset-desc) { font-size: 0.775rem; color: #94a3b8; margin: 0; }

        .theme-details {
          background: #fff; border: 1px solid #f1f5f9;
          border-radius: 16px; padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        .detail-grid { display: flex; flex-direction: column; gap: 0.5rem; }
        .detail-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f8fafc; }
        .detail-row:last-child { border-bottom: none; }
        .detail-key { font-size: 0.8rem; color: #64748b; font-weight: 500; text-transform: capitalize; }
        .detail-val-wrap { display: flex; align-items: center; gap: 0.5rem; }
        .color-swatch { width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.1); }
        .detail-val { font-size: 0.8rem; color: #0f172a; font-family: monospace; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .save-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        .save-btn {
          background: #0f172a; color: #fff;
          border: none; border-radius: 12px;
          padding: 0.875rem 2rem; font-size: 0.95rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .save-btn:hover { background: #1e293b; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .save-hint { font-size: 0.8rem; color: #94a3b8; margin: 0; }
        .subdomain-hint { color: #6366f1; }

        @media (max-width: 768px) {
          .presets-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}