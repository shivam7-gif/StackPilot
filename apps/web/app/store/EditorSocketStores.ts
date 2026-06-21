import { create } from "zustand";
import { Socket } from "socket.io-client";
import { useActiveFileTabStore } from "./activeFileTabStore";

type ReadFilePayload =
  | { path: string; value: string }
  | { path: string; fileType: "image" };

interface EditorSocketStore {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket) => void;
  clearEditorSocket: () => void;
}

const handleReadFileSuccess = (payload: ReadFilePayload) => {
  const { openTab } = useActiveFileTabStore.getState();
  const extension = payload.path.split(".").pop() || "";

  if ("fileType" in payload) {
    openTab(payload.path, "", extension, "image");
    return;
  }

  openTab(payload.path, payload.value, extension, "text");
};

export const useEditorSocketStore = create<EditorSocketStore>((set, get) => ({
  editorSocket: null,

  setEditorSocket: (incomingSocket) => {
    const prev = get().editorSocket;
    if (prev) {
      prev.off("readFileSuccess", handleReadFileSuccess);
    }
    console.log("read file success", prev);
    incomingSocket.on("readFileSuccess", handleReadFileSuccess);
    set({ editorSocket: incomingSocket });
  },

  clearEditorSocket: () => {
    const prev = get().editorSocket;
    if (prev) {
      prev.off("readFileSuccess", handleReadFileSuccess);
    }
    set({ editorSocket: null });
  },
}));
