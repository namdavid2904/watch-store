import type { Metadata } from "next";
import { ThemeProvider } from "@watch-store/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watch Store Admin",
  description: "Admin dashboard for Watch Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <aside className="w-56 border-r p-4">
              <h1 className="mb-6 text-lg font-semibold">Admin</h1>
              <nav className="flex flex-col gap-2 text-sm">
                <a href="/dashboard">Dashboard</a>
                <a href="/products">Products</a>
                <a href="/orders">Orders</a>
                <a href="/inventory">Inventory</a>
                <a href="/enquiries">Enquiries</a>
              </nav>
            </aside>
            <main className="flex-1 p-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
