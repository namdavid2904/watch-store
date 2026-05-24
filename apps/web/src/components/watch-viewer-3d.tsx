"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Component, Suspense, type ReactNode } from "react";

type WatchModelProps = {
  url: string;
  overlayMode: boolean;
};

function WatchModel({ url, overlayMode }: WatchModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={overlayMode ? 1.4 : 1.2} />;
}

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

type WatchSceneProps = {
  modelUrl: string;
  overlayMode: boolean;
};

function WatchScene({ modelUrl, overlayMode }: WatchSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: overlayMode, antialias: true }}
      style={{
        width: "100%",
        height: "100%",
        background: overlayMode ? "transparent" : undefined,
      }}
    >
      <ambientLight intensity={overlayMode ? 0.85 : 0.6} />
      <directionalLight intensity={overlayMode ? 1.4 : 1.2} position={[5, 5, 5]} />
      <WatchModel url={modelUrl} overlayMode={overlayMode} />
      {!overlayMode ? <Environment preset="studio" /> : null}
      {!overlayMode ? <OrbitControls enablePan={false} minDistance={2} maxDistance={8} /> : null}
    </Canvas>
  );
}

function OverlayLoadingPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white/10">
      <span className="text-[9px] uppercase tracking-[0.15em] text-white/70">Loading 3D…</span>
    </div>
  );
}

type WatchViewer3DProps = {
  modelUrl: string;
  className?: string;
  overlayMode?: boolean;
  width?: number;
  height?: number;
  onLoadError?: () => void;
};

export function WatchViewer3D({
  modelUrl,
  className,
  overlayMode = false,
  width,
  height,
  onLoadError,
}: WatchViewer3DProps) {
  const explicitSize = width != null && height != null;
  const containerStyle = explicitSize
    ? { width, height, minWidth: width, minHeight: height }
    : undefined;

  const scene = (
    <ViewerErrorBoundary onError={onLoadError}>
      <WatchScene modelUrl={modelUrl} overlayMode={overlayMode} />
    </ViewerErrorBoundary>
  );

  return (
    <div
      className={className ?? "relative h-full w-full min-h-[400px]"}
      style={containerStyle}
    >
      {overlayMode ? (
        <Suspense fallback={<OverlayLoadingPlaceholder />}>{scene}</Suspense>
      ) : (
        <Suspense fallback={null}>{scene}</Suspense>
      )}
      {!overlayMode ? (
        <p className="text-muted-foreground pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs uppercase tracking-[0.2em]">
          Drag to rotate
        </p>
      ) : null}
    </div>
  );
}
