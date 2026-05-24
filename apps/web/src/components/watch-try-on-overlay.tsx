"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { TryOnAssetLayer } from "@/components/try-on-asset-layer";
import { TryOnControls } from "@/components/try-on-controls";
import { TryOnGestureLayer } from "@/components/try-on-gesture-layer";
import { TryOnStage } from "@/components/try-on-stage";
import { TryOnLoadingState, TryOnPermissionFallback } from "@/components/try-on-status-states";
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
  const { transform, nudge, adjustScale, adjustRotation, reset } = useTryOnTransform();
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

  const workspaceContent = !showPermissionFallback ? (
    <TryOnGestureLayer onAdjustScale={adjustScale} onAdjustRotation={adjustRotation}>
      <TryOnAssetLayer
        productName={productName}
        caseDiameterMm={caseDiameterMm}
        transform={transform}
        imageUrl={fallbackImageUrl}
        model3dUrl={model3dUrl}
        onDragStart={handlePointerDown}
        onDragMove={handlePointerMove}
        onDragEnd={handlePointerUp}
      />
    </TryOnGestureLayer>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <TryOnStage
        uploadBackground={
          usingUpload && uploadUrl ? (
            <Image
              src={uploadUrl}
              alt={`${productName} try-on background`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : undefined
        }
        video={
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {isLoading ? <TryOnLoadingState /> : null}
            {showPermissionFallback ? (
              <TryOnPermissionFallback
                errorMessage={errorMessage}
                onRetry={() => void startStream()}
                onUpload={() => {
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
              />
            ) : null}
          </>
        }
        workspace={workspaceContent}
        chrome={
          <TryOnControls
            caseDiameterMm={caseDiameterMm}
            displayScale={transform.scale}
            rotationDeg={transform.rotation}
            cameraEnabled={cameraEnabled}
            usingUpload={usingUpload}
            onToggleCamera={handleToggleCamera}
            onUploadPhoto={handleUploadPhoto}
            onScaleBy={adjustScale}
            onRotateBy={adjustRotation}
            onReset={reset}
            onClose={onClose}
          />
        }
      />
    </div>
  );
}
