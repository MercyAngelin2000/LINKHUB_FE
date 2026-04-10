"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];
const HOUR_LABELS = ["12a","1","2","3","4","5","6","7","8","9","10","11","12p","1","2","3","4","5","6","7","8","9","10","11"];

// ── Visual Heatmap Grid ───────────────────────────────────────
function HeatmapGrid({ data }: { data: { hour: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="heatmap-outer">
      <div className="heatmap-grid">
        {data.map(({ hour, count }) => {
          const intensity = count / max;
          // Color: transparent → indigo based on intensity
          const alpha = Math.round((0.08 + intensity * 0.92) * 255).toString(16).padStart(2, "0");
          const bg = `#6366f1${alpha}`;
          return (
            <div key={hour} className="heatmap-cell" title={`${HOUR_LABELS[hour]}:00 — ${count} clicks`}>
              <div className="heatmap-block" style={{ backgroundColor: bg }} />
              <span className="heatmap-hour">{HOUR_LABELS[hour]}</span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="heatmap-legend">
        <span>No activity</span>
        <div className="legend-gradient" />
        <span>Peak</span>
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", borderRadius: 8, padding: "0.4rem 0.75rem",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)"
    }}>
      <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: "0 0 2px" }}>{label}</p>
      <p style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
        {payload[0].value} clicks
      </p>
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
      // Ensure all 24 hours exist
      const hourMap: Record<number, number> = {};
      h.data.forEach((d: any) => { hourMap[d.hour] = d.count; });
      const fullHourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourMap[i] || 0 }));

      setHourly(fullHourly);
      setTopLinks(t.data);
      setSources(s.data);
      setSummary(sum.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "1rem", color: "#94a3b8" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #f1f5f9", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .6s linear infinite" }} />
        <p style={{ margin: 0 }}>Loading analytics...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  const topLink = topLinks[0];

  return (
    <div className="analytics-wrap">
      {/* Page header */}
      <div className="page-head">
        <h1 className="page-title">Analytics</h1>
        <span className="page-badge">Last 30 days</span>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        {[
          { icon: "👆", label: "Total Clicks", value: (summary?.total_clicks ?? 0).toLocaleString(), delta: "+12%", color: "#6366f1", bg: "#eef2ff" },
          { icon: "📅", label: "This Week", value: (summary?.weekly_clicks ?? 0).toLocaleString(), delta: "+5%", color: "#0ea5e9", bg: "#e0f2fe" },
          { icon: "🏆", label: "Top Link", value: topLink?.name ?? "—", sub: topLink ? `${topLink.clicks} clicks` : "", color: "#f59e0b", bg: "#fef3c7" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="summary-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="sc-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
            <div className="sc-body">
              <div className="sc-value-row">
                <span className="sc-value" style={{ color: card.color }}>
                  {String(card.value).length > 12 ? String(card.value).slice(0, 12) + "…" : card.value}
                </span>
                {card.delta && <span className="sc-delta">{card.delta}</span>}
                {card.sub && <span className="sc-sub">{card.sub}</span>}
              </div>
              <span className="sc-label">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="chart-head">
          <div>
            <h2 className="chart-title">Click Heatmap by Hour</h2>
            <p className="chart-sub">Darker = more clicks at that hour of the day</p>
          </div>
          <span className="chart-badge">24-hour view</span>
        </div>
        <HeatmapGrid data={hourly} />
      </motion.div>

      {/* Bar + Pie */}
      <div className="two-col">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="chart-head">
            <h2 className="chart-title">Top Links</h2>
          </div>
          {topLinks.length === 0
            ? <p className="empty-chart">No click data yet. Share your profile to start collecting data.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topLinks} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                  <Bar dataKey="clicks" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="chart-head">
            <h2 className="chart-title">Traffic Sources</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sources}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="42%"
                outerRadius={70}
                paddingAngle={3}
                strokeWidth={0}
              >
                {sources.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any, name: any) => [`${v}%`, name]}
                contentStyle={{ background: "#0f172a", border: "none", borderRadius: 8, color: "#fff", fontSize: "0.8rem" }}
              />
              <Legend
                iconType="circle" iconSize={7}
                formatter={(val) => <span style={{ color: "#64748b", fontSize: "0.775rem" }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <style jsx>{`
        .analytics-wrap { max-width: 900px; padding-bottom: 2.5rem; }

        .page-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .page-title { font-size: 1.7rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
        .page-badge { background: #f1f5f9; color: #64748b; font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 999px; font-weight: 500; }

        /* Summary cards */
        .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
        .summary-card {
          background: #fff; border: 1px solid #e8edf3; border-radius: 16px;
          padding: 1.25rem; display: flex; align-items: center; gap: 0.875rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .sc-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        .sc-body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .sc-value-row { display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap; }
        .sc-value { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
        .sc-delta { font-size: 0.72rem; color: #10b981; font-weight: 700; }
        .sc-sub { font-size: 0.72rem; color: #94a3b8; }
        .sc-label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

        /* Chart cards */
        .chart-card {
          background: #fff; border: 1px solid #e8edf3; border-radius: 16px;
          padding: 1.5rem; margin-bottom: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .chart-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; gap: 1rem; }
        .chart-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
        .chart-sub { font-size: 0.75rem; color: #94a3b8; margin: 0.2rem 0 0; }
        .chart-badge { background: #f1f5f9; color: #64748b; font-size: 0.7rem; padding: 0.25rem 0.6rem; border-radius: 999px; white-space: nowrap; }

        /* Heatmap */
        :global(.heatmap-outer) { display: flex; flex-direction: column; gap: 0.625rem; }
        :global(.heatmap-grid) { display: grid; grid-template-columns: repeat(12, 1fr); gap: 5px; }
        :global(.heatmap-cell) { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        :global(.heatmap-block) {
          width: 100%; border-radius: 6px;
          aspect-ratio: 1; min-height: 26px;
          transition: transform 0.15s;
          cursor: default;
        }
        :global(.heatmap-block:hover) { transform: scale(1.15); }
        :global(.heatmap-hour) { font-size: 0.58rem; color: #94a3b8; line-height: 1; }
        :global(.heatmap-legend) {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.7rem; color: #94a3b8; margin-top: 0.25rem;
        }
        :global(.legend-gradient) {
          flex: 1; max-width: 120px; height: 6px; border-radius: 999px;
          background: linear-gradient(to right, rgba(99,102,241,0.08), #6366f1);
        }

        /* Two-column layout */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .two-col .chart-card { margin-bottom: 0; }

        .empty-chart { text-align: center; color: #94a3b8; font-size: 0.825rem; padding: 2.5rem 1rem; }

        @media (max-width: 768px) {
          .summary-cards { grid-template-columns: 1fr; }
          .two-col { grid-template-columns: 1fr; }
          :global(.heatmap-grid) { grid-template-columns: repeat(8, 1fr); }
        }
      `}</style>
    </div>
  );
}