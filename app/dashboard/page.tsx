"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { getTenantInfo } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [recentLinks, setRecentLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tenant = getTenantInfo();

  useEffect(() => {
    Promise.all([
      api.get("/links/analytics/summary"),
      api.get("/links/"),
    ]).then(([s, l]) => {
      setSummary(s.data);
      setRecentLinks((l.data.links || []).slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstName = tenant?.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Total Clicks",
      value: loading ? "—" : (summary?.total_clicks ?? 0).toLocaleString(),
      icon: "👆",
      accent: "#6366f1",
      bg: "#eef2ff",
    },
    {
      label: "Active Links",
      value: loading ? "—" : (summary?.total_links ?? 0),
      icon: "🔗",
      accent: "#0ea5e9",
      bg: "#e0f2fe",
    },
    {
      label: "This Week",
      value: loading ? "—" : (summary?.weekly_clicks ?? 0).toLocaleString(),
      icon: "📈",
      accent: "#10b981",
      bg: "#dcfce7",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/links",
      icon: "🔗",
      title: "Manage Links",
      desc: "Add, remove, or reorder your links",
      color: "#6366f1",
      bg: "#eef2ff",
    },
    {
      href: "/dashboard/analytics",
      icon: "📊",
      title: "View Analytics",
      desc: "Heatmaps, top links, traffic sources",
      color: "#0ea5e9",
      bg: "#e0f2fe",
    },
    {
      href: "/dashboard/theme",
      icon: "🎨",
      title: "Customize Theme",
      desc: "Change colors, fonts, button styles",
      color: "#f59e0b",
      bg: "#fef3c7",
    },
  ];

  return (
    <div className="overview">
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Welcome back, {firstName} 👋</h1>
          <p className="overview-sub">Here's what's happening with your link page</p>
        </div>
        <Link href={`/?tenant=${tenant?.subdomain}`} target="_blank" className="preview-link">
          Preview page →
        </Link>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="stat-icon-wrap" style={{ background: s.bg, color: s.accent }}>
              {s.icon}
            </div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: s.accent }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-heading">Quick Actions</div>
      <div className="actions-grid">
        {quickActions.map((a, i) => (
          <motion.div
            key={a.href}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
          >
            <Link href={a.href} className="action-card">
              <div className="action-icon-wrap" style={{ background: a.bg, color: a.color }}>
                {a.icon}
              </div>
              <div className="action-body">
                <span className="action-title">{a.title}</span>
                <span className="action-desc">{a.desc}</span>
              </div>
              <span className="action-arrow" style={{ color: a.color }}>→</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Links */}
      {recentLinks.length > 0 && (
        <>
          <div className="section-heading-row">
            <span className="section-heading" style={{ marginBottom: 0 }}>Recent Links</span>
            <Link href="/dashboard/links" className="see-all">View all →</Link>
          </div>
          <div className="recent-list">
            {recentLinks.map((link) => (
              <div key={link.id} className="recent-item">
                <span className="recent-icon">{link.icon || "🔗"}</span>
                <div className="recent-meta">
                  <span className="recent-title">{link.title}</span>
                  <span className="recent-url">{link.url}</span>
                </div>
                <a href={link.url} target="_blank" rel="noopener" className="recent-visit">↗</a>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .overview { padding-bottom: 2.5rem; width: 100%; max-width: 640px; }

        /* Header */
        .overview-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem;
        }
        .overview-title {
          font-size: 1.5rem; font-weight: 800; color: #0f172a;
          margin: 0; letter-spacing: -0.03em;
        }
        .overview-sub { color: #64748b; margin: 0.2rem 0 0; font-size: 0.825rem; }
        .preview-link {
          background: #0f172a; color: #fff;
          padding: 0.5rem 1rem; border-radius: 9px;
          text-decoration: none; font-size: 0.8rem; font-weight: 600;
          white-space: nowrap; transition: opacity 0.15s;
        }
        .preview-link:hover { opacity: 0.8; }

        /* Stats — compact 3-col */
        .stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem; margin-bottom: 1.5rem;
        }
        .stat-card {
          background: #fff; border: 1px solid #e8edf3;
          border-radius: 14px; padding: 1rem;
          display: flex; align-items: center; gap: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .stat-icon-wrap {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem;
        }
        .stat-body { display: flex; flex-direction: column; gap: 0.1rem; }
        .stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; }
        .stat-label { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }

        /* Quick actions */
        .section-heading {
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: #94a3b8;
          margin-bottom: 0.625rem; display: block;
        }
        .section-heading-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.625rem;
        }
        .see-all { font-size: 0.78rem; color: #6366f1; text-decoration: none; font-weight: 600; }

        /* Actions as 3-column grid instead of stacked */
        .actions-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem; margin-bottom: 1.5rem;
        }
        .action-card {
          display: flex; flex-direction: column; gap: 0.625rem;
          background: #fff; border: 1px solid #e8edf3;
          border-radius: 14px; padding: 1rem;
          text-decoration: none; transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .action-card:hover { border-color: #c7d2fe; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(99,102,241,0.1); }
        .action-icon-wrap {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
        }
        .action-body { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
        .action-title { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
        .action-desc { font-size: 0.72rem; color: #94a3b8; line-height: 1.4; }
        .action-arrow { font-size: 0.85rem; transition: transform 0.15s; align-self: flex-end; }
        .action-card:hover .action-arrow { transform: translateX(3px); }

        /* Recent links */
        .recent-list { background: #fff; border: 1px solid #e8edf3; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .recent-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .recent-item:last-child { border-bottom: none; }
        .recent-icon { font-size: 1.1rem; }
        .recent-meta { flex: 1; min-width: 0; }
        .recent-title { display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b; }
        .recent-url { display: block; font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }
        .recent-visit {
          width: 30px; height: 30px; border-radius: 8px;
          background: #f1f5f9; color: #64748b;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; text-decoration: none; flex-shrink: 0;
          transition: all 0.15s;
        }
        .recent-visit:hover { background: #e2e8f0; }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
          .stat-card { padding: 0.75rem; gap: 0.5rem; flex-direction: column; align-items: flex-start; }
          .stat-icon-wrap { width: 32px; height: 32px; font-size: 0.9rem; }
          .stat-value { font-size: 1.2rem; }
          .actions-grid { grid-template-columns: 1fr; }
          .overview-title { font-size: 1.2rem; }
          .overview-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
}