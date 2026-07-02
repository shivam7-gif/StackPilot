"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { usePanelResize } from "../../hooks/usePanelResize";
import { useVerticalResize } from "../../hooks/useVerticalResize";
import { useEditorSocketStore } from "../../store/EditorSocketStores";
import { useThemeStore } from "../../store/useThemeStore";
import {ActivePreviewStore} from "../../store/activePreviewStore";
import IdeTitleBar from "./IdeTitleBar";
import ExplorerPanel from "./ExplorerPanel";
import EditorArea from "./EditorArea";
import ResizeHandle from "./ResizeHandle";
import ChatPanel from "../ai/ChatPanel";
import Terminal from "../Terminal/BrowserTerminal";
import { useParams } from "next/navigation";
import { useTreeStructureStore } from "../../store/TreeStructureStore";

interface IdeShellProps {
  projectName?: string;
}

export default function IdeShell({ projectName }: IdeShellProps) {
  const { setEditorSocket, clearEditorSocket } = useEditorSocketStore();
  const { id: projectIdFromUrl } = useParams();
  const { setProjectId } = useTreeStructureStore();
  const { theme } = useThemeStore();

  // Preview store
  const activeView = ActivePreviewStore((state) => state.activeView);
  const previewUrl = ActivePreviewStore((state) => state.previewUrl);
  const openEditor = ActivePreviewStore((state) => state.openEditor);

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
      {
        query: { projectId: projectIdFromUrl as string },
      }
    );

    setEditorSocket(editorSocketConn);
    editorSocketConn.connect();

    return () => {
      clearEditorSocket();
      editorSocketConn.disconnect();
    };
  }, [setEditorSocket, clearEditorSocket, projectIdFromUrl, setProjectId]);

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

          {activeView === "preview" && (
            <>
              <ResizeHandle onMouseDown={() => {}} />
              <div className="flex-1 min-w-[300px] h-full flex flex-col relative border-l" style={{ borderColor: "var(--ide-border)" }}>
                <div className="flex items-center justify-between px-3 h-[36px] shrink-0" style={{ background: "var(--ide-titlebar-bg)", borderBottom: "1px solid var(--ide-border)" }}>
                  <span className="text-[12px] font-medium" style={{ color: "var(--ide-text-bright)" }}>Preview</span>
                  <button 
                    onClick={openEditor} 
                    className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                    style={{ color: "var(--ide-text-dim)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--ide-hover)";
                      e.currentTarget.style.color = "var(--ide-text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--ide-text-dim)";
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <iframe
                  src={previewUrl ?? ""}
                  title="Preview"
                  className="flex-1 w-full border-0 bg-white"
                />
              </div>
            </>
          )}

          <ResizeHandle onMouseDown={aiPanel.startDrag} />

          <ChatPanel width={aiPanel.width} />
        </div>

        <Terminal height={terminal.height} onResizeStart={terminal.startDrag} />
      </div>
    </div>
  );
}
