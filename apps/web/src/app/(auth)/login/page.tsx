"use client";

import { Button, Input } from "@watch-store/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const { login, client } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-muted-foreground text-sm">Access your orders, wishlist, and checkout.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
      <div className="space-y-3 text-center text-sm">
        <Button variant="outline" className="w-full" asChild>
          <a href={client.getGoogleOAuthUrl()}>Continue with Google</a>
        </Button>
        <p>
          No account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </section>
  );
}
