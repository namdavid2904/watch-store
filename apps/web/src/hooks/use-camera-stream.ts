"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraPermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

type FacingMode = "user" | "environment";

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<CameraPermissionState>("idle");
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setIsStreamReady(false);
  }, []);

  const startStream = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unsupported");
      setErrorMessage("Camera is not supported in this browser.");
      return;
    }

    setPermissionState("requesting");
    setErrorMessage(null);
    setIsStreamReady(false);

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => setIsStreamReady(true);
        await video.play();
        if (video.readyState >= 2) {
          setIsStreamReady(true);
        }
      }

      setPermissionState("granted");
    } catch (error) {
      stopStream();
      setPermissionState("denied");
      setIsStreamReady(false);
      setErrorMessage(error instanceof Error ? error.message : "Camera permission denied.");
    }
  }, [facingMode, stopStream]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((current) => (current === "user" ? "environment" : "user"));
  }, []);

  useEffect(() => {
    if (permissionState === "granted") {
      void startStream();
    }
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopStream(), [stopStream]);

  return {
    videoRef,
    permissionState,
    isStreamReady,
    errorMessage,
    facingMode,
    startStream,
    stopStream,
    toggleFacingMode,
  };
}
