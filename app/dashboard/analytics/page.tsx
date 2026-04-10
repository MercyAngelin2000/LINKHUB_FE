"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e"];

// ── Heatmap ───────────────────────────────────────────────────
function HeatmapGrid({ data }: { data: { hour: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-grid">
        {data.map(({ hour, count }) => {
          const intensity = count / max;
          return (
            <div key={hour} className="heatmap-cell" title={`${hour}:00 — ${count} clicks`}>
              <div
                className="heatmap-block"
                style={{ opacity: 0.1 + intensity * 0.9 }}
              />
              <span className="heatmap-label">{hour}</span>
            </div>
          );
        })}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-bar" />
        <span>More</span>
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tt-label">{label}</p>
      <p className="tt-value">{payload[0].value} clicks</p>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [hourly, setHourly] = useState<any[]>([]);
  const [topLinks, setTopLinks] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/links/analytics/hourly"),
      api.get("/links/analytics/top-links"),
      api.get("/links/analytics/sources"),
      api.get("/links/analytics/summary"),
    ]).then(([h, t, s, sum]) => {
      setHourly(h.data);
      setTopLinks(t.data);
      setSources(s.data);
      setSummary(sum.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const totalClicks = summary?.total_clicks ?? 0;
  const weeklyClicks = summary?.weekly_clicks ?? 0;
  const topLink = topLinks[0];

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-sub">Last 30 days · All links</p>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        {[
          { label: "Total Clicks", value: totalClicks, icon: "👆", delta: "+12%" },
          { label: "This Week", value: weeklyClicks, icon: "📅", delta: "+5%" },
          { label: "Top Link", value: topLink?.name ?? "—", icon: "🏆", sub: `${topLink?.clicks ?? 0} clicks` },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="summary-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-body">
              <span className="card-value">{card.value}</span>
              {card.delta && <span className="card-delta">{card.delta}</span>}
              {card.sub && <span className="card-sub">{card.sub}</span>}
            </div>
            <div className="card-label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="chart-header">
          <h2 className="chart-title">Click Heatmap by Hour</h2>
          <span className="chart-badge">24-hour view</span>
        </div>
        <HeatmapGrid data={hourly} />
      </motion.div>

      {/* Bar + Pie side by side */}
      <div className="charts-row">

        {/* Top Links Bar Chart */}
        <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="chart-header">
            <h2 className="chart-title">Top Links</h2>
          </div>
          {topLinks.length === 0 ? (
            <p className="empty-chart">No click data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topLinks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Traffic Sources Pie */}
        <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="chart-header">
            <h2 className="chart-title">Traffic Sources</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sources}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={75}
                paddingAngle={3}
              >
                {sources.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      <style jsx>{`
        .analytics-page { padding-bottom: 2rem; }
        .page-header { margin-bottom: 1.5rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
        .page-sub { color: #94a3b8; margin: 0.25rem 0 0; font-size: 0.85rem; }

        .summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .summary-card {
          background: #fff; border: 1px solid #f1f5f9; border-radius: 16px;
          padding: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;
          position: relative; overflow: hidden;
        }
        .card-icon { font-size: 1.25rem; margin-bottom: 0.25rem; }
        .card-body { display: flex; align-items: baseline; gap: 0.5rem; }
        .card-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; letter-spacing: -0.03em; }
        .card-delta { font-size: 0.75rem; color: #10b981; font-weight: 600; }
        .card-sub { font-size: 0.75rem; color: #94a3b8; }
        .card-label { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }

        .chart-card {
          background: #fff; border: 1px solid #f1f5f9; border-radius: 16px;
          padding: 1.5rem; margin-bottom: 1rem;
        }
        .chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .chart-title { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; }
        .chart-badge { background: #f1f5f9; color: #64748b; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 999px; }

        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .heatmap-wrap { display: flex; flex-direction: column; gap: 0.75rem; }
        .heatmap-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; }
        .heatmap-cell { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .heatmap-block { width: 100%; aspect-ratio: 1; background: #6366f1; border-radius: 6px; min-height: 28px; }
        .heatmap-label { font-size: 0.6rem; color: #94a3b8; }
        .heatmap-legend { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: #94a3b8; }
        .legend-bar { flex: 1; height: 6px; border-radius: 999px; background: linear-gradient(to right, rgba(99,102,241,0.1), #6366f1); max-width: 100px; }

        :global(.custom-tooltip) {
          background: #0f172a; border-radius: 8px; padding: 0.5rem 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        :global(.tt-label) { color: #94a3b8; font-size: 0.75rem; margin: 0; }
        :global(.tt-value) { color: #fff; font-size: 0.9rem; font-weight: 600; margin: 0; }

        .empty-chart { text-align: center; color: #94a3b8; font-size: 0.875rem; padding: 2rem; }

        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; color: #94a3b8; gap: 1rem; }
        .loading-spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; }
          .charts-row { grid-template-columns: 1fr; }
          .heatmap-grid { grid-template-columns: repeat(8, 1fr); }
        }
      `}</style>
    </div>
  );
}