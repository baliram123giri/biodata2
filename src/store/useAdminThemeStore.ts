import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AdminTheme = "dark" | "light";

interface AdminThemeState {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

export const useAdminThemeStore = create<AdminThemeState>()(
  persist(
    (set) => ({
      theme: "dark", // default theme is dark for the premium look
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "admin-theme-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
