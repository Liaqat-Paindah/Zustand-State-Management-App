"use client";

import { useEffect } from "react";
import { useAuth } from "@/stores/userAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((state) => state.hydrate);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        hydrate(response.ok ? data.user : null);
      } catch {
        hydrate(null);
      }
    };

    loadUser();
  }, [hydrate]);

  return children;
}
