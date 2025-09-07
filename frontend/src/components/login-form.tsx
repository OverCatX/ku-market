"use client";

import type React from "react";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password });
  };

  const handleSignUp = () => {
    // Handle sign up logic here
    console.log("Sign up clicked");
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200">
      <form onSubmit={handleLogin}>
        <div className="space-y-6 pt-6 px-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-gray-600 font-medium text-sm"
            >
              KU Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="andes_nmezad@ku.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-gray-600 font-medium text-sm"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4 p-6">
          <button
            type="submit"
            className="w-full bg-[#69773D] hover:bg-[#69773D] text-white py-3 rounded-lg font-medium transition-colors"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-500">
            When you click Submit, you agree to our{" "}
            <a href="/privacy" className="text-blue-500 hover:underline">
              Privacy Terms
            </a>
          </div>

          <button
            type="button"
            onClick={handleSignUp}
            className="w-full border border-[#69773D] text-[#69773D] hover:bg-green-50 py-3 rounded-lg font-medium transition-colors bg-transparent"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
