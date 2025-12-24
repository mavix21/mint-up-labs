import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

import "@mint-up/ui/globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@mint-up/features/app/providers";
import { Toaster } from "@mint-up/ui/components/sonner";

import { MiniAppProvider } from "@/shared/context";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Next.js Monorepo Template",
  description: "Next.js Monorepo Template",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning lang="es">
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider>
          <MiniAppProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              enableColorScheme
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </MiniAppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
