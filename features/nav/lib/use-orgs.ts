"use client";

import * as React from "react";

// ============================================
// ORGS HOOK (Unit 16.2)
// ============================================
// Fetches the signed-in user's organization memberships
// from GET /api/orgs and persists the active selection
// in localStorage so the sidebar context survives reloads.

export interface MyOrg {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  role: string;
  joinedAt: string;
}

const ACTIVE_ORG_KEY = "active-org-id";

export function readActiveOrgId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ORG_KEY);
  } catch {
    return null;
  }
}

export function writeActiveOrgId(id: string) {
  try {
    localStorage.setItem(ACTIVE_ORG_KEY, id);
  } catch {
    // storage unavailable (private mode etc.) — selection stays in-memory
  }
}

interface UseOrgsResult {
  orgs: MyOrg[];
  activeOrg: MyOrg | null;
  isLoading: boolean;
  error: string | null;
  setActiveOrg: (org: MyOrg) => void;
  createOrg: (name: string) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => void;
}

export function useOrgs(enabled: boolean): UseOrgsResult {
  const [orgs, setOrgs] = React.useState<MyOrg[]>([]);
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // Bump to re-fetch after creating an org
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/orgs");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const body = (await res.json()) as { success: boolean; data?: { organizations: MyOrg[] } };
        if (!body.success || !body.data) throw new Error("Unexpected response");

        if (cancelled) return;

        setOrgs(body.data.organizations);

        let stored: string | null = null;
        try {
          stored = localStorage.getItem(ACTIVE_ORG_KEY);
        } catch {
          // ignore
        }
        const valid =
          stored && body.data.organizations.some((o) => o.id === stored)
            ? stored
            : (body.data.organizations[0]?.id ?? null);
        setActiveOrgId(valid);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load organizations");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, nonce]);

  const activeOrg = React.useMemo(
    () => orgs.find((o) => o.id === activeOrgId) ?? null,
    [orgs, activeOrgId],
  );

  const setActiveOrg = React.useCallback((org: MyOrg) => {
    setActiveOrgId(org.id);
    writeActiveOrgId(org.id);
  }, []);

  const createOrg = React.useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (!res.ok || !body.success) {
        return { ok: false, error: body.error?.message ?? "Failed to create organization" };
      }
      setNonce((n) => n + 1);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, []);

  return {
    orgs,
    activeOrg,
    isLoading,
    error,
    setActiveOrg,
    createOrg,
    refresh: () => setNonce((n) => n + 1),
  };
}
