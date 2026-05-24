"use client";

import type { ReactNode } from "react";

type TryOnStageProps = {
  video: ReactNode;
  guide?: ReactNode;
  workspace?: ReactNode;
  chrome: ReactNode;
  uploadBackground?: ReactNode;
};

export function TryOnStage({ video, guide, workspace, chrome, uploadBackground }: TryOnStageProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {uploadBackground ? (
        <div className="absolute inset-0 z-0">{uploadBackground}</div>
      ) : (
        <div className="absolute inset-0 z-0">{video}</div>
      )}

      {guide ? <div className="pointer-events-none absolute inset-0 z-10">{guide}</div> : null}

      {workspace ? (
        <div className="absolute inset-0 z-[15] touch-none">{workspace}</div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-20 [&>*]:pointer-events-auto">{chrome}</div>
    </div>
  );
}
