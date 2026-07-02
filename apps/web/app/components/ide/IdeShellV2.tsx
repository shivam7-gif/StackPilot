"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useEditorSocketStore } from "../../store/EditorSocketStores";
import { useThemeStore } from "../../store/useThemeStore";
import { useParams } from "next/navigation";
import { useTreeStructureStore } from "../../store/TreeStructureStore";
import { usePanelResize } from "../../hooks/usePanelResize";

import IdeNavSidebar from "./IdeNavSidebar";
import IdeTopBar from "./IdeTopBar";
import PromptEditorPanel from "./PromptEditorPanel";
import ConversationPanel from "./ConversationPanel";

interface IdeShellV2Props {
  projectName?: string;
}

export default function IdeShellV2({ projectName }: IdeShellV2Props) {
  const { setEditorSocket, clearEditorSocket } = useEditorSocketStore();
  const { id: projectIdFromUrl } = useParams();
  const { setProjectId } = useTreeStructureStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";

  const [activeNav, setActiveNav] = useState("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const promptPanel = usePanelResize({
    initialWidth: 520,
    minWidth: 340,
    maxWidth: 800,
    direction: "left",
  });

  // Socket setup
  useEffect(() => {
    if (!projectIdFromUrl) return;
    setProjectId(projectIdFromUrl as string);

    const editorSocketConn = io(
      `http://localhost:5000/editor?projectId=${projectIdFromUrl}`,
      { query: { projectId: projectIdFromUrl as string } }
    );

    setEditorSocket(editorSocketConn);
    editorSocketConn.connect();

    return () => {
      clearEditorSocket();
      editorSocketConn.disconnect();
    };
  }, [setEditorSocket, clearEditorSocket, projectIdFromUrl, setProjectId]);

  const bg = isLight ? "#f5f5f5" : "#080808";
  const border = isLight ? "#e5e5e5" : "#1a1a1a";

  return (
    <div
      data-theme={theme}
      className="h-screen w-screen flex overflow-hidden"
      style={{ background: bg }}
    >
      {/* ── Left Navigation Sidebar ── */}
      <IdeNavSidebar
        activeNavItem={activeNav}
        onNavChange={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <IdeTopBar
          projectName={projectName}
          onSidebarToggle={() => setSidebarCollapsed((p) => !p)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* ── Body: Prompt Editor + Conversation ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Prompt / Editor Panel (left) */}
          <PromptEditorPanel width={promptPanel.width} />

          {/* Resize Handle */}
          <div
            onMouseDown={promptPanel.startDrag}
            className="w-[4px] shrink-0 cursor-col-resize transition-colors select-none"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isLight ? "#6b7280" : "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          />

          {/* Conversation Panel (right) */}
          <ConversationPanel width={0} />
        </div>
      </div>
    </div>
  );
}
