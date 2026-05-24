"use client";

import { Canvas } from "@react-three/fiber";
import { Component, Suspense, type ReactNode } from "react";
import type { TryOnTransform } from "@/hooks/use-try-on-transform";

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

function PlaceholderMesh() {
  return (
    <mesh>
      <torusGeometry args={[0.55, 0.09, 24, 64]} />
      <meshStandardMaterial color="#b8945c" metalness={0.85} roughness={0.22} />
    </mesh>
  );
}

function OverlayScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={1.1} position={[4, 4, 5]} />
      <PlaceholderMesh />
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

export function TryOnWatchCanvas({
  modelUrl: _modelUrl,
  width,
  height,
  transform: _transform,
  onLoadError,
}: TryOnWatchCanvasProps) {
  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <ViewerErrorBoundary onError={onLoadError}>
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <OverlayScene />
          </Suspense>
        </Canvas>
      </ViewerErrorBoundary>
    </div>
  );
}
