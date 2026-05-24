"use client";

import Image from "next/image";
import { Button } from "@watch-store/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { TryOnControls } from "@/components/try-on-controls";
import { WatchViewer3D } from "@/components/watch-viewer-3d";
import { useCameraStream } from "@/hooks/use-camera-stream";
import { useTryOnTransform } from "@/hooks/use-try-on-transform";
import { parseCaseDiameterMm } from "@/lib/watch-sizing";

type WatchTryOnOverlayProps = {
  open: boolean;
  onClose: () => void;
  productName: string;
  caseDimension: string | null | undefined;
  model3dUrl: string | null;
  fallbackImageUrl: string | null;
};

const BASE_MM_TO_PX = 3.2;

export function WatchTryOnOverlay({
  open,
  onClose,
  productName,
  caseDimension,
  model3dUrl,
  fallbackImageUrl,
}: WatchTryOnOverlayProps) {
  const caseDiameterMm = parseCaseDiameterMm(caseDimension);
  const {
    videoRef,
    permissionState,
    errorMessage,
    startStream,
    stopStream,
    toggleFacingMode,
  } = useCameraStream();
  const { transform, nudge, adjustScale, reset } = useTryOnTransform();
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);

  const usingUpload = uploadUrl !== null;
  const cameraEnabled = permissionState === "granted" && !usingUpload;
  const isLoading = permissionState === "requesting" && !usingUpload;
  const showPermissionFallback = !usingUpload && (permissionState === "denied" || permissionState === "unsupported");

  useEffect(() => {
    if (!open) {
      stopStream();
      if (uploadUrl) {
        URL.revokeObjectURL(uploadUrl);
        setUploadUrl(null);
      }
      reset();
      return;
    }

    void startStream();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUploadPhoto = useCallback(
    (file: File) => {
      stopStream();
      setUploadUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return URL.createObjectURL(file);
      });
    },
    [stopStream]
  );

  const handleToggleCamera = useCallback(() => {
    if (uploadUrl) {
      URL.revokeObjectURL(uploadUrl);
      setUploadUrl(null);
    }
    if (permissionState === "granted") {
      toggleFacingMode();
      return;
    }
    void startStream();
  }, [permissionState, startStream, toggleFacingMode, uploadUrl]);

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    dragOrigin.current = { x: clientX, y: clientY };
  }, []);

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragOrigin.current) {
        return;
      }
      nudge(clientX - dragOrigin.current.x, clientY - dragOrigin.current.y);
      dragOrigin.current = { x: clientX, y: clientY };
    },
    [nudge]
  );

  const handlePointerUp = useCallback(() => {
    dragOrigin.current = null;
  }, []);

  if (!open) {
    return null;
  }

  const ringSizePx = caseDiameterMm * BASE_MM_TO_PX * transform.scale;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full overflow-hidden">
        {usingUpload && uploadUrl ? (
          <Image src={uploadUrl} alt={`${productName} try-on background`} fill className="object-cover" unoptimized />
        ) : (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                <div className="h-12 w-12 animate-pulse rounded-full border border-white/30" />
                <p className="text-sm uppercase tracking-[0.2em] text-white/80">Starting camera…</p>
              </div>
            ) : null}
            {showPermissionFallback ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-white">
                <p className="font-serif text-2xl">Camera unavailable</p>
                <p className="max-w-md text-sm text-white/70">
                  {errorMessage ?? "Allow camera access or upload a wrist photo to continue sizing."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="button" onClick={() => void startStream()}>
                    Try again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = () => {
                        const file = input.files?.[0];
                        if (file) {
                          handleUploadPhoto(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    Upload photo
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {!showPermissionFallback ? (
          <div
            className="absolute inset-0 touch-none"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              handlePointerDown(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => handlePointerMove(event.clientX, event.clientY)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={(event) => {
              event.preventDefault();
              adjustScale(-event.deltaY * 0.0015);
            }}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2"
              style={{
                transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
              }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{ width: ringSizePx, height: ringSizePx }}
              >
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-white/70"
                  aria-hidden
                />
                <div className="relative h-[78%] w-[78%]">
                  {model3dUrl ? (
                    <WatchViewer3D modelUrl={model3dUrl} overlayMode className="h-full w-full min-h-0" />
                  ) : fallbackImageUrl ? (
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={fallbackImageUrl}
                        alt={productName}
                        fill
                        className="object-cover"
                        sizes="320px"
                        unoptimized={fallbackImageUrl.startsWith("blob:")}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full border border-white/40 bg-black/30 text-xs uppercase tracking-[0.2em] text-white/80">
                      {caseDiameterMm}mm
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <TryOnControls
          caseDiameterMm={caseDiameterMm}
          displayScale={transform.scale}
          cameraEnabled={cameraEnabled}
          usingUpload={usingUpload}
          onToggleCamera={handleToggleCamera}
          onUploadPhoto={handleUploadPhoto}
          onReset={reset}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
