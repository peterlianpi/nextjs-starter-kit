export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"
  );
}

export function getAuthBaseUrl(): string {
  return getAppUrl();
}

export function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || "Next.js Starter Kit";
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getAppUrl();
}

export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}
