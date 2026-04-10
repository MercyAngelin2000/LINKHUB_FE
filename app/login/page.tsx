"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { saveAuth } from "@/lib/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [subdomain, setSubdomain] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { subdomain, password });
      saveAuth(res.data.access_token, res.data.tenant);
      router.push("/dashboard");
    } catch {
      setError("Invalid subdomain or password. Try: alex / password123");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="login-logo">
          <span className="logo-icon">🔗</span>
          <span className="logo-text">LinkHub</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to manage your link page</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Your subdomain</label>
            <div className="subdomain-input">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="yourname"
                required
              />
              <span className="subdomain-suffix">.linkhub.com</span>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.p
              className="error-msg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              "Sign in →"
            )}
          </button>
        </form>

        <div className="demo-hint">
          <p>Demo accounts:</p>
          <div className="demo-accounts">
            {["alex", "sarah", "marcus"].map((name) => (
              <button
                key={name}
                className="demo-chip"
                onClick={() => { setSubdomain(name); setPassword("password123"); }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }
        .login-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .login-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .logo-icon { font-size: 1.5rem; }
        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.25rem;
          letter-spacing: -0.03em;
        }
        .login-subtitle {
          color: #94a3b8;
          margin: 0 0 2rem;
          font-size: 0.9rem;
        }
        .login-form { display: flex; flex-direction: column; gap: 1rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .input-group label { font-size: 0.8rem; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .subdomain-input { display: flex; align-items: center; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; }
        .subdomain-input:focus-within { border-color: #6366f1; }
        .subdomain-input input { background: transparent; border: none; outline: none; padding: 0.75rem 0.75rem; color: #fff; font-size: 0.95rem; flex: 1; min-width: 0; }
        .subdomain-suffix { padding: 0.75rem 0.75rem 0.75rem 0; color: #6366f1; font-size: 0.85rem; white-space: nowrap; }
        input[type="password"] { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.75rem; color: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        input[type="password"]:focus { border-color: #6366f1; }
        .error-msg { color: #f87171; font-size: 0.85rem; background: rgba(239,68,68,0.1); border-radius: 8px; padding: 0.5rem 0.75rem; margin: 0; }
        .login-btn { background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border: none; border-radius: 10px; padding: 0.875rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; }
        .login-btn:hover { opacity: 0.9; }
        .login-btn:active { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .demo-hint { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
        .demo-hint p { font-size: 0.8rem; color: #64748b; margin: 0 0 0.6rem; }
        .demo-accounts { display: flex; gap: 0.5rem; }
        .demo-chip { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 999px; padding: 0.3rem 0.85rem; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
        .demo-chip:hover { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #fff; }
      `}</style>
    </div>
  );
}