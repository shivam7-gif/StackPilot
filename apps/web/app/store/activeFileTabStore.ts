import { create } from "zustand";

type ActiveFileTab = {
  path: string;
  value: string;
  extension: string;
  fileType: "text" | "image";
} | null;
type ActiveFileTabStore = {
  activeFileTab: ActiveFileTab | null;

  setActiveFileTab: (
    path: string,
    value: string,
    extension: string,
    fileType: "text" | "image",
  ) => void;
};

export const useActiveFileTabStore = create<ActiveFileTabStore>((set) => ({
  activeFileTab: null,

  setActiveFileTab: (path, value, extension, fileType = "text") => {
    set({
      activeFileTab: {
        path,
        value,
        extension,
        fileType,
      },
    });
  },
}));
