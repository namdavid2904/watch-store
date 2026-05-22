import type { Metadata } from "next";
import { ThemeProvider } from "@watch-store/ui";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
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
          <AuthProvider>
            <SiteHeader />
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
