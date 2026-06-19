"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ResizeDirection = "left" | "right";

interface UsePanelResizeOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  direction: ResizeDirection;
}

export function usePanelResize({
  initialWidth,
  minWidth,
  maxWidth,
  direction,
}: UsePanelResizeOptions) {
  const [width, setWidth] = useState(initialWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(initialWidth);

  const clamp = useCallback(
    (value: number) => Math.min(maxWidth, Math.max(minWidth, value)),
    [minWidth, maxWidth]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta =
        direction === "left"
          ? e.clientX - startX.current
          : startX.current - e.clientX;
      setWidth(clamp(startWidth.current + delta));
    },
    [clamp, direction]
  );

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    },
    [width]
  );

  return { width, startDrag };
}
