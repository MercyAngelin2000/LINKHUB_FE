export interface ThemeConfig {
  primary?: string;
  background?: string;
  text?: string;
  radius?: string;
  font?: string;
  buttonStyle?: "solid" | "outline" | "gradient" | "neon";
  buttonGradient?: string;
  buttonBorder?: string;
  glowColor?: string;
  preset?: string;
}

export function applyTheme(theme: ThemeConfig | null) {
  if (!theme) return;

  const root = document.documentElement;
  const body = document.body;

  // CSS variables
  if (theme.primary) root.style.setProperty("--primary", theme.primary);
  if (theme.text) root.style.setProperty("--text", theme.text);
  if (theme.radius) root.style.setProperty("--button-radius", theme.radius);
  if (theme.font) root.style.setProperty("--font", theme.font);
  if (theme.glowColor) root.style.setProperty("--glow", theme.glowColor);

  // Background (can be gradient or solid)
  if (theme.background) {
    body.style.background = theme.background;
    body.style.backgroundAttachment = "fixed";
  }

  // Text color
  if (theme.text) body.style.color = theme.text;

  // Dynamic font loading
  if (theme.font) {
    const fontMap: Record<string, string> = {
      "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
      "DM Mono": "DM+Mono:wght@400;500",
      "DM Sans": "DM+Sans:wght@400;500;600",
      "Bebas Neue": "Bebas+Neue",
      "Playfair Display": "Playfair+Display:wght@400;600;700",
    };

    const fontParam = fontMap[theme.font];
    if (fontParam) {
      const existingLink = document.getElementById("dynamic-font");
      if (existingLink) existingLink.remove();

      const link = document.createElement("link");
      link.id = "dynamic-font";
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
      document.head.appendChild(link);

      body.style.fontFamily = `'${theme.font}', sans-serif`;
    }
  }
}

// 3 preset themes for demonstration
export const PRESET_THEMES: Record<string, ThemeConfig> = {
  midnight: {
    preset: "midnight",
    primary: "#a855f7",
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    text: "#f1f5f9",
    radius: "999px",
    font: "Space Grotesk",
    buttonStyle: "gradient",
    buttonGradient: "linear-gradient(135deg, #a855f7, #6366f1)",
  },
  minimal: {
    preset: "minimal",
    primary: "#10b981",
    background: "#ffffff",
    text: "#111827",
    radius: "8px",
    font: "DM Mono",
    buttonStyle: "outline",
    buttonBorder: "2px solid #111827",
  },
  neon: {
    preset: "neon",
    primary: "#f59e0b",
    background: "linear-gradient(180deg, #000000 0%, #1a0a00 100%)",
    text: "#fef3c7",
    radius: "4px",
    font: "Bebas Neue",
    buttonStyle: "neon",
    glowColor: "#f59e0b",
  },
};