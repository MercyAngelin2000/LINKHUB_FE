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

      <h1 className="text-2xl font-semibold mb-6">My Links</h1>

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
            className="block text-white text-center py-3 font-medium"
            style={{
              background: "var(--primary)",
              borderRadius: "var(--button-radius)",
            }}
          >
            {link.title}
          </motion.a>
        ))}
      </div>

    </div>
  );
}