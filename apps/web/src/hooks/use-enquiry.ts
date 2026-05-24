"use client";

import { createEnquiriesClient, type CreateEnquiryRequest } from "@watch-store/api-client";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function useCreateEnquiry() {
  const client = useMemo(() => createEnquiriesClient(API_URL), []);

  return useMutation({
    mutationFn: (body: CreateEnquiryRequest) => client.createEnquiry(body),
  });
}

export type { CreateEnquiryRequest };
