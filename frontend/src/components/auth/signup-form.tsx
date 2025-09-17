"use client";

import Link from "next/link";
import { useState } from "react";
import { signup } from "@/config/api";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [kuEmail, setkuEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    kuEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = {
      name: "",
      kuEmail: "",
      password: "",
      confirmPassword: "",
    };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kuEmail)) {
      newErrors.kuEmail = "Invalid kuEmail address";
      valid = false;
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await signup({ name, kuEmail, password });
      window.location.href = "/login";
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
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200">
      <form onSubmit={handleSignUp}>
        <div className="space-y-6 pt-6 px-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-gray-600 font-medium text-sm">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* KU Email */}
          <div className="space-y-2">
            <label className="block text-gray-600 font-medium text-sm">
              KU Email
            </label>
            <input
              type="email"
              placeholder="andes_nmezad@ku.th"
              value={kuEmail}
              onChange={(e) => setkuEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
            {errors.kuEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.kuEmail}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-gray-600 font-medium text-sm">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-4 p-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#69773D] hover:bg-[#5a632d]"
            } text-white py-3 px-4 rounded-lg font-medium 
            outline-none shadow-md hover:shadow-lg active:translate-y-1 transition-all duration-150`}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          {apiError && (
            <p className="text-red-500 text-center text-sm">{apiError}</p>
          )}

          <div className="text-center text-sm text-gray-500">
            When you click Submit, you agree to our{" "}
            <Link href="/privacy" className="text-blue-500 hover:underline">
              Privacy Terms
            </Link>
          </div>

          <Link
            href="/login"
            className="w-full border border-[#69773D] text-[#69773D] bg-transparent py-3 rounded-lg 
            font-medium flex justify-center items-center shadow-sm hover:shadow-md hover:bg-green-50 active:translate-y-1 
            transition-all duration-150"
          >
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}
