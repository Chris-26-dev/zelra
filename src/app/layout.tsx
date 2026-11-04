import type { Metadata } from "next";
import { Geist, Geist_Mono, Geologica } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";
import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { JotaiProvider } from "@/components/jotai-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for names, titles and headings; the SHRP axis cuts its curves into facets like the logo.
const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin"],
  axes: ["SHRP"],
});

export const metadata: Metadata = {
  title: "Zelra",
  description: "Zelra is a real-time, multi-workspace chat application inspired by Slack. It uses Next.js 15, Convex for backend logic and database, React 19, TailwindCSS, and Radix UI to build a seamless messaging experience.",
  icons: {
    icon: "/logo2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${geologica.variable} antialiased`}
        >
          <ThemeProvider>
            <ConvexClientProvider>
              <JotaiProvider>
                <TooltipProvider delayDuration={250}>
                  <Toaster />
                  <Modals />
                  {children}
                </TooltipProvider>
              </JotaiProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
