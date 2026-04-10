"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { getTenantInfo } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const tenant = getTenantInfo();

  useEffect(() => {
    Promise.all([
      api.get("/links/analytics/summary"),
      api.get("/links/"),
    ]).then(([s, l]) => {
      setSummary(s.data);
      setLinks(l.data.links.slice(0, 3));
    });
  }, []);

  const stats = [
    { label: "Total Clicks", value: summary?.total_clicks ?? "—", icon: "👆", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Links", value: summary?.total_links ?? "—", icon: "🔗", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "This Week", value: summary?.weekly_clicks ?? "—", icon: "📈", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {tenant?.name?.split(" ")[0]} 👋</h1>
          <p className="page-sub">Here's what's happening with your link page</p>
        </div>
        <Link href={`/?tenant=${tenant?.subdomain}`} target="_blank" className="preview-btn">
          Preview page →
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="section-title">Quick Actions</div>
      <div className="quick-actions">
        {[
          { href: "/dashboard/links", icon: "🔗", title: "Manage Links", desc: "Add, remove, reorder your links" },
          { href: "/dashboard/analytics", icon: "📊", title: "View Analytics", desc: "Click heatmaps and top performers" },
          { href: "/dashboard/theme", icon: "🎨", title: "Customize Theme", desc: "Change colors, fonts, and styles" },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="quick-card">
            <span className="quick-icon">{action.icon}</span>
            <div>
              <div className="quick-title">{action.title}</div>
              <div className="quick-desc">{action.desc}</div>
            </div>
            <span className="quick-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Recent links preview */}
      {links.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">Recent Links</div>
            <Link href="/dashboard/links" className="section-link">View all →</Link>
          </div>
          <div className="recent-links">
            {links.map((link) => (
              <div key={link.id} className="recent-link-item">
                <span className="link-icon-sm">{link.icon || "🔗"}</span>
                <span className="link-title-sm">{link.title}</span>
                <span className="link-url-sm">{link.url}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
        .page-sub { color: #64748b; margin: 0.25rem 0 0; font-size: 0.9rem; }
        .preview-btn { background: #0f172a; color: #fff; padding: 0.625rem 1.25rem; border-radius: 10px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: opacity 0.15s; white-space: nowrap; }
        .preview-btn:hover { opacity: 0.8; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .stat-value { font-size: 1.75rem; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }
        .stat-label { font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem; }

        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .section-title { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
        .section-link { font-size: 0.8rem; color: #6366f1; text-decoration: none; }

        .quick-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
        .quick-card { display: flex; align-items: center; gap: 1rem; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 1rem 1.25rem; text-decoration: none; transition: all 0.15s; }
        .quick-card:hover { border-color: #6366f1; transform: translateX(4px); }
        .quick-icon { font-size: 1.25rem; width: 40px; height: 40px; background: #f8fafc; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .quick-title { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
        .quick-desc { font-size: 0.8rem; color: #94a3b8; }
        .quick-arrow { margin-left: auto; color: #cbd5e1; font-size: 1rem; transition: color 0.15s; }
        .quick-card:hover .quick-arrow { color: #6366f1; }

        .recent-links { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
        .recent-link-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; border-bottom: 1px solid #f8fafc; }
        .recent-link-item:last-child { border-bottom: none; }
        .link-icon-sm { font-size: 1rem; }
        .link-title-sm { font-size: 0.875rem; font-weight: 500; color: #1e293b; flex: 1; }
        .link-url-sm { font-size: 0.75rem; color: #94a3b8; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
          .page-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}