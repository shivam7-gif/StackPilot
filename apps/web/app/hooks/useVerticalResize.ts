"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseVerticalResizeOptions {
  initialHeight: number;
  minHeight: number;
  maxHeight: number;
}

export function useVerticalResize({
  initialHeight,
  minHeight,
  maxHeight,
}: UseVerticalResizeOptions) {
  const [height, setHeight] = useState(initialHeight);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(initialHeight);

  const clamp = useCallback(
    (value: number) => Math.min(maxHeight, Math.max(minHeight, value)),
    [minHeight, maxHeight]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startY.current - e.clientY;
      setHeight(clamp(startHeight.current + delta));
    },
    [clamp]
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
      startY.current = e.clientY;
      startHeight.current = height;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    },
    [height]
  );

  return { height, startDrag };
}
