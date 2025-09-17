"use client";

import Link from "next/link";
import { useState } from "react";
import { signin } from "@/config/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signin({ kuEmail: email, password });
      setSuccess(res.message || "Login successful!");

      if (res.token) localStorage.setItem("token", res.token);
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg border border-gray-200">
      <form onSubmit={handleLogin}>
        <div className="space-y-6 pt-6 px-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-gray-600 font-medium text-sm">
              KU Email
            </label>
            <input
              type="email"
              placeholder="andes_nmezad@ku.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-gray-600 font-medium text-sm">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* API Error */}
          {apiError && <p className="text-red-500 text-sm mt-1">{apiError}</p>}
          {success && <p className="text-green-600 text-sm mt-1">{success}</p>}
        </div>

        <div className="flex flex-col space-y-4 p-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#69773D] hover:bg-[#5a632d] text-white py-3 px-4 rounded-lg font-medium 
            outline-none shadow-md hover:shadow-lg active:translate-y-1 transition-all duration-150 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-sm text-gray-500">
            When you click Submit, you agree to our{" "}
            <Link href="/privacy" className="text-blue-500 hover:underline">
              Privacy Terms
            </Link>
          </div>

          <Link
            href="/signup"
            className="w-full border border-[#69773D] text-[#69773D] bg-transparent py-3 rounded-lg 
            font-medium flex justify-center items-center shadow-sm hover:shadow-md hover:bg-green-50 active:translate-y-1 
            transition-all duration-150"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
