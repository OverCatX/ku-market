"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { aboutColors } from "@/components/aboutus/SectionColors";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  token?: string | null;
};

export default function ResetPasswordModal({ open, onClose, token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit =
    password.length >= 8 &&
    password === confirm &&
    !!token &&
    !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Reset failed");
      }

      setDone(true);
      setTimeout(() => {
        onClose();
        router.push("/login");
      }, 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <div
        className="px-6 md:px-7 py-5 rounded-t-2xl"
        style={{ backgroundColor: aboutColors.oliveDark, color: aboutColors.creamSoft }}
      >
        <h2 className="text-2xl md:text-2xl font-bold leading-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-sm md:text-base opacity-90">
          Set a new password for your KU Market account.
        </p>
      </div>

      {/* Body */}
      <div
        className="px-6 md:px-7 py-6 rounded-b-2xl"
        style={{ backgroundColor: aboutColors.creamBg }}
      >
        {done ? (
          <p className="text-green-700 font-medium">Password updated! Redirecting…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: aboutColors.oliveDark }}>
                New password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none pr-12"
                  style={{ borderColor: aboutColors.borderSoft, backgroundColor: aboutColors.creamSoft }}
                  placeholder="At least 8 characters"
                  required
                />
                <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline"
                    style={{ color: aboutColors.oliveDark }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Use 8+ characters. A mix of letters and numbers is recommended.
              </p>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: aboutColors.oliveDark }}>
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none pr-12"
                  style={{ borderColor: aboutColors.borderSoft, backgroundColor: aboutColors.creamSoft }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline"
                  style={{ color: aboutColors.oliveDark }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="mt-2 text-[12px] text-red-600">Passwords do not match.</p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="pt-1 flex items-center gap-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full px-5 py-2 font-semibold text-sm shadow-sm disabled:opacity-60"
                style={{ backgroundColor: aboutColors.brown, color: aboutColors.creamSoft }}
              >
                {submitting ? "Saving…" : "Update password"}
              </button>

            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}