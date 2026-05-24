"use client";

import { Badge, Button, Input } from "@watch-store/ui";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useCreateReview, useReviewEligibility } from "@/hooks/use-reviews";

const CASE_FIT_OPTIONS = ["Loose", "Perfect", "Snug", "Tight"];

type ProductReviewFormProps = {
  productSlug: string;
};

export function ProductReviewForm({ productSlug }: ProductReviewFormProps) {
  const { user } = useAuth();
  const eligibility = useReviewEligibility(productSlug, Boolean(user));
  const createReview = useCreateReview(productSlug);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [wristSizeMm, setWristSizeMm] = useState("");
  const [caseFit, setCaseFit] = useState(CASE_FIT_OPTIONS[1]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <p className="text-muted-foreground text-sm">
        Sign in and purchase this timepiece to leave a verified review.
      </p>
    );
  }

  if (eligibility.isLoading) {
    return <p className="text-muted-foreground text-sm">Checking review eligibility...</p>;
  }

  if (!eligibility.data?.canReview) {
    return (
      <p className="text-muted-foreground text-sm">
        Verified reviews are available to customers who have purchased this watch.
      </p>
    );
  }

  if (submitted) {
    return (
      <p className="text-accent text-sm">Thank you — your review has been published.</p>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createReview.mutateAsync({
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        wristSizeMm: wristSizeMm ? Number(wristSizeMm) : undefined,
        caseFit,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review");
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <p className="text-muted-foreground mb-2 text-xs uppercase tracking-[0.15em]">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`text-2xl transition ${value <= rating ? "text-accent" : "text-muted-foreground/40"}`}
              aria-label={`Rate ${value} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <Input placeholder="Review title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        className="border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Share your experience with this timepiece..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          type="number"
          min={100}
          max={250}
          placeholder="Wrist size (mm)"
          value={wristSizeMm}
          onChange={(e) => setWristSizeMm(e.target.value)}
        />
        <select
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          value={caseFit}
          onChange={(e) => setCaseFit(e.target.value)}
        >
          {CASE_FIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Case fit: {option}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" disabled={createReview.isPending || !body.trim()}>
        {createReview.isPending ? "Submitting..." : "Submit verified review"}
      </Button>
    </form>
  );
}
