"use client";

import { API_BASE_URL } from "@/config/socket";

import { useEffect, useState } from "react";
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
  const [previewKey, setPreviewKey] = useState(0);

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
      `${API_BASE_URL}/editor`,
      {
        query: { projectId: projectIdFromUrl as string },
        auth: { projectId: projectIdFromUrl as string },
        transports: ["polling", "websocket"],
        forceNew: true,
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
                <div className="flex items-center justify-between px-3 h-[36px] shrink-0 gap-2" style={{ background: "var(--ide-titlebar-bg)", borderBottom: "1px solid var(--ide-border)" }}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[12px] font-medium shrink-0" style={{ color: "var(--ide-text-bright)" }}>Preview</span>
                    {previewUrl && (
                      <div className="flex-1 max-w-[280px] h-[22px] px-2 rounded flex items-center text-[10px] truncate select-all opacity-70 font-mono" style={{ background: "var(--ide-bg)", border: "1px solid var(--ide-border)" }}>
                        {previewUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => setPreviewKey((k) => k + 1)}
                      title="Reload preview"
                      className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                      style={{ color: "var(--ide-text-dim)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ide-text)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ide-text-dim)"; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                    </button>
                    {previewUrl && (
                      <button 
                        onClick={() => window.open(previewUrl, "_blank")}
                        title="Open in new window"
                        className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                        style={{ color: "var(--ide-text-dim)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ide-text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ide-text-dim)"; }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={openEditor} 
                      title="Close preview"
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
                </div>
                <iframe
                  key={previewKey}
                  src={previewUrl ?? ""}
                  title="Preview"
                  className="flex-1 w-full border-0 bg-white"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write;"
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
