import type { Metadata, Viewport } from "next";
import { Baloo_2, Fraunces, Space_Mono } from "next/font/google";
import { GrainOverlay } from "@/components/brand/GrainOverlay";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: ["700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HH Goa 2026 — Frame & Builder ID Generator",
  description:
    "Upload your photo, get a branded HH Goa 2026 X profile frame or Builder ID card in seconds.",
  // Real OG generation comes in Prompt 5 — /og-default.png is a placeholder.
  openGraph: {
    title: "HH Goa 2026 — Frame & Builder ID Generator",
    description:
      "Upload your photo, get a branded HH Goa 2026 X profile frame or Builder ID card in seconds.",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Frame & Builder ID Generator",
    description:
      "Upload your photo, get a branded HH Goa 2026 X profile frame or Builder ID card in seconds.",
    images: ["/og-default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${spaceMono.variable} ${baloo.variable}`}
    >
      <body className="bg-hh-green-700 font-mono text-hh-cream antialiased">
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
