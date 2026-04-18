"use client";
import { useEffect, useState } from "react";
import { socket } from "@/config/socket";
import { useRouter } from "next/navigation";
type OverlayStep = "idle" | "creating" | "logs" | "done";
export default function DashboardPage() {
  const [frontendFramework, setFrontendFramework] = useState("");
  const [backendFramework, setBackendFramework] = useState("");
  const [projectName, setProjectName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [overlayStep, setoverlayStep] = useState<OverlayStep>("idle");
  const router = useRouter();

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("project-log", (log) => {
      setLogs((prev) => [...prev, String(log)]);
      console.log("LOG:", log);
    });

    socket.on("project-step", (step: string) => {
      if (step == "folders") setoverlayStep("creating");
      if (step == "scaffolding") setoverlayStep("logs");
      if (step == "done") setoverlayStep("done");
    });

    socket.on("project-done", ({ projectId }) => {
      setoverlayStep("done");
      setTimeout(() => {
        router.push(`/project/${projectId}/ide`);
      });
    });

    return () => {
      socket.off("connect");
      socket.off("project-log");
      socket.off("project-step");
      socket.off("project-done");
      socket.disconnect();
    };
  }, []);

  function handleCreateProject() {
    socket.emit("createProject", {
      frontend: frontendFramework,
      backend: backendFramework,
      projectName,
    });
    console.log("command sent to backend");
  }

  return (
    <div>
      <h1>Create Project</h1>

      <input
        type="text"
        placeholder="enter frontend framework"
        onChange={(e) => setFrontendFramework(e.target.value)}
      />

      <input
        type="text"
        placeholder="enter backend framework"
        onChange={(e) => setBackendFramework(e.target.value)}
      />

      <input
        type="text"
        placeholder="enter project name"
        onChange={(e) => setProjectName(e.target.value)}
      />

      <button onClick={handleCreateProject}>Create Project</button>

      <div className="mt-6">
        <h2>Build logs</h2>
        <pre className="whitespace-pre-wrap text-sm">{logs.join("\n")}</pre>
      </div>
    </div>
  );
}
