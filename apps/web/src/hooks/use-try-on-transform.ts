"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TryOnTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

const DEFAULT_TRANSFORM: TryOnTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

const SMOOTHING = 0.18;
const EPSILON = 0.001;

function lerpValue(current: number, target: number): number {
  return current + (target - current) * SMOOTHING;
}

function isSettled(current: TryOnTransform, target: TryOnTransform): boolean {
  return (
    Math.abs(current.x - target.x) < EPSILON
    && Math.abs(current.y - target.y) < EPSILON
    && Math.abs(current.scale - target.scale) < EPSILON
    && Math.abs(current.rotation - target.rotation) < EPSILON
  );
}

export function useTryOnTransform(initial?: Partial<TryOnTransform>) {
  const initialTransform = useMemo(
    () => ({ ...DEFAULT_TRANSFORM, ...initial }),
    [initial?.x, initial?.y, initial?.scale, initial?.rotation]
  );
  const targetRef = useRef<TryOnTransform>(initialTransform);
  const [transform, setTransform] = useState<TryOnTransform>(initialTransform);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      setTransform((current) => {
        const target = targetRef.current;
        if (isSettled(current, target)) {
          return current;
        }

        return {
          x: lerpValue(current.x, target.x),
          y: lerpValue(current.y, target.y),
          scale: lerpValue(current.scale, target.scale),
          rotation: lerpValue(current.rotation, target.rotation),
        };
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const setTarget = useCallback((next: Partial<TryOnTransform>) => {
    targetRef.current = { ...targetRef.current, ...next };
  }, []);

  const nudge = useCallback((dx: number, dy: number) => {
    targetRef.current = {
      ...targetRef.current,
      x: targetRef.current.x + dx,
      y: targetRef.current.y + dy,
    };
  }, []);

  const adjustScale = useCallback((delta: number) => {
    targetRef.current = {
      ...targetRef.current,
      scale: Math.min(3, Math.max(0.35, targetRef.current.scale + delta)),
    };
  }, []);

  const adjustRotation = useCallback((delta: number) => {
    targetRef.current = {
      ...targetRef.current,
      rotation: targetRef.current.rotation + delta,
    };
  }, []);

  const reset = useCallback(() => {
    targetRef.current = { ...initialTransform };
    setTransform({ ...initialTransform });
  }, [initialTransform]);

  return {
    transform,
    setTarget,
    nudge,
    adjustScale,
    adjustRotation,
    reset,
  };
}
