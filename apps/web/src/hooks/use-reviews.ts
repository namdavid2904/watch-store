"use client";

import {
  createReviewsClient,
  type CreateReviewRequest,
  type ReviewPage,
} from "@watch-store/api-client";
import { getAccessToken } from "@watch-store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function useProductReviews(slug: string) {
  const client = useMemo(
    () => createReviewsClient(API_URL, () => ({ accessToken: getAccessToken() })),
    []
  );

  return useQuery({
    queryKey: ["reviews", slug],
    queryFn: () => client.listReviews(slug),
    enabled: Boolean(slug),
  });
}

export function useReviewEligibility(slug: string, enabled: boolean) {
  const client = useMemo(
    () => createReviewsClient(API_URL, () => ({ accessToken: getAccessToken() })),
    []
  );

  return useQuery({
    queryKey: ["reviews", slug, "eligibility"],
    queryFn: () => client.checkEligibility(slug),
    enabled: enabled && Boolean(slug),
  });
}

export function useCreateReview(slug: string) {
  const client = useMemo(
    () => createReviewsClient(API_URL, () => ({ accessToken: getAccessToken() })),
    []
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateReviewRequest) => client.createReview(slug, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
    },
  });
}

export type { ReviewPage };
