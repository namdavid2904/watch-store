"use client";

import Image from "next/image";
import type { TryOnTransform } from "@/hooks/use-try-on-transform";
import { computeOverlayDiameterPx } from "@/lib/watch-sizing";

type TryOnAssetLayerProps = {
  productName: string;
  caseDiameterMm: number;
  transform: TryOnTransform;
  imageUrl: string | null;
  model3dUrl?: string | null;
};

export function TryOnAssetLayer({
  productName,
  caseDiameterMm,
  transform,
  imageUrl,
}: TryOnAssetLayerProps) {
  const sizePx = computeOverlayDiameterPx(caseDiameterMm, transform.scale);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) rotate(${transform.rotation}deg)`,
      }}
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
          {imageUrl ? (
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
