"use client";

import { Button, Input } from "@watch-store/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({ email, password, firstName, lastName });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create account</h1>
        <p className="text-muted-foreground text-sm">Join Watch Store to save your cart and track orders.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </section>
  );
}
