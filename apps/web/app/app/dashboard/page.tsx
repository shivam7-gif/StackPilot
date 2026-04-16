"use client";
import { useEffect, useState } from "react";
import { socket } from "@/config/socket";

export default function DashboardPage() {
  const [frontendFramework, setFrontendFramework] = useState("");
  const [backendFramework, setBackendFramework] = useState("");
  const [projectName, setProjectName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("project-log", (log) => {
      setLogs((prev) => [...prev, String(log)]);
      console.log("LOG:", log);
    });

    return () => {
      socket.off("connect");
      socket.off("project-log");
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
