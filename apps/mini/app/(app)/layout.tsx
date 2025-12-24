import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { preconnect } from "react-dom";

import { ConvexClientProvider } from "@/app/_providers/convex-cllient.provider";
import { minikitConfig } from "@/minikit.config";
import { AuthProvider } from "@/shared/context/auth-context";
import { MiniAppProvider } from "@/shared/context/miniapp-context";
import { BottomNav } from "@/widgets/navigation";

import { OnchainKitClientProvider } from "./_providers/onchainkit.provider";
import { ThemeProvider } from "./_providers/theme-provider";

import "@coinbase/onchainkit/styles.css";
import "@mint-up/ui/globals.css";
import "@silk-hq/components/layered-styles.css";

import { env } from "@/env";

export async function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    keywords: ["farcaster"],
    authors: [{ name: "mavix" }],

    // Open Graph metadata for social sharing and embeds
    openGraph: {
      title: minikitConfig.frame.name,
      description: minikitConfig.frame.description,
      type: "website",
      url: env.SITE_URL,
      siteName: minikitConfig.frame.name,
      images: [
        {
          url: minikitConfig.frame.heroImageUrl,
          width: 1200,
          height: 630,
          alt: "EthMumbai Avatar Generator",
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: "summary_large_image",
      title: minikitConfig.frame.name,
      description: minikitConfig.frame.description,
      images: [minikitConfig.frame.heroImageUrl],
    },

    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: minikitConfig.frame.name,
    },
    formatDetection: {
      telephone: false,
    },
    robots: {
      index: false,
      follow: false,
    },
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl: minikitConfig.frame.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.frame.name}`,
          action: {
            name: `Launch ${minikitConfig.frame.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  });
}

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sourceCodePro = Sora({
  variable: "--font-acc",
  subsets: ["latin"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  preconnect("https://auth.farcaster.xyz");

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceCodePro.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider>
          <OnchainKitClientProvider>
            <MiniAppProvider>
              <ConvexClientProvider>
                <AuthProvider>
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    enableColorScheme
                  >
                    {children}
                  </ThemeProvider>
                  <BottomNav />
                </AuthProvider>
              </ConvexClientProvider>
            </MiniAppProvider>
          </OnchainKitClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
