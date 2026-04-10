"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { getTenant } from "@/lib/tenant";
import { applyTheme } from "@/lib/theme";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenant = getTenant();

    api.get(`/links/public?tenant=${tenant}`).then((res) => {
      setData(res.data);
      applyTheme(res.data.theme);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleClick = (linkId: number, url: string) => {
    api.post(`/links/click/${linkId}?request_source=direct`);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-pulse">
          <div className="pulse-ring" />
          <span>🔗</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="not-found">
        <div className="nf-icon">🔍</div>
        <h2>Page not found</h2>
        <p>This link page doesn't exist or has been removed.</p>
      </div>
    );
  }

  const theme = data.theme || {};
  const buttonStyle = theme.buttonStyle || "solid";

  const getButtonStyle = () => {
    const base = {
      borderRadius: `var(--button-radius, 12px)`,
      fontFamily: "var(--font, inherit)",
    };

    switch (buttonStyle) {
      case "gradient":
        return {
          ...base,
          background: theme.buttonGradient || "var(--primary)",
          color: "#fff",
          border: "none",
        };
      case "outline":
        return {
          ...base,
          background: "transparent",
          color: "var(--text)",
          border: theme.buttonBorder || `2px solid var(--primary)`,
        };
      case "neon":
        return {
          ...base,
          background: "transparent",
          color: theme.primary || "#f59e0b",
          border: `1.5px solid ${theme.primary || "#f59e0b"}`,
          boxShadow: `0 0 12px ${theme.glowColor || theme.primary || "#f59e0b"}40`,
        };
      default:
        return {
          ...base,
          background: "var(--primary)",
          color: "#fff",
          border: "none",
        };
    }
  };

  return (
    <div className="profile-page">
      {/* Avatar + Name + Bio */}
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="avatar">
          <span className="avatar-emoji">{data.avatar || "👤"}</span>
        </div>
        <h1 className="profile-name">{data.tenant_name}</h1>
        {data.bio && <p className="profile-bio">{data.bio}</p>}
      </motion.div>

      {/* Links */}
      <div className="links-list">
        {data.links.length === 0 && (
          <div className="empty-profile">
            <p>No links here yet 👀</p>
          </div>
        )}

        {data.links.map((link: any, i: number) => (
          <motion.button
            key={link.id}
            className="link-button"
            style={getButtonStyle()}
            onClick={() => handleClick(link.id, link.url)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {link.icon && <span className="btn-icon">{link.icon}</span>}
            <span className="btn-title">{link.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        className="profile-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span>Powered by</span>
        <span className="footer-brand">🔗 LinkHub</span>
      </motion.div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1.25rem 2rem;
          color: var(--text, #1e293b);
          font-family: var(--font, 'DM Sans'), sans-serif;
        }
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
          text-align: center;
        }
        .avatar {
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
          backdrop-filter: blur(10px);
        }
        .avatar-emoji { font-size: 2rem; }
        .profile-name {
          font-size: 1.5rem; font-weight: 700;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .profile-bio {
          font-size: 0.9rem;
          opacity: 0.7;
          margin: 0;
          max-width: 280px;
          line-height: 1.5;
        }

        .links-list {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .link-button {
          width: 100%; padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; cursor: pointer;
          font-size: 0.95rem; font-weight: 600;
          transition: transform 0.15s, box-shadow 0.15s;
          text-align: center; line-height: 1.2;
        }
        .btn-icon { font-size: 1.1rem; flex-shrink: 0; }
        .btn-title { flex: 1; }

        .empty-profile {
          text-align: center; opacity: 0.5; padding: 2rem;
          font-size: 0.9rem;
        }

        .profile-footer {
          margin-top: 3rem;
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.75rem; opacity: 0.4;
        }
        .footer-brand { font-weight: 600; }

        /* Loading */
        .loading-screen {
          min-height: 100vh; display: flex;
          align-items: center; justify-content: center;
          background: #0f172a;
        }
        .loading-pulse {
          position: relative; display: flex;
          align-items: center; justify-content: center;
          font-size: 1.5rem;
        }
        .pulse-ring {
          position: absolute;
          width: 60px; height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(99,102,241,0.5);
          animation: pulse 1s ease-out infinite;
        }
        @keyframes pulse { to { transform: scale(2); opacity: 0; } }

        /* Not found */
        .not-found {
          min-height: 100vh; display: flex;
          flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 2rem; color: #64748b;
        }
        .nf-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .not-found h2 { color: #0f172a; margin: 0 0 0.5rem; }
        .not-found p { margin: 0; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}