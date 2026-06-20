"use client";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-[4px] h-full cursor-col-resize shrink-0 relative group z-10"
      style={{ background: "transparent", transition: "background 0.15s" }}
    >
      <div
        className="absolute inset-y-0 inset-x-0 group-hover:opacity-100 group-active:opacity-100 opacity-0 transition-opacity duration-150"
        style={{ background: "#007fd4", opacity: 0 }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.opacity = "0";
        }}
      />
      {/* Visual divider line */}
      <div
        className="absolute inset-y-0 left-[1px] w-px"
        style={{ background: "#2b2b2b" }}
      />
    </div>
  );
}
