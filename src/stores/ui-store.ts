import { create } from "zustand";

type UIState = {
  isMobileMenuOpen: boolean;
  isFilterPanelOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  toggleFilterPanel: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isFilterPanelOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleFilterPanel: () =>
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
}));
