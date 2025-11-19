"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { aboutColors } from "@/components/aboutus/SectionColors";
import { API_BASE } from "@/config/constants";
import { getAuthToken, getAuthUser } from "@/lib/auth";
import Modal from "@/components/ui/Modal";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-fill email from user if not provided
  useEffect(() => {
    if (!email) {
      const user = getAuthUser();
      if (user && (user.email || user.kuEmail)) {
        router.replace(`/verify-otp?email=${encodeURIComponent(user.email || user.kuEmail)}`);
      }
    }
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMsg(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      setErrorMsg(null);
      // Focus last input
      document.getElementById(`otp-5`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP");
      return;
    }

    if (!email) {
      setErrorMsg("Email is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      // OTP verified successfully, redirect to reset password with token
      const resetToken = data.resetToken;
      router.push(`/reset-password?token=${resetToken}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !canResend) return;

    try {
      setResending(true);
      setErrorMsg(null);

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      document.getElementById("otp-0")?.focus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      setErrorMsg(message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: aboutColors.creamBg }}>
        <div className="text-center">
          <p className="text-red-600">Email is required</p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="mt-4 text-blue-600 underline"
          >
            Go back to forgot password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: aboutColors.creamBg }}>
      <div
        style={{
          backgroundColor: aboutColors.creamSoft,
          border: `1px solid ${aboutColors.oliveDark}`,
          maxWidth: "500px",
          width: "100%",
        }}
        className="mx-4"
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ backgroundColor: aboutColors.oliveDark }}>
          <h2 className="text-xl font-bold" style={{ color: aboutColors.creamSoft }}>
            Verify OTP
          </h2>
          <p className="text-sm mt-1" style={{ color: aboutColors.creamSoft, opacity: 0.9 }}>
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {errorMsg && (
            <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: "#FEECEC", color: "#7F1D1D" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: aboutColors.oliveDark }}>
                Enter OTP
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-md border-2 focus:border-[#69773D] focus:ring-2 focus:ring-[#69773D] outline-none"
                    style={{
                      borderColor: aboutColors.borderSoft,
                      backgroundColor: aboutColors.creamBg,
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-sm text-gray-600">
                {timeLeft > 0 ? (
                  <>OTP expires in <strong>{timeLeft}</strong> seconds</>
                ) : (
                  <span className="text-red-600">OTP has expired</span>
                )}
              </p>
            </div>

            {/* Resend OTP */}
            {canResend && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-sm underline"
                  style={{ color: aboutColors.oliveDark }}
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={submitting || otp.join("").length !== 6}
                className="rounded-full px-5 py-2 text-sm font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#69773D", color: aboutColors.creamSoft }}
              >
                {submitting ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm underline"
                style={{ color: aboutColors.oliveDark }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

