import { create } from "zustand";

export type PaletteMode = "file" | "command" | "goto-line";

interface CommandPaletteStore {
  isOpen: boolean;
  mode: PaletteMode;
  initialQuery: string;
  open: (mode?: PaletteMode, initialQuery?: string) => void;
  close: () => void;
  toggle: (mode?: PaletteMode) => void;
  setMode: (mode: PaletteMode) => void;
}

export const useCommandPaletteStore = create<CommandPaletteStore>((set, get) => ({
  isOpen: false,
  mode: "file",
  initialQuery: "",

  open: (mode = "file", initialQuery = "") => {
    set({ isOpen: true, mode, initialQuery });
  },

  close: () => {
    set({ isOpen: false, initialQuery: "" });
  },

  toggle: (mode = "file") => {
    const current = get().isOpen;
    if (current && get().mode === mode) {
      set({ isOpen: false });
    } else {
      set({ isOpen: true, mode, initialQuery: "" });
    }
  },

  setMode: (mode: PaletteMode) => set({ mode }),
}));
