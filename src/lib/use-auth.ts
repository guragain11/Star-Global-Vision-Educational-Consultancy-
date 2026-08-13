import { useEffect, useState } from "react";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type AuthState = {
  email: string | null;
  status: "loading" | "signed-in" | "signed-out" | "unconfigured";
};

/**
 * Tracks the Supabase auth session for /admin.
 *
 * Sessions live in Supabase's own storage and refresh automatically; we only
 * mirror the signed-in email so the UI can react.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(() => ({
    email: null,
    status: isSupabaseConfigured ? "loading" : "unconfigured",
  }));

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setState({ email: null, status: "unconfigured" });
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const email = data.session?.user.email ?? null;
      setState({ email, status: email ? "signed-in" : "signed-out" });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      setState({ email, status: email ? "signed-in" : "signed-out" });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return { ...state, signIn, signOut };
}
