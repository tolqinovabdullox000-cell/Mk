import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '../App';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { I18nProvider } from '../i18n/I18nContext';

const mocks = vi.hoisted(() => ({
  client: null,
  listener: null,
  profileQuery: null,
  signIn: null,
  signOut: null,
  from: null,
}));

vi.mock('../lib/api/client', () => ({
  db: () => mocks.client,
  isSupabaseConfigured: () => true,
}));
vi.mock('../components/Navbar', () => ({ default: () => null }));
vi.mock('../components/Sidebar', () => ({ default: () => null }));

function provider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function RouteProbe() {
  const { pathname } = useLocation();
  return <output data-testid="pathname">{pathname}</output>;
}

function AuthRouteFixture() {
  return (
    <MemoryRouter initialEntries={['/admin/schedule']}>
      <I18nProvider>
        <AuthProvider>
          <RouteProbe />
          <Routes>
            <Route path="/login" element={<p>Login page</p>} />
            <Route path="/admin" element={<RequireRole allow="admin" />}>
              <Route path="schedule" element={<p>Schedule page</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  );
}

function session(userId = 'user-1') {
  return {
    access_token: 'access-token',
    user: {
      id: userId,
      email: 'admin@example.com',
      user_metadata: { must_change_password: false },
    },
  };
}

beforeEach(() => {
  mocks.listener = null;
  mocks.profileQuery = vi.fn().mockResolvedValue({
    data: { role: 'admin', full_name: 'Admin' },
    error: null,
  });
  mocks.signIn = vi.fn().mockResolvedValue({ error: null });
  mocks.signOut = vi.fn().mockImplementation(async () => {
    mocks.listener?.('SIGNED_OUT', null);
    return { error: null };
  });
  mocks.from = vi.fn(() => ({
    select: () => ({
      eq: () => ({
        maybeSingle: mocks.profileQuery,
      }),
    }),
  }));
  mocks.client = {
    auth: {
      onAuthStateChange: vi.fn((callback) => {
        mocks.listener = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signInWithPassword: mocks.signIn,
      signOut: mocks.signOut,
    },
    from: mocks.from,
  };
});

describe('AuthProvider', () => {
  it('keeps the refreshed admin schedule URL instead of redirecting through login', async () => {
    render(<AuthRouteFixture />);
    expect(screen.getByTestId('pathname').textContent).toBe('/admin/schedule');

    act(() => mocks.listener('INITIAL_SESSION', session()));
    await screen.findByText('Schedule page');

    expect(screen.getByTestId('pathname').textContent).toBe('/admin/schedule');
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('logs in through Supabase and trims the email', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: provider });

    await act(async () => {
      await expect(result.current.login(' admin@example.com ', 'secret')).resolves.toEqual({
        ok: true,
        error: null,
      });
    });

    expect(mocks.signIn).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret' });
  });

  it('signs out when the authenticated user has no valid profile', async () => {
    mocks.profileQuery.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper: provider });

    act(() => mocks.listener('SIGNED_IN', session()));
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledOnce());

    expect(result.current.authError).toBe('auth.profileMissing');
  });

  it('does not reload the profile for TOKEN_REFRESHED', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: provider });
    act(() => mocks.listener('SIGNED_IN', session()));
    await waitFor(() => expect(result.current.user?.name).toBe('Admin'));
    expect(mocks.from).toHaveBeenCalledOnce();

    act(() => mocks.listener('TOKEN_REFRESHED', session()));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mocks.from).toHaveBeenCalledOnce();
  });
});
