"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { TryOnTransform } from "@/hooks/use-try-on-transform";
import { TryOnWatchCanvas } from "@/components/try-on-watch-canvas";
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

  useEffect(() => {
    setModel3dFailed(false);
  }, [model3dUrl]);

  const sizePx = computeOverlayDiameterPx(caseDiameterMm, transform.scale);
  const innerSizePx = Math.round(sizePx * 0.72);

  const show3d = Boolean(model3dUrl) && !model3dFailed;
  const show2dFallback = Boolean(imageUrl) && !show3d;

  return (
    <div
      className="absolute left-1/2 top-1/2 cursor-grab touch-none active:cursor-grabbing"
      style={{
        transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px))`,
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
          className="pointer-events-none absolute inset-0 h-full w-full text-white/80"
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
          {show3d && model3dUrl ? (
            <TryOnWatchCanvas
              key={model3dUrl}
              modelUrl={model3dUrl}
              width={innerSizePx}
              height={innerSizePx}
              transform={transform}
              caseDiameterMm={caseDiameterMm}
              onLoadError={() => setModel3dFailed(true)}
            />
          ) : show2dFallback && imageUrl ? (
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
