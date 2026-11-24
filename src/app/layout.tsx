import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { env } from "@/utils/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Urban Air Quality Assistant | Indian Smog & AQI Daily Guidance",
    template: "%s | Urban Air Quality Assistant",
  },
  description: "AI-powered air quality guidance for Indian families. Get personalised low-emission routines, indoor air coaching, and science-backed protection from winter smog — based on CPCB, WHO and CAQM standards.",
  keywords: ["AQI India", "air quality Delhi", "smog protection", "indoor air purifier", "CPCB AQI", "PM2.5 India", "winter smog India"],
  authors: [{ name: "Urban Air Quality Assistant" }],
  openGraph: {
    type: "website",
    siteName: "Urban Air Quality Assistant",
    title: "Urban Air Quality Assistant — Indian Smog & AQI Daily Guidance",
    description: "AI-powered daily smog guidance for Indian families — low-emission routines, indoor air coaching, and science-backed recommendations.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14213d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        <div className="coral-aurora-beam" aria-hidden="true" />
        <div className="coral-orb-secondary" aria-hidden="true" />
        <Header />
        <main id="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
