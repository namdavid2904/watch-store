"use client";

import { Button } from "@watch-store/ui";
import Link from "next/link";
import { CartBadgeLink } from "@/components/cart-badge-link";
import { useAuth } from "./auth-provider";

export function SiteHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b px-6 py-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Watch Store
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/shop">Shop</Link>
          <CartBadgeLink />
          {loading ? null : user ? (
            <>
              <Link href="/account">Account</Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
