"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { usePanelResize } from "../../hooks/usePanelResize";
import { useEditorSocketStore } from "../../store/EditorSocketStores";
import { useActiveFileTabStore } from "../../store/activeFileTabStore";
import IdeTitleBar from "./IdeTitleBar";
import ExplorerPanel from "./ExplorerPanel";
import EditorArea from "./EditorArea";
import ResizeHandle from "./ResizeHandle";
import ChatPanel from "../ai/ChatPanel";
import Terminal from "../Terminal/Terminal";
import { useParams } from "next/navigation";

// import env from "dotenv"
import { useTreeStructureStore } from "../../store/TreeStructureStore";
interface IdeShellProps {
  projectName?: string;
}
type ReadFilePayload =
  | {
      path: string;
      value: string;
    }
  | {
      path: string;
      fileType: "image";
    };
export default function IdeShell({ projectName }: IdeShellProps) {
  const { editorSocket, setEditorSocket } = useEditorSocketStore();
  const params = useParams();
  const { id: projectIdFromUrl } = useParams();
  const { setProjectId, projectId } = useTreeStructureStore();
  const explorer = usePanelResize({
    initialWidth: 260,
    minWidth: 180,
    maxWidth: 480,
    direction: "left",
  });

  const aiPanel = usePanelResize({
    initialWidth: 380,
    minWidth: 280,
    maxWidth: 600,
    direction: "right",
  });

  const { activeFileTab, setActiveFileTab } = useActiveFileTabStore();

  useEffect(() => {
    // const backendUrl = import.meta.env.VITE_BACKEND_URL
    setProjectId(projectIdFromUrl as string);
    // const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editor`,{
    //   autoConnect: false,
    // });
    const editorSocketConn = io(
      ("http://localhost:5000/editor?projectId=" + projectIdFromUrl) as string,
      {
        query: {
          projectId: projectIdFromUrl as string,
        },
      },
    );
    setEditorSocket(editorSocketConn);
    editorSocketConn.connect();
    console.log("projectIdFromUrl : ", projectIdFromUrl);
    console.log("params : ", params);
    return () => {
      editorSocketConn.disconnect();
    };
  }, [setEditorSocket, projectIdFromUrl]);
  const activeFileName = activeFileTab?.path.split(/[\\/]/).pop();
  useEffect(() => {
    if (!editorSocket) return;
    const handleReadFileSuccess = (payload: ReadFilePayload) => {
      if ("fileType" in payload) {
        setActiveFileTab(
          payload.path,
          "",
          payload.path.split(".").pop() || "",
          "image",
        );
        return;
      }
      setActiveFileTab(
        payload.path,
        payload.value,
        payload.path.split(".").pop() || "",
        "text",
      );
    };
    editorSocket.on("readFileSuccess", handleReadFileSuccess);
    return () => {
      editorSocket.off("readFileSuccess", handleReadFileSuccess);
    };
  }, [editorSocket]);
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col font-sans overflow-hidden">
      <IdeTitleBar projectName={projectName} />

      <div className="flex flex-1 min-h-0 w-full flex-col">
        <div className="flex flex-1 min-h-0 w-full">
          <ExplorerPanel width={explorer.width} />
          <ResizeHandle onMouseDown={explorer.startDrag} />
          <EditorArea
            activeFileName={activeFileName}
            value={activeFileTab?.value ?? ""}
          />
          <ResizeHandle onMouseDown={aiPanel.startDrag} />
          <ChatPanel width={aiPanel.width} />
        </div>
        <Terminal />
      </div>
    </div>
  );
}
