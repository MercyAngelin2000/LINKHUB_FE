// Gets tenant subdomain from URL or localStorage fallback

export function getTenant(): string {
  if (typeof window === "undefined") return "";

  // In production: extract from subdomain (e.g., alex.linkhub.com → "alex")
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 3) {
    return parts[0]; // subdomain
  }

  // In development: read from query param or localStorage
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tenant");
  if (fromQuery) return fromQuery;

  const stored = localStorage.getItem("linkhub_tenant");
  if (stored) {
    try {
      return JSON.parse(stored).subdomain;
    } catch {}
  }

  return "alex"; // default for dev
}