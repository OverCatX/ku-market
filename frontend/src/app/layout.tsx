import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Titan_One, Ubuntu } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { ToastSwipeInit } from "@/components/ToastSwipeInit";
import { ToastCloseFix } from "@/components/ToastCloseFix";

// Lazy load ConditionalHeader to reduce initial bundle
const ConditionalHeader = dynamic(
  () =>
    import("@/components/ConditionalHeader").then((mod) => ({
      default: mod.ConditionalHeader,
    })),
  {
    ssr: true,
    loading: () => <div className="h-[68px]" />,
  }
);

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
          <ToastSwipeInit />
          <ToastCloseFix />
          <Toaster
            position="top-right"
            containerStyle={{
              top: '20px',
              right: '16px',
            }}
            containerClassName="toast-container"
            limit={3}
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 2000,
              closeButton: true,
              // Ensure auto-dismiss works
              ariaProps: {
                role: 'status',
                'aria-live': 'polite',
              },
              style: {
                background: '#F6F2E5',
                color: '#4A5130',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(105, 119, 61, 0.15)',
                maxWidth: '420px',
                fontFamily: 'var(--font-ubuntu), sans-serif',
                willChange: 'transform, opacity',
              },
              success: {
                iconTheme: {
                  primary: '#69773D',
                  secondary: '#F6F2E5',
                },
                style: {
                  background: 'linear-gradient(135deg, #F6F2E5 0%, #ffffff 100%)',
                  border: '1px solid rgba(105, 119, 61, 0.25)',
                  boxShadow: '0 10px 25px -5px rgba(105, 119, 61, 0.15), 0 8px 10px -6px rgba(105, 119, 61, 0.1)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#780606',
                  secondary: '#F6F2E5',
                },
                style: {
                  background: 'linear-gradient(135deg, #F6F2E5 0%, #fff5f5 100%)',
                  border: '1px solid rgba(120, 6, 6, 0.25)',
                  boxShadow: '0 10px 25px -5px rgba(120, 6, 6, 0.15), 0 8px 10px -6px rgba(120, 6, 6, 0.1)',
                },
              },
              loading: {
                icon: false,
                style: {
                  background: 'linear-gradient(135deg, #F6F2E5 0%, #ffffff 100%)',
                  border: '1px solid rgba(105, 119, 61, 0.25)',
                },
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
