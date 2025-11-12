"use client";

import { aboutColors } from "@/components/aboutus/SectionColors";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReportItemSuccessModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden" style={{ backgroundColor: "#fff" }}>
        <div className="px-6 py-5" style={{ backgroundColor: aboutColors.creamBg }}>
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: aboutColors.oliveDark }}
          >
            Report submitted
          </h3>
          <p className="text-sm text-slate-700">
            Thanks for helping keep KU Market safe. Our team will review your report
            and take action where needed.
          </p>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2"
             style={{ borderColor: aboutColors.borderSoft }}>
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: aboutColors.brown, color: aboutColors.creamSoft }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}