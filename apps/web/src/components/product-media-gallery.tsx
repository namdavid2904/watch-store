"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { WatchViewer3D } from "@/components/watch-viewer-3d";
import { getProductImageUrl } from "@/lib/product-image";

type ProductMediaGalleryProps = {
  images: string[];
  galleryImages: string[];
  model3dUrl: string | null;
  productName: string;
  brandName: string;
};

export function ProductMediaGallery({
  images,
  galleryImages,
  model3dUrl,
  productName,
  brandName,
}: ProductMediaGalleryProps) {
  const resolvedGallery = useMemo(() => {
    const refs = galleryImages.length > 0 ? galleryImages : images;
    return refs.map((ref) => getProductImageUrl(ref)).filter((url): url is string => url !== null);
  }, [galleryImages, images]);

  const modelUrl = model3dUrl ? getProductImageUrl(model3dUrl) : null;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragRotation, setDragRotation] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const handlePointerDown = useCallback((clientX: number) => {
    dragStartX.current = clientX;
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (dragStartX.current === null || resolvedGallery.length <= 1) {
      return;
    }
    const delta = clientX - dragStartX.current;
    setDragRotation(delta * 0.15);
  }, [resolvedGallery.length]);

  const handlePointerUp = useCallback(() => {
    if (dragStartX.current === null || resolvedGallery.length <= 1) {
      dragStartX.current = null;
      return;
    }
    const delta = dragRotation;
    if (Math.abs(delta) > 30) {
      setActiveIndex((current) =>
        delta > 0
          ? (current - 1 + resolvedGallery.length) % resolvedGallery.length
          : (current + 1) % resolvedGallery.length
      );
    }
    setDragRotation(0);
    dragStartX.current = null;
  }, [dragRotation, resolvedGallery.length]);

  if (modelUrl) {
    return (
      <div className="luxury-surface relative aspect-[4/5] overflow-hidden rounded-2xl">
        <WatchViewer3D className="h-full w-full" modelUrl={modelUrl} />
      </div>
    );
  }

  const activeImage = resolvedGallery[activeIndex] ?? null;

  return (
    <div className="space-y-4">
      <div
        className="luxury-surface relative aspect-[4/5] cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing"
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0]?.clientX ?? 0)}
        onTouchMove={(e) => handlePointerMove(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={handlePointerUp}
      >
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="object-cover transition-transform duration-200"
            style={{ transform: `rotateY(${dragRotation}deg)` }}
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-sm uppercase tracking-[0.25em]">{brandName}</span>
          </div>
        )}
        {resolvedGallery.length > 1 ? (
          <p className="text-muted-foreground pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs uppercase tracking-[0.2em]">
            Drag to explore angles
          </p>
        ) : null}
      </div>

      {resolvedGallery.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resolvedGallery.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                index === activeIndex ? "border-accent ring-1 ring-accent" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
