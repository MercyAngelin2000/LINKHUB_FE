"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { PRESET_THEMES, ThemeConfig } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";
import { getTenantInfo } from "@/lib/auth";

const PRESETS = [
    {
        id: "midnight",
        name: "Midnight",
        emoji: "🌙",
        desc: "Deep purple gradient, pill buttons",
        preview: {
            bg: "linear-gradient(135deg, #0f0c29, #302b63)",
            buttons: ["linear-gradient(135deg,#a855f7,#6366f1)", "linear-gradient(135deg,#a855f7,#6366f1)", "linear-gradient(135deg,#a855f7,#6366f1)"],
            radius: "999px",
            textColor: "#f1f5f9",
        },
    },
    {
        id: "minimal",
        name: "Minimal",
        emoji: "◽",
        desc: "Clean white, outlined buttons",
        preview: {
            bg: "#f8fafc",
            buttons: ["transparent", "transparent", "transparent"],
            radius: "8px",
            textColor: "#111827",
            border: "2px solid #111827",
        },
    },
    {
        id: "neon",
        name: "Neon",
        emoji: "⚡",
        desc: "Dark with amber glow effect",
        preview: {
            bg: "linear-gradient(180deg, #0a0a0a, #1a0a00)",
            buttons: ["transparent", "transparent", "transparent"],
            radius: "4px",
            textColor: "#fef3c7",
            border: "1.5px solid #f59e0b",
            glow: "0 0 10px #f59e0b66",
        },
    },
];

function MiniPreview({ preset }: { preset: typeof PRESETS[0] }) {
    return (
        <div className="mini-preview" style={{ background: preset.preview.bg }}>
            {/* Avatar placeholder */}
            <div className="mini-avatar" style={{ borderColor: preset.preview.textColor + "40" }}>
                <div className="mini-avatar-inner" style={{ background: preset.preview.textColor + "20" }} />
            </div>
            {/* Link buttons */}
            {preset.preview.buttons.map((bg, i) => (
                <div
                    key={i}
                    className="mini-btn"
                    style={{
                        background: bg,
                        borderRadius: preset.preview.radius,
                        border: preset.preview.border || "none",
                        boxShadow: preset.preview.glow || "none",
                    }}
                />
            ))}
        </div>
    );
}

export default function ThemePage() {
    const [activePreset, setActivePreset] = useState("midnight");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const tenant = getTenantInfo();

    useEffect(() => {
        // Load current saved theme
        api.get("/links/").then((res) => {
            const preset = res.data?.theme?.preset;
            if (preset) setActivePreset(preset);
        });
    }, []);

    const handleSave = async () => {
        const theme = PRESET_THEMES[activePreset];
        if (!theme) return;
        setLoading(true);
        try {
            await api.put("/links/theme", theme);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setLoading(false);
        }
    };

    const currentPreset = PRESETS.find((p) => p.id === activePreset)!;
    const currentTheme = PRESET_THEMES[activePreset] || {};

    const themeRows = Object.entries(currentTheme).filter(([k]) => k !== "preset");

    return (
        <div className="theme-page">
            {/* Header */}
            <div className="page-head">
                <h1 className="page-title">Theme</h1>
                <p className="page-sub">Choose how your public profile page looks to visitors</p>
            </div>

            {/* Presets */}
            <div className="section-label">Choose a preset</div>
            <div className="presets-grid">
                {PRESETS.map((preset) => {
                    const isActive = activePreset === preset.id;
                    return (
                        <motion.button
                            key={preset.id}
                            className={`preset-card ${isActive ? "preset-active" : ""}`}
                            onClick={() => setActivePreset(preset.id)}
                            whileTap={{ scale: 0.97 }}
                        >
                            <MiniPreview preset={preset} />
                            <div className="preset-info">
                                <div className="preset-name-row">
                                    <span className="preset-emoji">{preset.emoji}</span>
                                    <span className="preset-name">{preset.name}</span>
                                    {isActive && (
                                        <motion.span
                                            className="active-chip"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            Active
                                        </motion.span>
                                    )}
                                </div>
                                <p className="preset-desc">{preset.desc}</p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Theme detail table */}
            <div className="section-label">Theme details — {currentPreset.name}</div>
            <div className="details-card">
                {themeRows.map(([key, val]) => (
                    <div key={key} className="detail-row">
                        <span className="detail-key">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <div className="detail-val-wrap">
                            {typeof val === "string" && (val.startsWith("#") || val.includes("gradient")) && (
                                <div className="swatch" style={{ background: val }} />
                            )}
                            <span className="detail-val">{String(val)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save + Preview */}
            <div className="save-row">
                <motion.button
                    className={`save-btn ${saved ? "saved" : ""}`}
                    onClick={handleSave}
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                >
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.span  style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                backgroundColor: "black",
                                padding: "0.5rem 0.5rem",
                                borderRadius: "4px",
                            }} key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                Saving...
                            </motion.span>
                        ) : saved ? (
                            <motion.span  style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                backgroundColor: "black",
                                padding: "0.5rem 0.5rem",
                                borderRadius: "4px",
                            }} key="saved" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} >
                                ✓ Theme saved!
                            </motion.span>
                        ) : (
                            <motion.span 
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                backgroundColor: "black",
                                padding: "0.5rem 0.5rem",
                                borderRadius: "4px",
                            }}
                             key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                Apply theme
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>

                <a
                    href={`/?tenant=${tenant?.subdomain}`}
                    target="_blank"
                    className="preview-link"
                >
                    Preview profile →
                </a>
            </div>

            <p className="save-hint">
                After saving, reload your profile page at{" "}
                <strong>{tenant?.subdomain}.linkhub.com</strong> to see the new theme.
            </p>

            <style jsx>{`
        .theme-page { max-width: 860px; padding-bottom: 3rem; }

        .page-head { margin-bottom: 1.75rem; }
        .page-title { font-size: 1.7rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
        .page-sub { color: #64748b; margin: 0.3rem 0 0; font-size: 0.875rem; }

        .section-label {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: #94a3b8; margin-bottom: 0.875rem;
        }

        /* Presets grid */
        .presets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }

        .preset-card {
          background: #fff; border: 2px solid #e8edf3; border-radius: 16px;
          padding: 0; cursor: pointer; text-align: left;
          transition: border-color 0.2s, box-shadow 0.2s; overflow: hidden;
        }
        .preset-card:hover { border-color: #a5b4fc; box-shadow: 0 4px 16px rgba(99,102,241,0.1); }
        .preset-active { border-color: #6366f1 !important; box-shadow: 0 4px 20px rgba(99,102,241,0.18) !important; }

        /* Mini preview */
        :global(.mini-preview) {
          height: 115px; padding: 12px 14px;
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          overflow: hidden;
        }
        :global(.mini-avatar) {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2px;
        }
        :global(.mini-avatar-inner) { width: 16px; height: 16px; border-radius: 50%; }
        :global(.mini-btn) { width: 80%; height: 14px; opacity: 0.85; }

        /* Preset info */
        .preset-info { padding: 0.75rem 1rem 0.875rem; }
        .preset-name-row { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.25rem; }
        .preset-emoji { font-size: 0.875rem; }
        .preset-name { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
        .active-chip {
          margin-left: auto; background: rgba(99,102,241,0.1); color: #6366f1;
          font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem;
          border-radius: 999px;
        }
        .preset-desc { font-size: 0.75rem; color: #94a3b8; margin: 0; }

        /* Details card */
        .details-card {
          background: #fff; border: 1px solid #e8edf3; border-radius: 14px;
          overflow: hidden; margin-bottom: 1.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .detail-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1.25rem; border-bottom: 1px solid #f8fafc;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-key { font-size: 0.8rem; color: #64748b; font-weight: 500; text-transform: capitalize; }
        .detail-val-wrap { display: flex; align-items: center; gap: 0.5rem; max-width: 50%; }
        .swatch { width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.1); }
        .detail-val {
          font-size: 0.78rem; color: #0f172a; font-family: "SF Mono", "Fira Code", monospace;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* Save row */
        .save-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
        .save-btn {
          background: #0f172a; color: #fff; border: none;
          border-radius: 12px; padding: 0.8rem 2rem;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s; min-width: 140px;
          display: flex; align-items: center; justify-content: center;
          font-family: inherit; position: relative; overflow: hidden;
        }
        /* Fix: motion.span children must fill the button */
        .save-btn span {
          display: flex; align-items: center; justify-content: center;
          width: 100%; color: inherit; font-size: inherit; font-weight: inherit;
          white-space: nowrap; pointer-events: none;
        }
        .save-btn:hover { background: #1e293b; }
        .save-btn.saved { background: #10b981; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .preview-link {
          color: #6366f1; font-size: 0.85rem; font-weight: 600;
          text-decoration: none; padding: 0.5rem 0;
          border-bottom: 1px dashed #c7d2fe;
        }
        .preview-link:hover { border-bottom-style: solid; }

        .save-hint { font-size: 0.78rem; color: #94a3b8; margin: 0; }

        @media (max-width: 680px) {
          .theme-page { padding-bottom: 2rem; }
          .page-title { font-size: 1.35rem; }

          /* Stack presets vertically on mobile */
          .presets-grid { grid-template-columns: 1fr; gap: 0.75rem; }

          /* Shorter mini preview on mobile */
          :global(.mini-preview) { height: 80px; padding: 10px 12px; gap: 5px; }
          :global(.mini-btn) { height: 11px; }

          /* Details card - stack key/value vertically */
          .detail-row { flex-direction: column; align-items: flex-start; gap: 0.25rem; padding: 0.625rem 1rem; }
          .detail-val-wrap { max-width: 100%; }
          .detail-val { font-size: 0.72rem; }

          /* Save row stack vertically */
          .save-row { flex-direction: column; align-items: stretch; gap: 0.625rem; }
          .save-btn { width: 100%; padding: 0.875rem; }
          .preview-link { text-align: center; padding: 0.5rem; }
          .save-hint { font-size: 0.72rem; }
        }
      `}</style>
        </div>
    );
}