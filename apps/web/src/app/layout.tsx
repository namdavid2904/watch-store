import type { Metadata } from "next";
import { ThemeProvider } from "@watch-store/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watch Store",
  description: "Premium timepieces for every occasion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="border-b px-6 py-4">
            <nav className="mx-auto flex max-w-6xl items-center justify-between">
              <a href="/" className="text-xl font-semibold tracking-tight">
                Watch Store
              </a>
              <div className="flex gap-4 text-sm">
                <a href="/shop">Shop</a>
                <a href="/cart">Cart</a>
                <a href="/login">Login</a>
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
