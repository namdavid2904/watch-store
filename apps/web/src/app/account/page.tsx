"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export default function AccountPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground">Loading account...</p>;
  }

  if (!user) {
    return (
      <section className="space-y-4 text-center">
        <p>Please sign in to view your account.</p>
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">My Account</h1>
      <p className="text-muted-foreground">Signed in as {user.email}</p>
    </section>
  );
}
