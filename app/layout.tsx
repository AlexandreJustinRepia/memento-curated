import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mementocurated.com"),
  title: {
    default: "Memento Curated | Luxury Jewelry",
    template: "%s | Memento Curated",
  },
  description:
    "Discover timeless luxury jewelry and explore the Memento Curated storefront with a polished admin experience.",
  keywords: [
    "luxury jewelry",
    "fine jewelry",
    "Memento Curated",
    "admin dashboard",
    "jewelry storefront",
  ],
  authors: [{ name: "Memento Curated" }],
  creator: "Memento Curated",
  publisher: "Memento Curated",
  applicationName: "Memento Curated",
  category: "fashion",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Memento Curated | Luxury Jewelry",
    description:
      "Discover timeless luxury jewelry and explore a polished admin experience for the Memento Curated brand.",
    url: "/",
    siteName: "Memento Curated",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Memento Curated luxury jewelry brand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memento Curated | Luxury Jewelry",
    description:
      "Discover timeless luxury jewelry and explore a polished admin experience for the Memento Curated brand.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/tab_icon.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
