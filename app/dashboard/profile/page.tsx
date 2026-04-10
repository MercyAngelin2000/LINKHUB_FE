"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { getTenant } from "@/lib/tenant";
import { applyTheme } from "@/lib/theme";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<any>({});
  const [clickedId, setClickedId] = useState<number | null>(null);

  useEffect(() => {
    const tenant = getTenant();
    api.get(`/links/public?tenant=${tenant}`)
      .then((res) => {
        setData(res.data);
        setTheme(res.data.theme || {});
        applyTheme(res.data.theme);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleClick = (linkId: number, url: string) => {
    setClickedId(linkId);
    api.post(`/links/click/${linkId}?request_source=direct`).catch(() => {});
    setTimeout(() => {
      window.open(url, "_blank");
      setClickedId(null);
    }, 150);
  };

  const getButtonStyle = (isClicked: boolean): React.CSSProperties => {
    const radius = theme.radius || "14px";
    const primary = theme.primary || "#6366f1";

    const base: React.CSSProperties = {
      width: "100%",
      padding: "1rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
      borderRadius: radius,
      fontFamily: "inherit",
      transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
      transform: isClicked ? "scale(0.97)" : "scale(1)",
      position: "relative",
      overflow: "hidden",
    };

    switch (theme.buttonStyle) {
      case "gradient":
        return {
          ...base,
          background: isClicked
            ? theme.buttonGradient || primary
            : theme.buttonGradient || primary,
          color: "#fff",
          border: "none",
          boxShadow: isClicked
            ? "0 2px 8px rgba(0,0,0,0.2)"
            : "0 4px 20px rgba(0,0,0,0.25)",
          opacity: isClicked ? 0.9 : 1,
        };
      case "outline":
        return {
          ...base,
          background: isClicked ? `${primary}15` : "transparent",
          color: theme.text || "#111",
          border: theme.buttonBorder || `2px solid ${primary}`,
          boxShadow: isClicked ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
        };
      case "neon":
        return {
          ...base,
          background: isClicked ? `${primary}18` : "transparent",
          color: primary,
          border: `1.5px solid ${primary}`,
          boxShadow: isClicked
            ? `0 0 8px ${primary}44`
            : `0 0 20px ${primary}55, 0 0 40px ${primary}22`,
          textShadow: `0 0 10px ${primary}88`,
        };
      default:
        return {
          ...base,
          background: primary,
          color: "#fff",
          border: "none",
          boxShadow: isClicked ? "0 2px 8px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.2)",
          opacity: isClicked ? 0.9 : 1,
        };
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0f172a",
      }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.5)",
            animation: "ping 1.2s ease-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 8, borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.3)",
            animation: "ping 1.2s ease-out infinite 0.3s",
          }} />
          <span style={{ fontSize: "1.5rem", zIndex: 1 }}>🔗</span>
        </div>
        <style>{`@keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#f8fafc", color: "#64748b", textAlign: "center", padding: "2rem",
      }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
        <h2 style={{ color: "#0f172a", margin: "0 0 0.5rem", fontSize: "1.25rem" }}>Page not found</h2>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>This link page doesn't exist.</p>
      </div>
    );
  }

  const fontFamily = theme.font ? `'${theme.font}', sans-serif` : "system-ui, sans-serif";
  const textColor = theme.text || "#1e293b";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .profile-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 56px 20px 64px;
          font-family: ${fontFamily};
          color: ${textColor};
          position: relative;
          overflow-x: hidden;
          background: ${theme.background || "#090b16"};
          background-image:
            radial-gradient(circle at 15% 10%, ${theme.primary || "#6366f1"}22, transparent 18%),
            radial-gradient(circle at 90% 10%, ${theme.primary || "#fb923c"}20, transparent 18%),
            radial-gradient(circle at 50% 100%, ${theme.primary || "#6366f1"}08, transparent 26%);
        }

        /* Ambient background orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(100px);
          opacity: 0.12;
          z-index: 0;
        }
        .orb-1 {
          width: 650px; height: 650px;
          top: -220px; left: -220px;
          background: ${theme.primary || "#6366f1"};
        }
        .orb-2 {
          width: 520px; height: 520px;
          bottom: -180px; right: -170px;
          background: ${theme.primary || "#6366f1"};
          opacity: 0.1;
        }

        .profile-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 8px;
        }

        .profile-card {
          width: 100%;
          padding: 34px 30px 28px;
          border-radius: 32px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 40px 90px rgba(15,23,42,0.22);
          backdrop-filter: blur(28px);
        }

        /* Avatar */
        .avatar-wrap {
          margin-bottom: 20px;
        }
        .avatar-ring {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          padding: 4px;
          background: conic-gradient(
            from 0deg,
            ${theme.primary || "#6366f1"},
            ${theme.primary || "#a855f7"}88,
            ${theme.primary || "#6366f1"}
          );
          box-shadow: 0 0 0 4px ${theme.primary || "#6366f1"}22,
                      0 14px 40px ${theme.primary || "#6366f1"}30;
          animation: spin-slow 6s linear infinite;
        }
        @keyframes spin-slow { to { transform: rotate(360deg); } }

        .avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${theme.background?.includes("gradient")
            ? "rgba(0,0,0,0.4)"
            : theme.background || "#f8fafc"};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          animation: spin-slow 6s linear infinite reverse;
        }

        /* Name & bio */
        .profile-name {
          font-size: 1.88rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 10px;
          text-align: center;
          line-height: 1.12;
          color: ${textColor};
        }
        .profile-bio {
          font-size: 0.98rem;
          text-align: center;
          opacity: 0.75;
          line-height: 1.75;
          max-width: 320px;
          margin-bottom: 32px;
          color: ${textColor};
        }

        /* Divider */
        .profile-divider {
          width: 56px;
          height: 4px;
          border-radius: 999px;
          background: ${theme.primary || "#6366f1"};
          opacity: 0.7;
          margin: 0 auto 32px;
        }

        /* Links */
        .links-stack {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 34px;
        }

        .link-btn-wrap {
          width: 100%;
        }

        .link-btn-wrap button {
          width: 100%;
          min-height: 56px;
          border-radius: 20px;
          outline: none;
          border: none;
          font: inherit;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .btn-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .btn-text {
          flex: 1;
          text-align: center;
        }

        .link-btn-wrap button:hover {
          filter: brightness(1.06);
        }

        /* Footer */
        .profile-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .footer-line {
          width: 40px;
          height: 1px;
          background: ${textColor};
          opacity: 0.15;
        }
        .footer-text {
          font-size: 0.75rem;
          opacity: 0.33;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: ${textColor};
        }

        @media (max-width: 480px) {
          .profile-page { padding: 36px 16px 48px; }
          .profile-name { font-size: 1.4rem; }
          .avatar-ring { width: 80px; height: 80px; }
          .avatar-inner { font-size: 2rem; }
        }
      `}</style>

      <div className="profile-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="profile-inner">
          <div className="profile-card">

          {/* Avatar */}
          <motion.div
            className="avatar-wrap"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.05 }}
          >
            <div className="avatar-ring">
              <div className="avatar-inner">
                {data.avatar || "👤"}
              </div>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            className="profile-name"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {data.tenant_name}
          </motion.h1>

          {/* Bio */}
          {data.bio && (
            <motion.p
              className="profile-bio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              {data.bio}
            </motion.p>
          )}

          {/* Divider */}
          <motion.div
            className="profile-divider"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.5 }}
            transition={{ delay: 0.28 }}
          />

          {/* Links */}
          <div className="links-stack">
            {(!data.links || data.links.length === 0) && (
              <p style={{ textAlign: "center", opacity: 0.4, fontSize: "0.875rem" }}>
                No links added yet.
              </p>
            )}

            {data.links?.map((link: any, i: number) => (
              <motion.div
                key={link.id}
                className="link-btn-wrap"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
              >
                <button
                  style={getButtonStyle(clickedId === link.id)}
                  onClick={() => handleClick(link.id, link.url)}
                >
                  {link.icon && (
                    <span className="btn-icon">{link.icon}</span>
                  )}
                  <span className="btn-text">{link.title}</span>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            className="profile-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="footer-line" />
            <span className="footer-text">🔗 LINKHUB</span>
          </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}