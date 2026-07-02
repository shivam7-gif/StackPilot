"use client";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { io, type Socket } from "socket.io-client";
import { useParams } from "next/navigation";

type TerminalTab = "terminal" | "problems" | "output" | "ports";

const TABS: { id: TerminalTab; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "problems", label: "Problems" },
  { id: "output", label: "Output" },
  { id: "ports", label: "Ports" },
];

const CURSOR_TERMINAL_THEME = {
  background: "#1e1e1e",
  foreground: "#cccccc",
  cursor: "#aeafad",
  cursorAccent: "#1e1e1e",
  selectionBackground: "#264f78",
  black: "#000000",
  red: "#cd3131",
  green: "#0dbc79",
  yellow: "#e5e510",
  blue: "#2472c8",
  magenta: "#bc3fbc",
  cyan: "#11a8bd",
  white: "#e5e5e5",
  brightBlack: "#666666",
  brightRed: "#f14c4c",
  brightGreen: "#23d18b",
  brightYellow: "#f5f543",
  brightBlue: "#3b8eea",
  brightMagenta: "#d670d6",
  brightCyan: "#29b8db",
  brightWhite: "#e5e5e5",
};

interface BrowserTerminalProps {
  height: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

interface TerminalData {
  id: string;
  name: string;
}

// Sub-component that holds exactly ONE xterm.js instance and ONE socket connection
const TerminalInstance = memo(
  ({
    terminalId,
    projectId,
    isActive,
    onConnectedChange,
  }: {
    terminalId: string;
    projectId: string;
    isActive: boolean;
    onConnectedChange: (connected: boolean) => void;
  }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const fitTerminal = useCallback(() => {
      if (!isActive) return;
      const fitAddon = fitAddonRef.current;
      const term = xtermRef.current;
      const socket = socketRef.current;
      if (!fitAddon || !term) return;

      try {
        fitAddon.fit();
        if (socket?.connected) {
          socket.emit("shell-resize", { cols: term.cols, rows: term.rows });
        }
      } catch (e) {
        // ignore resize errors when terminal is hidden
      }
    }, [isActive]);

    useEffect(() => {
      if (!terminalRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        lineHeight: 1.2,
        theme: CURSOR_TERMINAL_THEME,
        fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
        convertEol: true,
        scrollback: 5000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // The backend treats each socket connection to this namespace as a new shell session!
      const socket = io("http://localhost:5000/terminal", {
        query: { projectId, terminalId },
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        onConnectedChange(true);
        if (isActive) fitTerminal();
      });

      socket.on("disconnect", () => {
        onConnectedChange(false);
      });

      socket.on("shell-output", (data: string) => {
        term.write(data);
      });

      term.onData((data) => {
        if (socket.connected) {
          socket.emit("shell-input", data);
        }
      });

      const resizeObserver = new ResizeObserver(() => fitTerminal());
      resizeObserver.observe(terminalRef.current);
      window.addEventListener("resize", fitTerminal);

      if (isActive) {
        requestAnimationFrame(() => fitTerminal());
        term.focus();
      }

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", fitTerminal);
        socket.disconnect();
        socketRef.current = null;
        term.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
        onConnectedChange(false);
      };
    }, [projectId, terminalId]);

    // Refit when this terminal becomes active
    useEffect(() => {
      if (isActive) {
        requestAnimationFrame(() => {
          fitTerminal();
          xtermRef.current?.focus();
        });
      }
    }, [isActive, fitTerminal]);

    return (
      <div
        ref={terminalRef}
        className="absolute inset-0 px-2 py-1"
        style={{
          background: "var(--ide-bg)",
          visibility: isActive ? "visible" : "hidden",
          zIndex: isActive ? 10 : 0,
        }}
        onClick={() => xtermRef.current?.focus()}
      />
    );
  }
);
TerminalInstance.displayName = "TerminalInstance";

export default function BrowserTerminal({
  height,
  onResizeStart,
}: BrowserTerminalProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>("terminal");
  const [collapsed, setCollapsed] = useState(false);
  const [connected, setConnected] = useState(false);
  const { id: projectIdFromUrl } = useParams();

  // Multi-terminal state
  const [terminals, setTerminals] = useState<TerminalData[]>([
    { id: "term-1", name: "bash" },
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState("term-1");

  const handleNewTerminal = () => {
    const newId = `term-${Date.now()}`;
    setTerminals((prev) => [...prev, { id: newId, name: "bash" }]);
    setActiveTerminalId(newId);
    setActiveTab("terminal");
  };

  const handleDeleteTerminal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminals((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one terminal
        const newId = `term-${Date.now()}`;
        setActiveTerminalId(newId);
        return [{ id: newId, name: "bash" }];
      }
      if (activeTerminalId === id) {
        setActiveTerminalId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  if (collapsed) {
    return (
      <div
        className="flex items-center px-3 gap-2 shrink-0 cursor-pointer select-none"
        style={{
          height: 28,
          background: "var(--ide-bg)",
          borderTop: "1px solid var(--ide-border)",
        }}
        onClick={() => setCollapsed(false)}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="var(--ide-text-muted)"
        >
          <path d="M4 10l4-4 4 4H4z" />
        </svg>
        <span
          className="text-[11px]"
          style={{ color: "var(--ide-text-muted)" }}
        >
          Terminal
        </span>
        {!connected && (
          <span
            className="text-[10px]"
            style={{ color: "var(--ide-text-dim)" }}
          >
            (disconnected)
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        height,
        background: "var(--ide-bg)",
        borderTop: "1px solid var(--ide-border)",
      }}
    >
      <div
        onMouseDown={onResizeStart}
        className="resize-handle-h w-full shrink-0"
        style={{ height: 4 }}
      />

      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: 35, borderBottom: "1px solid var(--ide-border)" }}
      >
        <div className="flex items-center h-full">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="px-3 h-full text-[11px] transition-colors relative"
              style={{
                color:
                  activeTab === id
                    ? "var(--ide-text-bright)"
                    : "var(--ide-text-muted)",
                borderBottom:
                  activeTab === id
                    ? "2px solid var(--ide-text-bright)"
                    : "2px solid transparent",
              }}
            >
              {label}
              {id === "problems" && (
                <span
                  className="ml-1.5 px-1 rounded-full text-[9px]"
                  style={{
                    background: "var(--ide-hover-strong)",
                    color: "var(--ide-text-dim)",
                  }}
                >
                  0
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center h-full">
          {/* Terminal Tabs List (Only show when Terminal is active) */}
          {activeTab === "terminal" && (
            <div className="flex items-center h-full mr-2 gap-1 border-r border-[#ffffff10] pr-2">
              {terminals.map((term, index) => (
                <div
                  key={term.id}
                  onClick={() => setActiveTerminalId(term.id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors group"
                  style={{
                    background:
                      activeTerminalId === term.id
                        ? "var(--ide-hover)"
                        : "transparent",
                    color:
                      activeTerminalId === term.id
                        ? "var(--ide-text)"
                        : "var(--ide-text-muted)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  <span className="text-[11px]">
                    {term.name} {index > 0 ? index + 1 : ""}
                  </span>
                  <button
                    onClick={(e) => handleDeleteTerminal(term.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#ffffff20] transition-all"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-0.5 pr-2">
            <span
              className="text-[10px] px-2 mr-1 hidden sm:inline"
              style={{ color: connected ? "#23d18b" : "var(--ide-text-dim)" }}
            >
              {connected ? "● connected" : "○ disconnected"}
            </span>
            <PanelButton title="New terminal" onClick={handleNewTerminal}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </PanelButton>
            <PanelButton title="Split terminal">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
            </PanelButton>
            <div
              className="w-px h-4 mx-1"
              style={{ background: "var(--ide-border)" }}
            />
            <PanelButton
              title="Minimize panel"
              onClick={() => setCollapsed(true)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 15l-7 7-7-7" />
              </svg>
            </PanelButton>
            <PanelButton title="Maximize panel">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
              </svg>
            </PanelButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === "terminal" &&
          terminals.map((term) => (
            <TerminalInstance
              key={term.id}
              terminalId={term.id}
              projectId={projectIdFromUrl as string}
              isActive={activeTerminalId === term.id}
              onConnectedChange={(c) => {
                // If the active terminal is connected, set overall connected to true
                if (activeTerminalId === term.id) {
                  setConnected(c);
                }
              }}
            />
          ))}

        {activeTab === "problems" && (
          <EmptyPanel message="No problems detected." />
        )}
        {activeTab === "output" && <EmptyPanel message="No output yet." />}
        {activeTab === "ports" && <PortsPanel />}
      </div>
    </div>
  );
}

function PanelButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded transition-colors"
      style={{ color: "var(--ide-text-muted)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--ide-text)";
        e.currentTarget.style.background = "var(--ide-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--ide-text-muted)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--ide-text-dim)"
        strokeWidth="1"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <p className="text-[11px]" style={{ color: "var(--ide-text-dim)" }}>
        {message}
      </p>
    </div>
  );
}

function PortsPanel() {
  return (
    <div className="py-2 px-2 h-full overflow-y-auto ide-scrollbar">
      <div
        className="flex items-center gap-4 px-2 py-1.5 rounded text-[11px]"
        style={{ background: "var(--ide-input-bg)" }}
      >
        <span style={{ color: "var(--ide-text-muted)" }}>Port</span>
        <span style={{ color: "var(--ide-text-muted)" }}>Address</span>
        <span style={{ color: "var(--ide-text-muted)" }}>Process</span>
        <span style={{ color: "var(--ide-text-muted)" }}>Origin</span>
      </div>
      {[
        { port: 3000, addr: "localhost:3000", proc: "next", label: "Web" },
        { port: 5000, addr: "localhost:5000", proc: "node", label: "API" },
      ].map((p) => (
        <div
          key={p.port}
          className="flex items-center gap-4 px-2 py-1.5 text-[11px] rounded transition-colors"
          style={{ color: "var(--ide-text)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ide-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span>{p.port}</span>
          <span style={{ color: "var(--ide-react-color)" }}>{p.addr}</span>
          <span style={{ color: "var(--ide-text-muted)" }}>{p.proc}</span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px]"
            style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
          >
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}
