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
    <div className="flex min-h-screen">
      <aside className="border-border w-60 border-r p-4">
        <h1 className="mb-6 text-lg font-semibold">Watch Store Admin</h1>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 hover:bg-muted ${
                pathname.startsWith(item.href) ? "bg-muted font-medium" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="outline" size="sm" className="mt-8 w-full" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
