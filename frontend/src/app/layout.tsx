import type React from "react";
import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import { Header } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cargo Account - Login",
  description:
    "Enter your cargo account to access marketplace, chats, and more",
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
      </body>
    </html>
  );
}
