"use client";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-[3px] h-full cursor-col-resize shrink-0 relative group z-10"
    >
      <div className="absolute inset-y-0 -left-px -right-px bg-transparent group-hover:bg-[#007fd4]/40 group-active:bg-[#007fd4]/60 transition-colors duration-100" />
    </div>
  );
}
