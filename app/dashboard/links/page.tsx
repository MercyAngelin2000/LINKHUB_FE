"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

// ── SortableItem ──────────────────────────────────────────────
function SortableLink({ link, onDelete }: { link: any; onDelete: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`link-item ${isDragging ? "dragging" : ""}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <span>⠿</span>
      </div>

      <span className="link-emoji">{link.icon || "🔗"}</span>

      <div className="link-meta">
        <span className="link-title">{link.title}</span>
        <span className="link-url">{link.url}</span>
      </div>

      <div className="link-actions">
        <a href={link.url} target="_blank" rel="noopener" className="action-btn preview" title="Open link">
          ↗
        </a>
        <button className="action-btn delete" onClick={() => onDelete(link.id)} title="Delete">
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ── AddLinkForm ───────────────────────────────────────────────
function AddLinkForm({ onAdd }: { onAdd: (link: any) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🔗");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const emojis = ["🔗", "🎨", "📸", "💼", "🎵", "📝", "▶️", "📧", "🐙", "🏀", "☕", "🛒"];

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) return;
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    setLoading(true);
    try {
      const res = await api.post("/links/", { title, url: finalUrl, icon });
      onAdd(res.data);
      setTitle(""); setUrl(""); setIcon("🔗");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          width: "100%", padding: "0.875rem",
          background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: "14px",
          color: "#64748b", fontSize: "0.9rem", fontWeight: 500,
          cursor: "pointer", marginTop: "0.5rem", fontFamily: "inherit",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
          (e.currentTarget as HTMLButtonElement).style.color = "#6366f1";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.05)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
          (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
          (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
        }}
      >
        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>+</span>
        Add new link
      </motion.button>
    );
  }

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%", padding: "0.75rem 1rem",
    border: `1.5px solid ${focusedInput === name ? "#6366f1" : "#e2e8f0"}`,
    borderRadius: "10px", fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a",
    background: "#fff", transition: "border-color 0.15s",
    boxShadow: focusedInput === name ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff", border: "1.5px solid #e2e8f0",
        borderRadius: "16px", padding: "1.25rem",
        marginTop: "0.75rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Form header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          New Link
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem", padding: "0.2rem", lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {/* Emoji picker */}
      <div style={{ marginBottom: "0.875rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
          Icon
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => setIcon(e)}
              style={{
                width: "36px", height: "36px", borderRadius: "8px",
                border: `2px solid ${icon === e ? "#6366f1" : "transparent"}`,
                background: icon === e ? "rgba(99,102,241,0.1)" : "#f8fafc",
                cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.1s",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Title input */}
      <div style={{ marginBottom: "0.75rem" }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.375rem" }}>
          Title
        </label>
        <input
          style={inputStyle("title")}
          placeholder="e.g. My Portfolio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocusedInput("title")}
          onBlur={() => setFocusedInput(null)}
        />
      </div>

      {/* URL input */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.375rem" }}>
          URL
        </label>
        <input
          style={inputStyle("url")}
          placeholder="e.g. mysite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setFocusedInput("url")}
          onBlur={() => setFocusedInput(null)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <button
          onClick={() => setOpen(false)}
          style={{
            padding: "0.625rem 1.125rem", borderRadius: "9px",
            border: "1.5px solid #e2e8f0", background: "#fff",
            color: "#64748b", fontSize: "0.85rem", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !url.trim()}
          style={{
            padding: "0.625rem 1.25rem", borderRadius: "9px",
            border: "none", background: loading || !title.trim() || !url.trim() ? "#c7d2fe" : "#6366f1",
            color: "#fff", fontSize: "0.85rem", fontWeight: 600,
            cursor: loading || !title.trim() || !url.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "background 0.15s",
          }}
        >
          {loading ? "Adding..." : "Add link"}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    api.get("/links/").then((res) => {
      setLinks(res.data.links);
      setLoading(false);
    });
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);

    api.post("/links/reorder", reordered.map((l, i) => ({ id: l.id, order: i + 1 })));
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/links/${id}`);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAdd = (link: any) => {
    setLinks((prev) => [...prev, link]);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading links...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Links</h1>
          <p className="page-sub">Drag to reorder • Click ✕ to remove</p>
        </div>
        <span className="link-count">{links.length} links</span>
      </div>

      {/* Empty state */}
      {links.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <h3>No links yet</h3>
          <p>Add your first link below to get started</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {links.map((link) => (
              <SortableLink key={link.id} link={link} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      <AddLinkForm onAdd={handleAdd} />

      <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.03em; }
        .page-sub { color: #94a3b8; margin: 0.25rem 0 0; font-size: 0.85rem; }
        .link-count { background: #f1f5f9; color: #64748b; padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }

        :global(.link-item) {
          display: flex; align-items: center; gap: 0.75rem;
          background: #fff; border: 1px solid #f1f5f9;
          border-radius: 14px; padding: 0.875rem 1rem;
          margin-bottom: 0.625rem;
          cursor: default;
          transition: box-shadow 0.15s;
        }
        :global(.link-item:hover) { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        :global(.link-item.dragging) { box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 10; }

        :global(.drag-handle) {
          color: #cbd5e1; cursor: grab; font-size: 1.1rem;
          padding: 0.25rem; touch-action: none;
        }
        :global(.drag-handle:active) { cursor: grabbing; }

        :global(.link-emoji) { font-size: 1.25rem; flex-shrink: 0; }

        :global(.link-meta) { flex: 1; min-width: 0; }
        :global(.link-title) { display: block; font-size: 0.9rem; font-weight: 600; color: #1e293b; }
        :global(.link-url) { display: block; font-size: 0.75rem; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        :global(.link-actions) { display: flex; gap: 0.5rem; }
        :global(.action-btn) {
          width: 32px; height: 32px;
          border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; cursor: pointer;
          text-decoration: none; transition: all 0.15s;
        }
        :global(.action-btn.preview) { background: #f1f5f9; color: #64748b; }
        :global(.action-btn.preview:hover) { background: #e2e8f0; color: #0f172a; }
        :global(.action-btn.delete) { background: #fff0f0; color: #ef4444; }
        :global(.action-btn.delete:hover) { background: #fee2e2; }

        .add-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.875rem;
          background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 14px;
          color: #64748b; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s; margin-top: 0.5rem;
        }
        .add-btn:hover { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.05); }
        .add-plus { font-size: 1.1rem; }

        .add-form {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 1.25rem;
          margin-top: 0.5rem; overflow: hidden;
        }
        .form-row { margin-bottom: 0.75rem; }
        .form-input {
          width: 100%; padding: 0.75rem;
          border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 0.9rem; outline: none;
          transition: border-color 0.15s; box-sizing: border-box;
        }
        .form-input:focus { border-color: #6366f1; }

        .emoji-picker { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .emoji-option {
          width: 36px; height: 36px; border-radius: 8px;
          border: 2px solid transparent; background: #f8fafc;
          cursor: pointer; font-size: 1rem; transition: all 0.1s;
          display: flex; align-items: center; justify-content: center;
        }
        .emoji-option:hover { background: #f1f5f9; }
        .emoji-option.selected { border-color: #6366f1; background: rgba(99,102,241,0.1); }

        .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .cancel-btn { padding: 0.625rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; font-size: 0.875rem; cursor: pointer; }
        .save-btn { padding: 0.625rem 1.25rem; border-radius: 8px; border: none; background: #6366f1; color: #fff; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .save-btn:hover { opacity: 0.9; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
        .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .empty-state h3 { color: #1e293b; margin: 0 0 0.25rem; }
        .empty-state p { margin: 0; font-size: 0.875rem; }

        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; color: #94a3b8; gap: 1rem; }
        .loading-spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}