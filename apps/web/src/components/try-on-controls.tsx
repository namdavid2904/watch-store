"use client";

import { Button } from "@watch-store/ui";
import { useRef } from "react";
import { computeEffectiveDiameterMm } from "@/lib/watch-sizing";

type TryOnControlsProps = {
  caseDiameterMm: number;
  displayScale: number;
  rotationDeg: number;
  cameraEnabled: boolean;
  usingUpload: boolean;
  onToggleCamera: () => void;
  onUploadPhoto: (file: File) => void;
  onScaleBy: (delta: number) => void;
  onRotateBy: (delta: number) => void;
  onReset: () => void;
  onClose: () => void;
};

export function TryOnControls({
  caseDiameterMm,
  displayScale,
  rotationDeg,
  cameraEnabled,
  usingUpload,
  onToggleCamera,
  onUploadPhoto,
  onScaleBy,
  onRotateBy,
  onReset,
  onClose,
}: TryOnControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const effectiveMm = computeEffectiveDiameterMm(caseDiameterMm, displayScale);

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 space-y-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pb-6 pt-16">
      <div className="flex items-center justify-between gap-3 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Case diameter</p>
          <p className="font-serif text-2xl">{effectiveMm}mm</p>
          <p className="text-xs text-white/60">
            Spec {caseDiameterMm}mm · scale {(displayScale * 100).toFixed(0)}% · {Math.round(rotationDeg)}°
          </p>
        </div>
        <Button type="button" variant="outline" className="border-white/30 bg-black/40 text-white hover:bg-black/60" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/50">Size</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/30 bg-black/40 px-3 text-white hover:bg-black/60"
          onClick={() => onScaleBy(-0.08)}
          aria-label="Decrease watch size"
        >
          −
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/30 bg-black/40 px-3 text-white hover:bg-black/60"
          onClick={() => onScaleBy(0.08)}
          aria-label="Increase watch size"
        >
          +
        </Button>
        <span className="mx-1 text-[10px] uppercase tracking-[0.15em] text-white/50">Rotate</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/30 bg-black/40 px-3 text-white hover:bg-black/60"
          onClick={() => onRotateBy(-8)}
          aria-label="Rotate counter-clockwise"
        >
          ↺
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/30 bg-black/40 px-3 text-white hover:bg-black/60"
          onClick={() => onRotateBy(8)}
          aria-label="Rotate clockwise"
        >
          ↻
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/30 bg-black/40 text-white hover:bg-black/60"
          onClick={onToggleCamera}
        >
          {cameraEnabled && !usingUpload ? "Switch camera" : "Use camera"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/30 bg-black/40 text-white hover:bg-black/60"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload photo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/30 bg-black/40 text-white hover:bg-black/60"
          onClick={onReset}
        >
          Reset position
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUploadPhoto(file);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}
