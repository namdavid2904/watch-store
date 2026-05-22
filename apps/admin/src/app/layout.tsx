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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
