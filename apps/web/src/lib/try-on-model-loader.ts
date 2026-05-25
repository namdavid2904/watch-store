import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";

type DisposableMesh = {
  geometry?: { dispose(): void };
  material?: { dispose(): void } | Array<{ dispose(): void }>;
};

type DisposableRoot = {
  traverse(callback: (object: unknown) => void): void;
  clone: (recursive?: boolean) => DisposableRoot;
};

export function preloadTryOnModel(url: string): void {
  useGLTF.preload(url);
}

export function useClonedTryOnScene(url: string): DisposableRoot {
  const { scene } = useGLTF(url);
  return useMemo(() => (scene as DisposableRoot).clone(true), [scene]);
}

export function disposeClonedScene(root: DisposableRoot): void {
  root.traverse((object) => {
    const mesh = object as DisposableMesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (!material) {
      return;
    }
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
      return;
    }
    material.dispose();
  });
}
