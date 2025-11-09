"use client";

import { useState } from "react";
import Link from "next/link";
import { aboutColors } from "@/components/aboutus/SectionColors";

export default function ForgotPasswordPage() {
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

      if (!res.ok) {
        let detail = "Failed to send reset link.";
        try {
          const data = await res.json();
          if (data?.detail) detail = data.detail;
        } catch {}
        throw new Error(detail);
      }

      setSuccessMsg("We’ve sent a password reset link to your email.");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{ backgroundColor: aboutColors.creamBg }}
      className="min-h-screen w-full"
    >
      {/* HERO */}
      <section className="w-full" style={{ backgroundColor: aboutColors.oliveDark }}>
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <h1
            className="text-2xl md:text-3xl font-bold leading-tight"
            style={{ color: aboutColors.creamSoft }}
          >
            Forgot your password?
          </h1>
          <p
            className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl"
            style={{ color: aboutColors.creamSoft }}
          >
            Enter your KU email and we’ll send a password reset link.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto ml-[125px]">
            <h3
              className="text-lg md:text-xl font-bold mb-6"
              style={{ color: aboutColors.oliveDark }}
            >
              Reset Password
            </h3>

            {/* Alerts */}
            {successMsg && (
              <div
                className="mb-4 rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: "#E6F6E6", color: "#1B5E20" }}
              >
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div
                className="mb-4 rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: "#FEECEC", color: "#7F1D1D" }}
              >
                {errorMsg}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: aboutColors.oliveDark }}
                >
                  KU Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@ku.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: aboutColors.borderSoft,
                    backgroundColor: aboutColors.creamSoft,
                  }}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  We’ll email a secure link to reset your password.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full px-5 py-2 font-semibold text-sm shadow-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: aboutColors.brown, color: aboutColors.creamSoft }}
                >
                  {submitting ? "Sending..." : "Send reset link"}
                </button>

                <Link
                  href="/login"
                  className="text-sm underline"
                  style={{ color: aboutColors.oliveDark }}
                >
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}