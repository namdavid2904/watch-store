"use client";

import { Button } from "@watch-store/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartBadgeLink } from "@/components/cart-badge-link";
import { useAuth } from "./auth-provider";

const NAV_LINKS = [
  { href: "/shop", label: "Collection" },
];

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="group space-y-0.5">
          <span className="font-serif text-2xl font-semibold tracking-[0.18em] uppercase">Maison</span>
          <span className="text-muted-foreground block text-[10px] tracking-[0.35em] uppercase transition group-hover:text-accent">
            Horology
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-accent ${pathname.startsWith(link.href) ? "text-foreground" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <CartBadgeLink />
          {loading ? (
            <span className="text-muted-foreground hidden sm:inline">...</span>
          ) : user ? (
            <>
              <Link href="/account" className="text-muted-foreground hidden transition hover:text-foreground sm:inline">
                Account
              </Link>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted-foreground transition hover:text-foreground">
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
