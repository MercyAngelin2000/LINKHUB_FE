"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, getTenantInfo, clearAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⊞", label: "Overview" },
  { href: "/dashboard/links", icon: "🔗", label: "Links" },
  { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
  { href: "/dashboard/theme", icon: "🎨", label: "Theme" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    setTenant(getTenantInfo());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!tenant) return null;

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <span className="logo-mark">🔗</span>
            <span className="logo-name">LinkHub</span>
          </div>

          <div className="tenant-badge">
            <span className="tenant-avatar">{tenant.name?.[0]?.toUpperCase()}</span>
            <div className="tenant-info">
              <span className="tenant-name">{tenant.name}</span>
              <span className="tenant-sub">{tenant.subdomain}.linkhub.com</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {active && <motion.span className="nav-indicator" layoutId="indicator" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <a
            href={`/?tenant=${tenant.subdomain}`}
            target="_blank"
            className="view-profile-btn"
          >
            <span>👁</span> View profile
          </a>
          <button className="logout-btn" onClick={handleLogout}>
            <span>→</span> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <span>🔗</span> LinkHub
        </div>
        <button className="menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="mobile-tenant">
              <span className="mobile-avatar">{tenant.name?.[0]?.toUpperCase()}</span>
              <div>
                <div className="mobile-name">{tenant.name}</div>
                <div className="mobile-subdomain">{tenant.subdomain}.linkhub.com</div>
              </div>
            </div>

            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-item ${active ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              );
            })}

            <button className="mobile-logout" onClick={handleLogout}>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <main className="dashboard-main">
        {children}
      </main>

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem 1rem;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 100;
        }
        .sidebar-top { display: flex; flex-direction: column; gap: 1.5rem; }
        .sidebar-logo { display: flex; align-items: center; gap: 0.5rem; padding: 0 0.5rem; }
        .logo-mark { font-size: 1.25rem; }
        .logo-name { font-size: 1rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }

        .tenant-badge {
          display: flex; align-items: center; gap: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 0.75rem;
        }
        .tenant-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.9rem;
          flex-shrink: 0;
        }
        .tenant-name { display: block; color: #fff; font-size: 0.85rem; font-weight: 600; }
        .tenant-sub { display: block; color: #64748b; font-size: 0.7rem; margin-top: 1px; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; }
        .nav-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s;
          position: relative;
        }
        .nav-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nav-item.active { color: #fff; background: rgba(99,102,241,0.2); }
        .nav-icon { font-size: 1rem; flex-shrink: 0; }
        .nav-indicator {
          position: absolute; left: 0; top: 25%; bottom: 25%;
          width: 3px; background: #6366f1; border-radius: 999px;
        }

        .sidebar-bottom { display: flex; flex-direction: column; gap: 0.5rem; }
        .view-profile-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          border-radius: 10px;
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.15s;
        }
        .view-profile-btn:hover { background: rgba(99,102,241,0.25); }
        .logout-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          border-radius: 10px;
          background: transparent;
          color: #64748b;
          border: none;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .logout-btn:hover { color: #f87171; background: rgba(239,68,68,0.08); }

        /* ── Main content ── */
        .dashboard-main {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
          padding: 2rem;
        }

        /* ── Mobile ── */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          z-index: 200;
        }
        .mobile-logo { color: #fff; font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem; }
        .menu-btn { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; padding: 0.5rem; }

        .mobile-menu {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 260px;
          background: #0f172a;
          z-index: 300;
          padding: 1.5rem 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .mobile-tenant {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1rem; margin-bottom: 0.5rem;
          background: rgba(255,255,255,0.05); border-radius: 12px;
        }
        .mobile-avatar {
          width: 36px; height: 36px; background: linear-gradient(135deg,#6366f1,#a855f7);
          border-radius: 10px; color: #fff; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-name { color: #fff; font-size: 0.875rem; font-weight: 600; }
        .mobile-subdomain { color: #64748b; font-size: 0.7rem; }
        .mobile-nav-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem; border-radius: 10px;
          color: #64748b; text-decoration: none; font-size: 0.875rem; font-weight: 500;
          transition: all 0.15s;
        }
        .mobile-nav-item.active { color: #fff; background: rgba(99,102,241,0.2); }
        .mobile-logout {
          margin-top: auto; padding: 0.75rem; border-radius: 10px;
          background: none; border: 1px solid rgba(239,68,68,0.3);
          color: #f87171; font-size: 0.875rem; cursor: pointer;
        }
        .mobile-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 250;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-header { display: flex; }
          .dashboard-main { margin-left: 0; padding: 1rem; padding-top: calc(56px + 1rem); }
        }
      `}</style>
    </div>
  );
}