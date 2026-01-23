import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: any;
  user: any;
  role: string | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // SESSION PERSISTENCE: Load from localStorage on init
  const [session, setSession] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('vm_session_cache');
      if (cached) {
        const { session: cachedSession, timestamp } = JSON.parse(cached);
        // Use cached session if less than 5 minutes old
        if (Date.now() - timestamp < 300000) {
          return cachedSession;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached session', e);
    }
    return null;
  });

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getRoleFromDB = async (userId: string, forceFetch = false) => {
    // 1. Check user_metadata FIRST as requested
    const metadataRole = session?.user?.user_metadata?.role;
    try {
      if (metadataRole && session?.user) {
        const formattedRole = String(metadataRole).toLowerCase();
        setRole(formattedRole);
        return formattedRole;
      }
    } catch (e) {
      console.error("Metadata Role parse error", e);
    }

    if (role && !forceFetch) return role;

    try {
      if (!forceFetch) {
        const cached = localStorage.getItem(`vm_user_role_${userId}`);
        if (cached) {
          setRole(cached);
          return cached;
        }
      }

      const currentUserEmail = session?.user?.email;
      if (currentUserEmail === 'hello@venturemond.com') {
        setRole('admin');
        localStorage.setItem(`vm_user_role_${userId}`, 'admin');
        return 'admin';
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        setRole('user');
        return 'user';
      }

      const finalRole = data.role?.toLowerCase() || 'user';
      setRole(finalRole);
      localStorage.setItem(`vm_user_role_${userId}`, finalRole);
      return finalRole;
    } catch (err: any) {
      setRole('user');
      return 'user';
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(initialSession);

          // PERSIST SESSION: Save to localStorage
          if (initialSession) {
            localStorage.setItem('vm_session_cache', JSON.stringify({
              session: initialSession,
              timestamp: Date.now()
            }));
          }

          if (initialSession?.user) {
            await getRoleFromDB(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error("Session initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Session verification timed out, forcing load completion.");
        setLoading(false);
      }
    }, 2000); // Increased to 2 seconds for slower connections

    try {
      initialize();
    } catch (e) {
      console.error("Auth initialize critical error", e);
      setLoading(false);
    }

    let subscription: any = null;
    try {
      const response = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        try {
          console.log("Auth State Changed:", event);
          setSession(currentSession);

          if (currentSession) {
            localStorage.setItem('vm_session_cache', JSON.stringify({
              session: currentSession,
              timestamp: Date.now()
            }));
          } else {
            localStorage.removeItem('vm_session_cache');
          }

          if (currentSession?.user) {
            await getRoleFromDB(currentSession.user.id, event === 'SIGNED_IN');
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('vt_leads_cache');
            setRole('user');
          }
        } catch (innerError) {
          console.error("Auth state change processing error", innerError);
        } finally {
          setLoading(false);
        }
      });
      subscription = response.data.subscription;
    } catch (e) {
      console.error("Auth subscription error", e);
      setLoading(false);
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const isAdmin = useMemo(() => {
    return session?.user?.email === 'hello@venturemond.com';
  }, [session?.user?.email]);

  const value = useMemo(() => ({
    session,
    user: session?.user,
    role,
    isAdmin,
    loading,
    refreshProfile: async () => {
      if (session?.user) await getRoleFromDB(session.user.id, true); // Manual refresh forces fetch
    }
  }), [session, role, isAdmin, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex h-screen w-screen items-center justify-center bg-[#0b0f1a]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a389]"></div>
            <p className="text-white text-sm font-medium">Verifying Session...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};