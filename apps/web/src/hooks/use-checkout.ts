"use client";

import {
  createCheckoutClient,
  type CheckoutConfirmResponse,
  type CheckoutInitiateResponse,
} from "@watch-store/api-client";
import { getAccessToken } from "@watch-store/auth";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { getCartSessionId } from "@/lib/cart-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getCheckoutContext() {
  return {
    accessToken: getAccessToken(),
    cartSessionId: getCartSessionId(),
  };
}

export function useCheckout() {
  const client = useMemo(() => createCheckoutClient(API_URL, getCheckoutContext), []);

  const initiate = useMutation({
    mutationFn: () => client.initiate(),
  });

  const confirm = useMutation({
    mutationFn: (input: { checkoutId: string; shippingAddress: Record<string, string> }) =>
      client.confirm(input),
  });

  return { initiate, confirm };
}

export type { CheckoutConfirmResponse, CheckoutInitiateResponse };
