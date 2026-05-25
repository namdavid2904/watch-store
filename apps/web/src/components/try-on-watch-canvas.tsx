"use client";

import { Canvas } from "@react-three/fiber";
import { Component, Suspense, useEffect, type ReactNode } from "react";
import type { TryOnTransform } from "@/hooks/use-try-on-transform";
import { TryOnCanvasLoadingState } from "@/components/try-on-status-states";
import { disposeClonedScene, useClonedTryOnScene } from "@/lib/try-on-model-loader";

type ViewerErrorBoundaryProps = {
  children: ReactNode;
  onError?: () => void;
};

type ViewerErrorBoundaryState = {
  hasError: boolean;
};

class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  constructor(props: ViewerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(): void {
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

type WatchModelProps = {
  modelUrl: string;
};

function WatchModel({ modelUrl }: WatchModelProps) {
  const clonedScene = useClonedTryOnScene(modelUrl);

  useEffect(() => {
    return () => disposeClonedScene(clonedScene);
  }, [clonedScene]);

  return <primitive object={clonedScene} />;
}

type OverlaySceneProps = {
  modelUrl: string;
};

function OverlayScene({ modelUrl }: OverlaySceneProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={1.1} position={[4, 4, 5]} />
      <WatchModel modelUrl={modelUrl} />
    </>
  );
}

export type TryOnWatchCanvasProps = {
  modelUrl: string;
  width: number;
  height: number;
  transform: TryOnTransform;
  onLoadError?: () => void;
};

function TryOnWatchCanvasInner({ modelUrl, onLoadError }: TryOnWatchCanvasProps) {
  return (
    <ViewerErrorBoundary onError={onLoadError}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        dpr={[1, 2]}
      >
        <OverlayScene modelUrl={modelUrl} />
      </Canvas>
    </ViewerErrorBoundary>
  );
}

export function TryOnWatchCanvas({ width, height, ...rest }: TryOnWatchCanvasProps) {
  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <Suspense fallback={<TryOnCanvasLoadingState />}>
        <TryOnWatchCanvasInner width={width} height={height} {...rest} />
      </Suspense>
    </div>
  );
}
