"use client";

import { Button, Input } from "@watch-store/ui";
import { createAuthClient, setAuthSession } from "@watch-store/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const ADMIN_SESSION_COOKIE = "ws_admin_session";

function setAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=1; path=/; max-age=604800; samesite=lax`;
}

function clearAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useMemo(() => createAuthClient(API_URL), []);
  const [email, setEmail] = useState("admin@watchstore.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    client.refresh().then(async (ok) => {
      if (!ok) return;
      const profile = await client.getProfile();
      if (profile.role === "ADMIN") {
        setAdminSessionCookie();
        router.replace("/dashboard");
      }
    });
  }, [client, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await client.login({ email, password });
      setAuthSession(response);
      if (response.role !== "ADMIN") {
        clearAdminSessionCookie();
        await client.logout();
        setError("This account does not have admin access.");
        return;
      }
      setAdminSessionCookie();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Admin Sign In</h1>
        <p className="text-muted-foreground text-sm">Use your administrator credentials to access the dashboard.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-center">Loading...</p>}>
      <AdminLoginForm />
    </Suspense>
  );
}
