"use client";

import Image from "next/image";
import { useState } from "react";
import type { TryOnTransform } from "@/hooks/use-try-on-transform";
import { WatchViewer3D } from "@/components/watch-viewer-3d";
import { computeOverlayDiameterPx } from "@/lib/watch-sizing";

type TryOnAssetLayerProps = {
  productName: string;
  caseDiameterMm: number;
  transform: TryOnTransform;
  imageUrl: string | null;
  model3dUrl?: string | null;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
};

export function TryOnAssetLayer({
  productName,
  caseDiameterMm,
  transform,
  imageUrl,
  model3dUrl,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TryOnAssetLayerProps) {
  const [model3dFailed, setModel3dFailed] = useState(false);
  const sizePx = computeOverlayDiameterPx(caseDiameterMm, transform.scale);
  const innerSizePx = Math.round(sizePx * 0.72);

  const prefer2d = Boolean(imageUrl);
  const show3d = Boolean(model3dUrl) && !prefer2d && !model3dFailed;

  return (
    <div
      className="absolute left-1/2 top-1/2 cursor-grab touch-none active:cursor-grabbing"
      style={{
        transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) rotate(${transform.rotation}deg)`,
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onDragStart(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => onDragMove(event.clientX, event.clientY)}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      <div
        className="relative flex items-center justify-center drop-shadow-2xl"
        style={{ width: sizePx, height: sizePx }}
      >
        <svg
          className="absolute inset-0 h-full w-full text-white/80"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 4"
          />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </svg>

        <div className="relative flex h-[72%] w-[72%] items-center justify-center">
          {prefer2d && imageUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={imageUrl}
                alt={productName}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 45vw, 280px"
                unoptimized={imageUrl.startsWith("blob:")}
                priority
              />
            </div>
          ) : show3d && model3dUrl ? (
            <WatchViewer3D
              modelUrl={model3dUrl}
              overlayMode
              width={innerSizePx}
              height={innerSizePx}
              className="relative"
              onLoadError={() => setModel3dFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border border-white/50 bg-black/40 px-2 text-center text-xs uppercase tracking-[0.2em] text-white/90">
              {caseDiameterMm}mm
            </div>
          )}
        </div>

        <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-white/70">
          {Math.round(caseDiameterMm * transform.scale)}mm on screen
        </span>
      </div>
    </div>
  );
}
