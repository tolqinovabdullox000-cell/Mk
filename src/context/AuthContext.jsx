import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function getAuthError(error) {
  return error instanceof Error ? error.message : "Autentifikatsiyada noma'lum xatolik yuz berdi";
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState(
    supabase ? '' : 'Supabase sozlanmagan. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY kiriting.',
  );

  useEffect(() => {
    if (!supabase) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError('');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setAuthError(`Profilni yuklashda xatolik: ${error.message}`);
        setUser(null);
      } else if (!profile || !['admin', 'teacher'].includes(profile.role)) {
        setAuthError("Profil topilmadi yoki bu hisobga ruxsat berilmagan. Administratorga murojaat qiling.");
        setUser(null);
      } else {
        setAuthError('');
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile.full_name || session.user.email,
          role: profile.role,
        });
      }
      setLoading(false);
    }

    loadProfile().catch((error) => {
      if (!active) return;
      setAuthError(`Profilni yuklashda xatolik: ${getAuthError(error)}`);
      setUser(null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [session]);

  const login = async (email, password) => {
    if (!supabase) return { ok: false, error: 'Supabase sozlanmagan.' };

    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, error: error.message };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) return { ok: false, error: `Profilni tekshirishda xatolik: ${profileError.message}` };
      if (!profile || !['admin', 'teacher'].includes(profile.role)) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) return { ok: false, error: `Profil topilmadi. Chiqishda xatolik: ${signOutError.message}` };
        return { ok: false, error: "Profil topilmadi yoki bu hisobga ruxsat berilmagan." };
      }

      const signedInUser = {
        id: data.user.id,
        email: data.user.email,
        name: profile.full_name || data.user.email,
        role: profile.role,
      };
      setUser(signedInUser);
      return { ok: true, user: signedInUser };
    } catch (error) {
      return { ok: false, error: getAuthError(error) };
    }
  };

  const logout = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setAuthError(`Tizimdan chiqishda xatolik: ${error.message}`);
      else {
        setUser(null);
        setAuthError('');
      }
    } catch (error) {
      setAuthError(`Tizimdan chiqishda xatolik: ${getAuthError(error)}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth faqat AuthProvider ichida ishlatiladi');
  return ctx;
}
