import { create } from "zustand";
import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./TreeStructureStore";

type ReadFilePayload =
  | { path: string; value: string }
  | { path: string; fileType: "image"; value?: string };

type FileChangedPayload = {
  path: string;
  value: string;
  authorId?: string;
};

type RoomPresencePayload = {
  projectId: string;
  users: number;
};

type RoomJoinedPayload = {
  projectId: string;
  roomId: string;
  socketId: string;
  users: number;
};

const setRoomUserCount = (
  set: (partial: Partial<EditorSocketStore>) => void,
  users: number,
) => {
  set({ connectedUsers: users });
};

interface EditorSocketStore {
  editorSocket: Socket | null;
  connectedUsers: number;
  setEditorSocket: (incomingSocket: Socket) => void;
  clearEditorSocket: () => void;
}

const handleReadFileSuccess = (payload: ReadFilePayload) => {
  console.log("[Editor] readFileSuccess for:", payload.path);
  const { openTab } = useActiveFileTabStore.getState();
  const extension = payload.path.split(".").pop() || "";

  if ("fileType" in payload) {
    openTab(payload.path, payload.value ?? "", extension, "image");
    return;
  }

  openTab(payload.path, payload.value, extension, "text");
};

const handleFileChanged = (payload: FileChangedPayload) => {
  const { updateTabValue } = useActiveFileTabStore.getState();
  updateTabValue(payload.path, payload.value);
};

const debouncedRefreshTree = debounce((projectId: string) => {
  const { setTreeStructure } = useTreeStructureStore.getState();
  void setTreeStructure(projectId, true);
}, 300);

const handleFileSystemChanged = (payload?: { event?: string; path?: string }) => {
  // Ignore content edits ("change") - they do not modify directory hierarchy
  if (payload?.event === "change") {
    return;
  }
  const { projectId } = useTreeStructureStore.getState();
  if (projectId) {
    debouncedRefreshTree(projectId);
  }
};

const registerEditorSocketListeners = (
  socket: Socket,
  set: (partial: Partial<EditorSocketStore>) => void,
) => {
  socket.on("readFileSuccess", handleReadFileSuccess);
  socket.on("fileChanged", handleFileChanged);
  socket.on("fileSystemChanged", handleFileSystemChanged);
  socket.on("room:presence", (payload: RoomPresencePayload) => {
    setRoomUserCount(set, payload.users);
  });
  socket.on("room:joined", (payload: RoomJoinedPayload) => {
    setRoomUserCount(set, payload.users);
  });
};

const unregisterEditorSocketListeners = (socket: Socket) => {
  debouncedRefreshTree.cancel();
  socket.off("readFileSuccess", handleReadFileSuccess);
  socket.off("fileChanged", handleFileChanged);
  socket.off("fileSystemChanged", handleFileSystemChanged);
  socket.off("room:presence");
  socket.off("room:joined");
};

export const useEditorSocketStore = create<EditorSocketStore>((set, get) => ({
  editorSocket: null,
  connectedUsers: 0,

  setEditorSocket: (incomingSocket) => {
    const prev = get().editorSocket;
    if (prev) {
      unregisterEditorSocketListeners(prev);
    }

    registerEditorSocketListeners(incomingSocket, (partial) => {
      set(partial);
    });

    set({ editorSocket: incomingSocket });
  },

  clearEditorSocket: () => {
    const prev = get().editorSocket;
    if (prev) {
      unregisterEditorSocketListeners(prev);
    }
    set({ editorSocket: null, connectedUsers: 0 });
  },
}));
