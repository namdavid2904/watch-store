"use client";

import { Badge, Skeleton } from "@watch-store/ui";
import { useProductReviews } from "@/hooks/use-reviews";
import { ProductReviewForm } from "@/components/product-review-form";

type ProductReviewsSectionProps = {
  productSlug: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-accent" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-muted-foreground/30">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ProductReviewsSection({ productSlug }: ProductReviewsSectionProps) {
  const reviewsQuery = useProductReviews(productSlug);

  return (
    <section className="luxury-surface space-y-8 rounded-2xl border p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">Owner impressions</p>
          <h2 className="font-serif text-3xl">Reviews</h2>
        </div>
        {reviewsQuery.data && reviewsQuery.data.totalElements > 0 ? (
          <div className="text-right">
            <p className="font-serif text-2xl">{reviewsQuery.data.averageRating.toFixed(1)}</p>
            <p className="text-muted-foreground text-xs">
              {reviewsQuery.data.totalElements} verified review{reviewsQuery.data.totalElements === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}
      </div>

      <ProductReviewForm productSlug={productSlug} />

      {reviewsQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : reviewsQuery.data?.content.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first verified owner to share your experience.</p>
      ) : (
        <ul className="divide-border/60 divide-y">
          {reviewsQuery.data?.content.map((review) => (
            <li key={review.id} className="space-y-2 py-6 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <StarRating rating={review.rating} />
                  <span className="font-medium">{review.reviewerName}</span>
                  {review.verifiedPurchase ? <Badge variant="accent">Verified purchase</Badge> : null}
                </div>
                <time className="text-muted-foreground text-xs">
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </div>
              {review.title ? <p className="font-medium">{review.title}</p> : null}
              <p className="text-muted-foreground text-sm leading-relaxed">{review.body}</p>
              {review.wristSizeMm || review.caseFit ? (
                <p className="text-muted-foreground text-xs uppercase tracking-[0.12em]">
                  {review.wristSizeMm ? `${review.wristSizeMm}mm wrist` : null}
                  {review.wristSizeMm && review.caseFit ? " · " : null}
                  {review.caseFit ? `${review.caseFit} fit` : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
