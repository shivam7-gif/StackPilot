"use client";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function BrowserTerminal({
  height,
  onResizeStart,
}: BrowserTerminalProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>("terminal");
  const [collapsed, setCollapsed] = useState(false);
  const [connected, setConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { id: projectIdFromUrl } = useParams();

  const fitTerminal = useCallback(() => {
    const fitAddon = fitAddonRef.current;
    const term = xtermRef.current;
    const socket = socketRef.current;
    if (!fitAddon || !term) return;

    fitAddon.fit();
    if (socket?.connected) {
      socket.emit("shell-resize", { cols: term.cols, rows: term.rows });
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current || !projectIdFromUrl) {
      return;
    }

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
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const socket = io("http://localhost:5000/terminal", {
      query: { projectId: projectIdFromUrl as string },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      fitTerminal();
    });

    socket.on("disconnect", () => {
      setConnected(false);
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

    requestAnimationFrame(() => fitTerminal());
    term.focus();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", fitTerminal);
      socket.disconnect();
      socketRef.current = null;
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [projectIdFromUrl, fitTerminal]);

  useEffect(() => {
    if (activeTab === "terminal" && !collapsed) {
      requestAnimationFrame(() => fitTerminal());
    }
  }, [height, collapsed, activeTab, fitTerminal]);

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
        <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--ide-text-muted)">
          <path d="M4 10l4-4 4 4H4z" />
        </svg>
        <span className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
          Terminal
        </span>
        {!connected && (
          <span className="text-[10px]" style={{ color: "var(--ide-text-dim)" }}>
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
                  style={{ background: "var(--ide-hover-strong)", color: "var(--ide-text-dim)" }}
                >
                  0
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 pr-2">
          <span
            className="text-[10px] px-2 mr-1 hidden sm:inline"
            style={{ color: connected ? "#23d18b" : "var(--ide-text-dim)" }}
          >
            {connected ? "● connected" : "○ disconnected"}
          </span>
          <PanelButton title="New terminal" onClick={() => xtermRef.current?.clear()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </PanelButton>
          <PanelButton title="Split terminal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          </PanelButton>
          <div className="w-px h-4 mx-1" style={{ background: "var(--ide-border)" }} />
          <PanelButton title="Minimize panel" onClick={() => setCollapsed(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 15l-7 7-7-7" />
            </svg>
          </PanelButton>
          <PanelButton title="Maximize panel">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
            </svg>
          </PanelButton>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div
          ref={terminalRef}
          className="absolute inset-0 px-2 py-1"
          style={{
            background: "#1e1e1e",
            visibility: activeTab === "terminal" ? "visible" : "hidden",
          }}
          onClick={() => xtermRef.current?.focus()}
        />

        {activeTab === "problems" && <EmptyPanel message="No problems detected." />}
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
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ide-text-dim)" strokeWidth="1">
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
