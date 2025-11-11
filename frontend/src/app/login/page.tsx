"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { aboutColors } from "@/components/aboutus/SectionColors";


export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (token) router.replace("/");
  }, [router]);

  return (
    <div 
    className="min-h-screen bg-gray-50 flex items-center"
    style={{ backgroundColor: "#F6F2E5" }}
    >
      <main className="container mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left side - Heading */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#69773D] leading-snug">
              Welcome Back to KU Market
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg" style={{ color: aboutColors.oliveDark }}>
              Log in to your KU Market account to manage your products, track
              orders, and connect with buyers seamlessly.
            </p>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
