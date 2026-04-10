"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, getTenantInfo, clearAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⊞", label: "Overview", exact: true },
  { href: "/dashboard/links", icon: "🔗", label: "Links", exact: false },
  { href: "/dashboard/analytics", icon: "📊", label: "Analytics", exact: false },
  { href: "/dashboard/theme", icon: "🎨", label: "Theme", exact: false },
];

function NavItem({ item, pathname }: { item: typeof NAV_ITEMS[0]; pathname: string }) {
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link href={item.href} className={`nav-item ${active ? "nav-active" : ""}`}>
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
      {active && (
        <motion.span
          className="nav-pill"
          layoutId="nav-pill"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    setTenant(getTenantInfo());
  }, []);

  const handleLogout = () => { clearAuth(); router.push("/login"); };

  if (!tenant) return null;

  const initial = tenant.name?.[0]?.toUpperCase() || "?";

  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">🔗</div>
            <span className="logo-text">LinkHub</span>
          </div>

          {/* Tenant card */}
          <div className="tenant-card">
            <div className="tenant-avatar">{initial}</div>
            <div className="tenant-meta">
              <span className="tenant-name">{tenant.name}</span>
              <span className="tenant-sub">{tenant.subdomain}.linkhub.com</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <span className="nav-group-label">Menu</span>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="sidebar-footer">
          <a
            href={`/?tenant=${tenant.subdomain}`}
            target="_blank"
            className="footer-btn preview-btn"
          >
            <span>👁</span>
            <span>View profile</span>
          </a>
          <button className="footer-btn logout-btn" onClick={handleLogout}>
            <span>⇥</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="mobile-bar">
        <div className="mobile-logo">🔗 <span>LinkHub</span></div>
        <button className="burger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.aside
              className="mobile-drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="tenant-card" style={{ margin: "0 0 1rem" }}>
                <div className="tenant-avatar">{initial}</div>
                <div className="tenant-meta">
                  <span className="tenant-name">{tenant.name}</span>
                  <span className="tenant-sub">{tenant.subdomain}.linkhub.com</span>
                </div>
              </div>
              <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                  <NavItem key={item.href} item={item} pathname={pathname} />
                ))}
              </nav>
              <div className="sidebar-footer" style={{ paddingBottom: 0 }}>
                <a href={`/?tenant=${tenant.subdomain}`} target="_blank" className="footer-btn preview-btn">
                  <span>👁</span><span>View profile</span>
                </a>
                <button className="footer-btn logout-btn" onClick={handleLogout}>
                  <span>⇥</span><span>Sign out</span>
                </button>
              </div>
            </motion.aside>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="main-content">
        {children}
      </main>

      <style jsx global>{`
        /* ── Shell ── */
        .shell { display: flex; min-height: 100vh; background: #f1f5f9; }

        /* ── Sidebar ── */
        .sidebar {
          width: 232px; min-height: 100vh; background: #0f172a;
          display: flex; flex-direction: column; justify-content: space-between;
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
        }
        .sidebar-inner { padding: 1.25rem 0.875rem; display: flex; flex-direction: column; gap: 1.25rem; }

        .sidebar-logo { display: flex; align-items: center; gap: 0.5rem; padding: 0 0.25rem; }
        .logo-icon { font-size: 1.2rem; }
        .logo-text { font-size: 1rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }

        .tenant-card {
          display: flex; align-items: center; gap: 0.625rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px; padding: 0.75rem;
        }
        .tenant-avatar {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff; font-size: 0.875rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .tenant-name { display: block; color: #f1f5f9; font-size: 0.8rem; font-weight: 600; }
        .tenant-sub { display: block; color: #64748b; font-size: 0.68rem; margin-top: 1px; }

        .nav-group-label {
          display: block; font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #475569; padding: 0 0.375rem; margin-bottom: 0.25rem;
        }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

        .nav-item {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.6rem 0.75rem; border-radius: 10px;
          color: #94a3b8 !important; /* ← FIXED: was invisible */
          text-decoration: none; font-size: 0.85rem; font-weight: 500;
          position: relative; transition: color 0.15s, background 0.15s;
        }
        .nav-item:hover { color: #e2e8f0 !important; background: rgba(255,255,255,0.06); }
        .nav-active { color: #fff !important; background: rgba(99,102,241,0.18) !important; }
        .nav-icon { font-size: 0.95rem; flex-shrink: 0; width: 20px; text-align: center; }
        .nav-label { flex: 1; }
        .nav-pill {
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; background: #6366f1; border-radius: 999px;
        }

        .sidebar-footer { padding: 0.875rem; display: flex; flex-direction: column; gap: 0.375rem; }
        .footer-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 0.75rem; border-radius: 9px;
          font-size: 0.8rem; font-weight: 500; cursor: pointer;
          transition: all 0.15s; text-decoration: none; border: none;
          font-family: inherit;
        }
        .preview-btn { background: rgba(99,102,241,0.12); color: #818cf8; }
        .preview-btn:hover { background: rgba(99,102,241,0.22); }
        .logout-btn { background: transparent; color: #64748b; }
        .logout-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; }

        /* ── Main ── */
        .main-content { margin-left: 232px; flex: 1; padding: 2rem 1.75rem; min-height: 100vh; }

        /* ── Mobile ── */
        .mobile-bar {
          display: none; position: fixed; top: 0; left: 0; right: 0; height: 54px;
          background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.07);
          align-items: center; justify-content: space-between;
          padding: 0 1rem; z-index: 200;
        }
        .mobile-logo { color: #fff; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; }
        .burger { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; padding: 0.5rem; }

        .mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: 256px;
          background: #0f172a; z-index: 300; padding: 1.25rem 0.875rem;
          display: flex; flex-direction: column; gap: 1rem;
          overflow-y: auto;
        }
        .mobile-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 250;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-bar { display: flex; }
          .main-content { margin-left: 0; padding: 1rem; padding-top: calc(54px + 1rem); }
        }
      `}</style>
    </div>
  );
}