"use client";

import { SignUpForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
          {/* Left side - Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-[#69773D] leading-tight">
              Enter the requested data to enter your cargo account
            </h1>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <SignUpForm />
          </div>
        </div>
      </main>
    </div>
  );
}
