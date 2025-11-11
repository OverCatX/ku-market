"use client";

import { useState } from "react";
import Link from "next/link";
import { aboutColors } from "@/components/aboutus/SectionColors";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send reset link.");
      setSuccessMsg("We’ve sent a password reset link to your email.");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
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
            <p className="mt-2 text-[13px] text-slate-500">
              We’ll email a secure link to reset your password.
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