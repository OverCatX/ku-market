"use client";

import Link from "next/link";
import { useState } from "react";
import { signin } from "@/config/auth";
import toast from "react-hot-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
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
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signin({ kuEmail: email, password });
      toast.success(res.message || "Login successful!");
      if (res.token) localStorage.setItem("token", res.token);

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 sm:p-8 p-6">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
        Login to Your Account
      </h2>
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div className="space-y-1">
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
        <div className="space-y-1">
          <label className="block text-gray-600 font-medium text-sm">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {apiError && (
          <p className="text-red-500 text-center text-sm mt-1">{apiError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#69773D] hover:bg-[#5a632d]"
          } text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-150`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link
          href="/signup"
          className="mt-4 w-full border border-[#69773D] text-[#69773D] bg-transparent py-3 rounded-lg flex justify-center items-center shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-150"
        >
          Sign up
        </Link>
      </form>
    </div>
  );
}
