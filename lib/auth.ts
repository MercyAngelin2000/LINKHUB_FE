// Stores JWT and tenant info in localStorage

export interface TenantInfo {
  id: number;
  name: string;
  subdomain: string;
  theme_config: Record<string, any>;
}

export function saveAuth(token: string, tenant: TenantInfo) {
  localStorage.setItem("linkhub_token", token);
  localStorage.setItem("linkhub_tenant", JSON.stringify(tenant));
}

export function getToken(): string | null {
  return localStorage.getItem("linkhub_token");
}

export function getTenantInfo(): TenantInfo | null {
  const raw = localStorage.getItem("linkhub_tenant");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("linkhub_token");
  localStorage.removeItem("linkhub_tenant");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}