import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorStatusStore {
  line: number;
  col: number;
  selectionCount: number;
  indentSpaces: number;
  encoding: string;
  eol: "LF" | "CRLF";
  autoSave: boolean;
  languageOverride: string | null;

  setCursor: (line: number, col: number, selectionCount?: number) => void;
  setIndentSpaces: (spaces: number) => void;
  setEncoding: (encoding: string) => void;
  setEol: (eol: "LF" | "CRLF") => void;
  toggleAutoSave: () => void;
  setAutoSave: (enabled: boolean) => void;
  setLanguageOverride: (lang: string | null) => void;
}

export const useEditorStatusStore = create<EditorStatusStore>()(
  persist(
    (set) => ({
      line: 1,
      col: 1,
      selectionCount: 0,
      indentSpaces: 2,
      encoding: "UTF-8",
      eol: "LF",
      autoSave: true,
      languageOverride: null,

      setCursor: (line, col, selectionCount = 0) =>
        set({ line, col, selectionCount }),

      setIndentSpaces: (indentSpaces) => set({ indentSpaces }),
      setEncoding: (encoding) => set({ encoding }),
      setEol: (eol) => set({ eol }),
      toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
      setAutoSave: (autoSave) => set({ autoSave }),
      setLanguageOverride: (languageOverride) => set({ languageOverride }),
    }),
    {
      name: "stackpilot_editor_status_settings",
      partialize: (state) => ({
        autoSave: state.autoSave,
        indentSpaces: state.indentSpaces,
        encoding: state.encoding,
        eol: state.eol,
      }),
    }
  )
);
