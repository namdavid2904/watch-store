"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

type WatchModelProps = {
  url: string;
  overlayMode: boolean;
};

function WatchModel({ url, overlayMode }: WatchModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={overlayMode ? 1.4 : 1.2} />;
}

type WatchViewer3DProps = {
  modelUrl: string;
  className?: string;
  overlayMode?: boolean;
};

export function WatchViewer3D({ modelUrl, className, overlayMode = false }: WatchViewer3DProps) {
  return (
    <div className={className ?? "relative h-full w-full min-h-[400px]"}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ alpha: overlayMode, antialias: true }}
        style={overlayMode ? { background: "transparent" } : undefined}
      >
        <ambientLight intensity={overlayMode ? 0.85 : 0.6} />
        <directionalLight intensity={overlayMode ? 1.4 : 1.2} position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <WatchModel url={modelUrl} overlayMode={overlayMode} />
          {!overlayMode ? <Environment preset="studio" /> : null}
        </Suspense>
        {!overlayMode ? (
          <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
        ) : null}
      </Canvas>
      {!overlayMode ? (
        <p className="text-muted-foreground pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs uppercase tracking-[0.2em]">
          Drag to rotate
        </p>
      ) : null}
    </div>
  );
}
