"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { usePanelResize } from "../../hooks/usePanelResize";
import { useVerticalResize } from "../../hooks/useVerticalResize";
import { useEditorSocketStore } from "../../store/EditorSocketStores";
import { useActiveFileTabStore } from "../../store/activeFileTabStore";
import { useThemeStore } from "../../store/useThemeStore";
import IdeTitleBar from "./IdeTitleBar";
import ExplorerPanel from "./ExplorerPanel";
import EditorArea from "./EditorArea";
import ResizeHandle from "./ResizeHandle";
import ChatPanel from "../ai/ChatPanel";
import Terminal from "../Terminal/Terminal";
import { useParams } from "next/navigation";
import { useTreeStructureStore } from "../../store/TreeStructureStore";

interface IdeShellProps {
  projectName?: string;
}

type ReadFilePayload =
  | { path: string; value: string }
  | { path: string; fileType: "image" };

export default function IdeShell({ projectName }: IdeShellProps) {
  const { editorSocket, setEditorSocket } = useEditorSocketStore();
  const { id: projectIdFromUrl } = useParams();
  const { setProjectId } = useTreeStructureStore();
  const { openTab } = useActiveFileTabStore();
  const { theme } = useThemeStore();

  // Horizontal panel resize
  const explorer = usePanelResize({
    initialWidth: 260,
    minWidth: 180,
    maxWidth: 480,
    direction: "left",
  });

  const aiPanel = usePanelResize({
    initialWidth: 380,
    minWidth: 280,
    maxWidth: 620,
    direction: "right",
  });

  // Vertical terminal resize
  const terminal = useVerticalResize({
    initialHeight: 220,
    minHeight: 100,
    maxHeight: 560,
  });

  // Socket setup
  useEffect(() => {
    setProjectId(projectIdFromUrl as string);
    const editorSocketConn = io(
      `http://localhost:5000/editor?projectId=${projectIdFromUrl}`,
      { query: { projectId: projectIdFromUrl as string } }
    );
    setEditorSocket(editorSocketConn);
    editorSocketConn.connect();
    return () => { editorSocketConn.disconnect(); };
  }, [setEditorSocket, projectIdFromUrl, setProjectId]);

  // readFileSuccess handler
  useEffect(() => {
    if (!editorSocket) return;
    const handleReadFileSuccess = (payload: ReadFilePayload) => {
      if ("fileType" in payload) {
        openTab(payload.path, "", payload.path.split(".").pop() || "", "image");
        return;
      }
      openTab(payload.path, payload.value, payload.path.split(".").pop() || "", "text");
    };
    editorSocket.on("readFileSuccess", handleReadFileSuccess);
    return () => { editorSocket.off("readFileSuccess", handleReadFileSuccess); };
  }, [editorSocket, openTab]);

  return (
    <div
      data-theme={theme}
      className="h-screen w-screen flex flex-col font-sans overflow-hidden"
      style={{ background: "var(--ide-bg)", color: "var(--ide-text)" }}
    >
      <IdeTitleBar projectName={projectName} />

      <div className="flex flex-1 min-h-0 w-full flex-col">
        <div className="flex flex-1 min-h-0 w-full">
          <ExplorerPanel width={explorer.width} />
          <ResizeHandle onMouseDown={explorer.startDrag} />
          <EditorArea />
          <ResizeHandle onMouseDown={aiPanel.startDrag} />
          <ChatPanel width={aiPanel.width} />
        </div>
        <Terminal height={terminal.height} onResizeStart={terminal.startDrag} />
      </div>
    </div>
  );
}
