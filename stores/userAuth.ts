import { create } from "zustand";

export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  hydrate: (user: User | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  hydrate: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
