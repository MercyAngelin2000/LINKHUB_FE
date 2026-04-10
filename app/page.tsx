"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { getTenant } from "@/lib/tenant";
import { applyTheme } from "@/lib/theme";
import { motion } from "framer-motion";

export default function Home() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenant = getTenant();

    api.get(`/links?tenant=${tenant}`).then((res) => {
      setLinks(res.data.links);
      applyTheme(res.data.theme);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading links...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">

      <h1 className="text-2xl font-semibold mb-5">My Links</h1>
      <br />

      {/* EMPTY STATE */}
      {links.length === 0 && (
        <p className="text-gray-400">No links added yet</p>
      )}

      <div className="w-full max-w-sm space-y-4">
        {links.map((link) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              api.post(`/links/click/${link.id}`).finally(() => {
                window.open(link.url, "_blank");
              });
            }}
            className="block text-white text-center py-3 font-medium mb-5 shadow rounded-lg transition-transform hover:scale-105"
            style={{
              background: "var(--primary)",
              borderRadius: "var(--button-radius)",
              marginBottom: "1.25rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              padding: "0.5rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.01em",
              fontFamily: "inherit",
              transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
              transform: "scale(1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {link.title}
          </motion.a>
        ))}
      </div>

    </div>
  );
}