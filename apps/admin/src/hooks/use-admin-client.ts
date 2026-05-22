"use client";

import { createAdminClient } from "@watch-store/api-client";
import { getAccessToken } from "@watch-store/auth";
import { useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function useAdminClient() {
  return useMemo(
    () => createAdminClient(API_URL, () => ({ accessToken: getAccessToken() })),
    []
  );
}
