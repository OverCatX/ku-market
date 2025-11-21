"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { aboutColors } from "@/components/aboutus/SectionColors";
import { API_BASE } from "@/config/constants";
import { getAuthUser } from "@/lib/auth";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load user email on mount (optional - only if logged in)
  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      const userEmailValue = (user as { email?: string; kuEmail?: string }).email || (user as { email?: string; kuEmail?: string }).kuEmail;
      if (userEmailValue) {
        setUserEmail(userEmailValue);
        setEmail(userEmailValue); // Auto-fill with user's email
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your KU email.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link.");
      }
      
      setSuccessMsg(data.message || "OTP has been sent to your email. Please check your inbox.");
      // Redirect to verify OTP page
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: aboutColors.creamSoft,
        border: `1px solid ${aboutColors.oliveDark}`,
      }}
    >
      {/* Header */}
      <div className="px-6 py-5" style={{ backgroundColor: aboutColors.oliveDark }}>
        <h2 className="text-xl font-bold" style={{ color: aboutColors.creamSoft }}>
          Forgot your password ?
        </h2>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        {successMsg && (
          <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: "#E6F6E6", color: "#1B5E20" }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: "#FEECEC", color: "#7F1D1D" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: aboutColors.oliveDark }}>
              KU Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ku.th"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#69773D] focus:border-transparent"
              style={{
                backgroundColor: aboutColors.creamBg,
              }}
            />
            {userEmail && (
              <p className="mt-1 text-[12px] text-gray-600">
                Your account email: <span className="font-medium">{userEmail}</span>
              </p>
            )}
            <p className="mt-2 text-[13px] text-slate-500">
              We&apos;ll email a secure link to reset your password. Please enter your account email address.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full px-5 py-2 text-sm font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#69773D", color: aboutColors.creamSoft }}
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>

            <Link href="/login" className="text-sm underline" style={{ color: aboutColors.oliveDark }}>
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}