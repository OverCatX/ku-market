import type React from "react";
import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import { Header } from "@/components/Navbar";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
      {/* <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}> */}
      <body className="">
        <Header />
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
