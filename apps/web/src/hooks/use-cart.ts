"use client";

import { createCartClient, type Cart, type AddCartItemRequest } from "@watch-store/api-client";
import { getAccessToken, getAuthSession } from "@watch-store/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { getCartSessionId } from "@/lib/cart-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getCartContext() {
  const user = getAuthSession();
  return {
    accessToken: getAccessToken(),
    cartSessionId: user ? null : getCartSessionId(),
  };
}

export function useCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const sessionId = typeof window !== "undefined" ? getCartSessionId() : "";
  const client = useMemo(() => createCartClient(API_URL, getCartContext), []);
  const queryKey = ["cart", user?.userId ?? sessionId];

  const cartQuery = useQuery({
    queryKey,
    queryFn: () => client.getCart(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const addItem = useMutation({
    mutationFn: (body: AddCartItemRequest) => client.addItem(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Cart>(queryKey);
      if (previous) {
        queryClient.setQueryData<Cart>(queryKey, {
          ...previous,
          itemCount: previous.itemCount + body.quantity,
        });
      }
      return { previous };
    },
    onError: (_error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      client.updateItem(productId, quantity),
    onSettled: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => client.removeItem(productId),
    onSettled: invalidate,
  });

  const clearCart = useMutation({
    mutationFn: () => client.clearCart(),
    onSettled: invalidate,
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };
}
