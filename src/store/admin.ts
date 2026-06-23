import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminStore {
  hideProfit: boolean;
  setHideProfit: (hide: boolean) => void;
  toggleHideProfit: () => void;
}

export const useAdmin = create<AdminStore>()(
  persist(
    (set) => ({
      hideProfit: false,
      setHideProfit: (hide) => set({ hideProfit: hide }),
      toggleHideProfit: () => set((state) => ({ hideProfit: !state.hideProfit })),
    }),
    {
      name: "admin-settings",
    }
  )
);
