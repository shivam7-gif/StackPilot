import { create } from "zustand";

type FileContextMenuState = {
  x: number | null;
  y: number | null;
  isOpen: boolean;
  file: string | null;
  isFolder: boolean;
  renamingPath: string | null;
  open: (opts: { x: number; y: number; path: string; isFolder: boolean }) => void;
  close: () => void;
  startRename: (path: string) => void;
  clearRename: () => void;
};

export const useFileContextMenuStore = create<FileContextMenuState>((set) => ({
  x: null,
  y: null,
  isOpen: false,
  file: null,
  isFolder: false,
  renamingPath: null,

  open: ({ x, y, path, isFolder }) => {
    set({
      x,
      y,
      file: path,
      isFolder,
      isOpen: true,
    });
  },

  close: () => {
    set({
      isOpen: false,
    });
  },

  startRename: (path) => {
    set({
      renamingPath: path,
      isOpen: false,
    });
  },

  clearRename: () => {
    set({
      renamingPath: null,
    });
  },
}));
