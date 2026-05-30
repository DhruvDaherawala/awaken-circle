import React from "react";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

// Configure Plus Jakarta Sans for clean modern sans-serif
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

// Configure Playfair Display for lifestyle editorial serif
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Awaken Circle | Premium Lifestyle, Running & Wellness Community in Surat",
  description: "Surat's premier modern lifestyle community. Connecting individuals through morning runs, wellness experiences, sound baths, yoga sessions, creative workshops, and social gatherings.",
  keywords: ["Awaken Circle", "Surat community", "running Surat", "wellness Surat", "workshops Surat", "social gatherings Surat", "yoga Surat", "lifestyle Surat"],
  authors: [{ name: "Awaken Circle" }],
  openGraph: {
    title: "Awaken Circle | Premium Community & Wellness in Surat",
    description: "Curating Surat's finest running meets, mindfulness, yoga, cultural workshops, and premium social experiences.",
    url: "https://awakencircle.com",
    siteName: "Awaken Circle",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awaken Circle | Premium Community in Surat",
    description: "Connecting individuals through active runs, wellness experiences, creative workshops, and fitness meetups.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} scroll-smooth`}>
      <body className="bg-cream text-warm-black min-h-screen flex flex-col antialiased">
        <Navbar />
        {/* Main Content Area - LayoutWrapper conditionally handles padding */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Footer />
      </body>
    </html>
  );
}
