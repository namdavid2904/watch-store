"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

type WatchModelProps = {
  url: string;
};

function WatchModel({ url }: WatchModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.2} />;
}

type WatchViewer3DProps = {
  modelUrl: string;
  className?: string;
};

export function WatchViewer3D({ modelUrl, className }: WatchViewer3DProps) {
  return (
    <div className={className ?? "relative h-full w-full min-h-[400px]"}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1.2} position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <WatchModel url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
      <p className="text-muted-foreground pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs uppercase tracking-[0.2em]">
        Drag to rotate
      </p>
    </div>
  );
}
