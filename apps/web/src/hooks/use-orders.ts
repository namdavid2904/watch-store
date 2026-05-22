"use client";

import { createOrdersClient, type Order } from "@watch-store/api-client";
import { getAccessToken } from "@watch-store/auth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function useOrders() {
  const client = useMemo(
    () => createOrdersClient(API_URL, () => ({ accessToken: getAccessToken() })),
    []
  );

  return useQuery({
    queryKey: ["orders"],
    queryFn: () => client.listOrders(),
  });
}

export function useOrder(orderId: string) {
  const client = useMemo(
    () => createOrdersClient(API_URL, () => ({ accessToken: getAccessToken() })),
    []
  );

  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => client.getOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export type { Order };
