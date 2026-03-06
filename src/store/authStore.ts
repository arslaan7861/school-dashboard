"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Role = "admin" | "user" | string;

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean; // Changed
  profilePic?: string | null;
};

type AuthResponseData = {
  user: User;
  token: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  activeSessionId: string | null;

  // THEME
  dark: boolean;
  setDark: (value: boolean) => void;
  toggleTheme: () => void;

  setAuth: (data: AuthResponseData) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;

  setActiveSession: (id: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      activeSessionId: null,

      // THEME DEFAULT
      dark: false,

      // THEME ACTIONS
      setDark: (value) => set({ dark: value }),
      toggleTheme: () => set((s) => ({ dark: !s.dark })),

      setAuth: (data) =>
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          activeSessionId: null,
        }),

      setHasHydrated: (state) => set({ hasHydrated: state }),

      setActiveSession: (id) => set({ activeSessionId: id }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        activeSessionId: state.activeSessionId,
        dark: state.dark, // PERSIST THEME
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
