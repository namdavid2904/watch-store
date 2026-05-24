import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@watch-store/ui";
import { AuthProvider } from "@/components/auth-provider";
import { GlobalEnquiryFab } from "@/components/global-enquiry-fab";
import { QueryProvider } from "@/components/query-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Watch Store",
  description: "Premium timepieces for every occasion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <SiteHeader />
              <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
              <GlobalEnquiryFab />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
