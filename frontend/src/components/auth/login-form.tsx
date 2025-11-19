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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@(ku\.th|ku\.ac\.th)$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Email must be a valid @ku.th or @ku.ac.th email address";
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
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 sm:p-8 p-6 transform transition-all duration-300 hover:shadow-xl">
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-semibold text-gray-700 mb-2 animate-fade-in"
          style={{ color: aboutColors.oliveDark }}
        >
          Login to Your Account
        </h2>
        <div className="w-16 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${aboutColors.oliveDark}, #a8c090)` }}></div>
      </div>

      {redirectTo !== "/" && (
        <div
          className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in"
          style={{ backgroundColor: aboutColors.creamSoft }}
        >
          <p
            className="text-sm text-blue-800 text-center flex items-center justify-center"
            style={{ color: aboutColors.oliveDark }}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Please login to continue to checkout
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5 animate-slide-up">
        {/* Email */}
        <div className="space-y-1">
          <label
            className="block text-gray-600 font-medium text-sm transition-colors duration-200"
            style={{ color: aboutColors.oliveDark }}
          >
            KU Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="andes_nmezad@ku.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ease-out focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none ${
                focusedField === "email"
                  ? "border-[#69773D] shadow-sm"
                  : "border-gray-300 hover:border-gray-400"
              } ${errors.email ? "border-red-400" : ""}`}
              required
            />
            {focusedField === "email" && (
              <div
                className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  background: `linear-gradient(90deg, ${aboutColors.oliveDark}, #a8c090)`,
                  width: "100%"
                }}
              />
            )}
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 flex items-center animate-fade-in">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            className="block text-gray-600 font-medium text-sm transition-colors duration-200"
            style={{ color: aboutColors.oliveDark }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200 ease-out focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none ${
                focusedField === "password"
                  ? "border-[#69773D] shadow-sm"
                  : "border-gray-300 hover:border-gray-400"
              } ${errors.password ? "border-red-400" : ""}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200 active:scale-95"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {focusedField === "password" && (
              <div
                className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  background: `linear-gradient(90deg, ${aboutColors.oliveDark}, #a8c090)`,
                  width: "100%"
                }}
              />
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 flex items-center animate-fade-in">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end animate-fade-in">
          <Link
            href="/forgot-password"
            className="text-sm font-medium hover:underline transition-all duration-200 ease-out inline-flex items-center group"
            style={{ color: aboutColors.oliveDark }}
          >
            <span>Forgot password?</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform duration-200 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
            <p className="text-red-600 text-center text-sm flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full relative overflow-hidden ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#69773D] hover:bg-[#5a6630] active:scale-[0.98]"
          } text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 ease-out`}
        >
          <span className={`relative z-10 flex items-center justify-center ${loading ? "opacity-70" : ""}`}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              <>
                Login
                <svg className="ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#69773D] to-[#5a6630] opacity-0 hover:opacity-100 transition-opacity duration-200 ease-out"></div>
          )}
        </button>

        <Link
          href="/signup"
          className="mt-2 w-full bg-transparent py-3 rounded-lg flex justify-center items-center shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-200 ease-out group"
          style={{
            color: aboutColors.oliveDark,
            border: `1px solid ${aboutColors.oliveDark}`,
          }}
        >
          <span>Don&apos;t have an account?</span>
          <span className="ml-2 font-semibold group-hover:translate-x-0.5 transition-transform duration-200 ease-out">Sign up</span>
          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-0.5 transition-transform duration-200 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </form>
    </div>
  );
}
