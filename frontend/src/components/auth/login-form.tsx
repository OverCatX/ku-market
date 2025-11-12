"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/config/auth";
import { clearAuthTokens, setAuthToken } from "@/lib/auth";
import toast from "react-hot-toast";
import { aboutColors } from "@/components/aboutus/SectionColors";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

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
      const res = await login(email, password);

      // Ensure previous credentials are cleared before storing new ones
      clearAuthTokens();
      setAuthToken(res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Login successful!");

      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (err) {
      let message = "Something went wrong";

      if (err instanceof Error) {
        // Provide user-friendly messages
        if (
          err.message.includes("Email is not found") ||
          err.message.includes("not found")
        ) {
          message = "❌ Email not found. Please check your email or sign up.";
        } else if (
          err.message.includes("Invalid credentials") ||
          err.message.includes("password")
        ) {
          message = "🔒 Incorrect password. Please try again.";
        } else if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("Network")
        ) {
          message = "🌐 Network error. Please check your connection.";
        } else {
          message = err.message;
        }
      }

      setApiError(message);
      toast.error(message, {
        duration: 4000,
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 sm:p-8 p-6">
      <h2
        className="text-2xl font-semibold text-center text-gray-700 mb-6"
        style={{ color: aboutColors.oliveDark }}
      >
        Login to Your Account
      </h2>

      {redirectTo !== "/" && (
        <div
          className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          style={{ backgroundColor: aboutColors.creamSoft }}
        >
          <p
            className="text-sm text-blue-800 text-center"
            style={{ color: aboutColors.oliveDark }}
          >
            Please login to continue to checkout
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div className="space-y-1">
          <label
            className="block text-gray-600 font-medium text-sm"
            style={{ color: aboutColors.oliveDark }}
          >
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
          <label
            className="block text-gray-600 font-medium text-sm"
            style={{ color: aboutColors.oliveDark }}
          >
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

        {/* Forgot password link */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm underline"
            style={{ color: aboutColors.oliveDark }}
          >
            Forgot password?
          </Link>
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
          style={{ color: aboutColors.creamSoft }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link
          href="/signup"
          className="mt-2 w-full border border-[aboutColors.oliveDark] text-[aboutColors.oliveDark] bg-transparent py-3 rounded-lg flex justify-center items-center shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-150"
          style={{
            color: aboutColors.oliveDark,
            border: `1px solid ${aboutColors.oliveDark}`,
          }}
        >
          Sign up
        </Link>
      </form>
    </div>
  );
}
