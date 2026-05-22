"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAuthClient, setAuthSession } from "@watch-store/auth";
import { useAuth } from "@/components/auth-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function finishLogin() {
      const accessToken = searchParams.get("accessToken");
      if (!accessToken) {
        setError("Missing access token from OAuth callback.");
        return;
      }

      setAuthSession({
        accessToken,
        userId: "",
        email: "",
        role: "CUSTOMER",
      });

      const client = createAuthClient(API_URL);
      const profile = await client.getProfile();
      await completeOAuthLogin({
        accessToken,
        userId: profile.id,
        email: profile.email,
        role: profile.role,
      });
      router.replace("/");
    }

    finishLogin().catch(() => setError("Unable to complete Google sign in."));
  }, [searchParams, completeOAuthLogin, router]);

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  return <p className="text-muted-foreground text-center">Completing sign in...</p>;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-center">Completing sign in...</p>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
