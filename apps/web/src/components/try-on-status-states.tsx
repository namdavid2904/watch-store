"use client";

import { Button } from "@watch-store/ui";

type TryOnLoadingStateProps = {
  message?: string;
};

export function TryOnLoadingState({ message = "Starting camera…" }: TryOnLoadingStateProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-ping rounded-full border border-white/20" />
        <div className="absolute inset-2 animate-pulse rounded-full border border-white/40" />
        <div className="absolute inset-4 rounded-full bg-white/10" />
      </div>
      <p className="text-sm uppercase tracking-[0.2em] text-white/80">{message}</p>
    </div>
  );
}

type TryOnPermissionFallbackProps = {
  errorMessage: string | null;
  onRetry: () => void;
  onUpload: () => void;
};

export function TryOnAssetSkeleton() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="h-[min(45vw,280px)] w-[min(45vw,280px)] animate-pulse rounded-full border-2 border-dashed border-white/30 bg-white/5" />
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Preparing watch overlay…</p>
    </div>
  );
}

export function TryOnPermissionFallback({
  errorMessage,
  onRetry,
  onUpload,
}: TryOnPermissionFallbackProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-white"
      role="alert"
    >
      <p className="font-serif text-2xl">Camera unavailable</p>
      <p className="max-w-md text-sm text-white/70">
        {errorMessage ?? "Allow camera access or upload a wrist photo to continue sizing."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
        <Button type="button" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onUpload}>
          Upload photo
        </Button>
      </div>
    </div>
  );
}
