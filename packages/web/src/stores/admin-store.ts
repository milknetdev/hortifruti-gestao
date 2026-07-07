import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  tenantId: string;
  tenant?: { id: string; name: string; slug: string };
}

interface AdminAuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: AdminUser, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: AdminUser) => void;
  hydrate: () => void;
}

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user: AdminUser, accessToken: string, refreshToken?: string) => {
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        const token = get().accessToken;
        if (token) {
          fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1') + '/auth/logout', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token },
          }).catch(() => {});
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: AdminUser) => set({ user }),

      hydrate: () => {
        const state = get();
        set({
          isAuthenticated: !!state.accessToken && !!state.user,
          isLoading: false,
        });
      },
    }),
    {
      name: 'hortifruti-admin',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
