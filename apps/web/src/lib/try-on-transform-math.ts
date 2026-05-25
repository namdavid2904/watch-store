import type { TryOnTransform } from "@/hooks/use-try-on-transform";
import { computeOverlayDiameterPx } from "@/lib/watch-sizing";

const PX_TO_WORLD = 0.0045;
const BASE_MESH_SCALE = 1.35;
const REFERENCE_OVERLAY_PX = 200;

export type OverlayGroupTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export function toOverlayGroupTransform(
  transform: TryOnTransform,
  caseDiameterMm: number
): OverlayGroupTransform {
  const overlayPx = computeOverlayDiameterPx(caseDiameterMm, transform.scale);
  const scaleFactor = (overlayPx / REFERENCE_OVERLAY_PX) * BASE_MESH_SCALE * transform.scale;

  return {
    position: [transform.x * PX_TO_WORLD, -transform.y * PX_TO_WORLD, 0],
    rotation: [0, 0, (transform.rotation * Math.PI) / 180],
    scale: scaleFactor,
  };
}
