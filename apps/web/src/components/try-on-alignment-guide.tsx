"use client";

type TryOnAlignmentGuideProps = {
  visible: boolean;
};

export function TryOnAlignmentGuide({ visible }: TryOnAlignmentGuideProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
      <svg
        className="h-[min(55vh,420px)] w-[min(70vw,280px)] text-white/75"
        viewBox="0 0 200 280"
        aria-hidden
      >
        <ellipse cx="100" cy="140" rx="72" ry="118" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 8" />
        <ellipse cx="100" cy="140" rx="58" ry="98" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <line x1="100" y1="22" x2="100" y2="258" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      </svg>
      <p className="max-w-xs text-center text-sm uppercase tracking-[0.22em] text-white/90">
        Position your wrist inside the target area
      </p>
      <p className="text-center text-xs text-white/50">Drag the watch to align · scroll to resize · shift+scroll to rotate</p>
    </div>
  );
}
