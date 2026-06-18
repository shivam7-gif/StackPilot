import { create } from "zustand";
import { Socket } from "socket.io-client";

interface EditorSocketStore {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket) => void;
}

export const useEditorSocketStore = create<EditorSocketStore>((set) => ({
  editorSocket: null,

  setEditorSocket: (incomingSocket) => {
    set({
      editorSocket: incomingSocket,
    });
  },
}));