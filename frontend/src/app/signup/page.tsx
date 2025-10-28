"use client";

import { SignUpForm } from "@/components/auth/signup-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (token) router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <main className="container mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left side - Heading */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#69773D] leading-snug">
              Join KU Market Today
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Create your account to access the KU Market platform. List
              products, manage orders, and connect with buyers all in one place.
            </p>
          </div>

          {/* Right side - SignUp Form */}
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <SignUpForm />
          </div>
        </div>
      </main>
    </div>
  );
}
