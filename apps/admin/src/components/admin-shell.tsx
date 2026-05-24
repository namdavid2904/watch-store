"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@watch-store/ui";
import { clearAuthSession, createAuthClient } from "@watch-store/auth";
import { useMemo } from "react";

const ADMIN_SESSION_COOKIE = "ws_admin_session";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/inventory", label: "Inventory" },
  { href: "/enquiries", label: "Enquiries" },
  { href: "/users", label: "Users" },
];

function clearAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const client = useMemo(() => createAuthClient(API_URL), []);

  async function handleSignOut() {
    try {
      await client.logout();
    } finally {
      clearAuthSession();
      clearAdminSessionCookie();
      router.replace("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="border-border/80 flex w-64 shrink-0 flex-col border-r bg-muted/20">
        <div className="border-border/60 border-b px-6 py-8">
          <Link href="/dashboard" className="group block space-y-0.5">
            <span className="font-serif text-xl font-semibold tracking-[0.14em] uppercase">Maison</span>
            <span className="text-muted-foreground block text-[10px] tracking-[0.35em] uppercase transition group-hover:text-accent">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-6 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 transition ${
                  active
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-border/60 border-t p-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
