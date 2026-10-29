import { useEffect, useState } from 'react';
import { db, isSupabaseConfigured } from '../lib/api/client';
import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(() => !isSupabaseConfigured());
  const [profile, setProfile] = useState(null);
  const [resolvedFor, setResolvedFor] = useState(null);
  const [authError, setAuthError] = useState(() => (
    isSupabaseConfigured() ? '' : 'auth.notConfigured'
  ));
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured()) return undefined;
    const client = db();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      if (!nextSession) {
        setProfile(null);
        setResolvedFor(null);
      } else {
        setAuthError('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    if (!userId) return () => { active = false; };

    if (resolvedFor === userId) return () => { active = false; };

    const client = db();
    client.from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (!active) return;
        if (error || !data || !['admin', 'teacher'].includes(data.role)) {
          setProfile(null);
          setAuthError(error ? 'auth.profileLoadFailed' : 'auth.profileMissing');
          const { error: signOutError } = await client.auth.signOut();
          if (signOutError && active) setAuthError('auth.signOutFailed');
          return;
        }

        const authUser = session?.user;
        setProfile({
          id: userId,
          email: authUser?.email ?? '',
          name: data.full_name || authUser?.email || '',
          role: data.role,
          mustChangePassword: authUser?.user_metadata?.must_change_password === true,
        });
      })
      .catch(() => {
        if (active) {
          setProfile(null);
          setAuthError('auth.profileLoadFailed');
        }
      })
      .finally(() => {
        if (active) setResolvedFor(userId);
      });

    return () => { active = false; };
  }, [userId, session, resolvedFor]);

  const login = async (email, password) => {
    setAuthError('');
    try {
      const { error } = await db().auth.signInWithPassword({ email: email.trim(), password });
      return error ? { ok: false, error: 'auth.invalidCredentials' } : { ok: true, error: null };
    } catch {
      return { ok: false, error: 'auth.notConfigured' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await db().auth.signOut();
      if (error) setAuthError('auth.signOutFailed');
      return { ok: !error, error: error ? 'auth.signOutFailed' : null };
    } catch {
      setAuthError('auth.notConfigured');
      return { ok: false, error: 'auth.notConfigured' };
    }
  };

  const user = profile && session?.user?.id === profile.id
    ? { ...profile, mustChangePassword: session.user.user_metadata?.must_change_password === true }
    : null;
  const loading = !authReady || Boolean(userId && resolvedFor !== userId);

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      loading,
      authError,
      login,
      logout,
      mustChangePassword: user?.mustChangePassword ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
