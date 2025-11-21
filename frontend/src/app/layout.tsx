import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Titan_One, Ubuntu } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";

// Lazy load ConditionalHeader to reduce initial bundle
const ConditionalHeader = dynamic(() => import("@/components/ConditionalHeader").then(mod => ({ default: mod.ConditionalHeader })), {
  ssr: true,
  loading: () => <div className="h-[68px]" />,
});

// Font - Header
const titanOne = Titan_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-titan-one",
});

// Font - Body
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "KuMarket - Online Marketplace for Students",
  description:
    "KuMarket lets you browse products, manage orders, chat with sellers, and shop conveniently online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntu.variable} ${titanOne.variable}`}>
        <CartProvider>
          <ConditionalHeader />
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
