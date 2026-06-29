import { create } from "zustand";

type IdeView = "editor" | "preview";

type IdeUIStore = {
  activeView: IdeView;
  previewUrl: string | null;

  openPreview: (url: string) => void;
  openEditor: () => void;
};

export const ActivePreviewStore = create<IdeUIStore>((set) => ({
  activeView: "editor",
  previewUrl: null,

  openPreview: (url) =>
    set({
      activeView: "preview",
      previewUrl: url,
    }),

  openEditor: () =>
    set({
      activeView: "editor",
    }),
}));