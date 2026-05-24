"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";

type TryOnGestureLayerProps = {
  children: ReactNode;
  onAdjustScale: (delta: number) => void;
  onAdjustRotation: (delta: number) => void;
};

export function TryOnGestureLayer({ children, onAdjustScale, onAdjustRotation }: TryOnGestureLayerProps) {
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      if (event.shiftKey) {
        onAdjustRotation(event.deltaY * 0.15);
        return;
      }
      onAdjustScale(-event.deltaY * 0.0015);
    },
    [onAdjustRotation, onAdjustScale]
  );

  return (
    <div className="h-full w-full" onWheel={handleWheel}>
      {children}
    </div>
  );
}
