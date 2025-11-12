"use client";

import { motion, AnimatePresence } from "framer-motion";
import { aboutColors } from "@/components/aboutus/SectionColors";
import { CheckCircle2, X } from "lucide-react";

export default function ReportSuccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Dialog */}
          <motion.div
            className="relative mx-4 w-full max-w-md rounded-2xl shadow-lg overflow-hidden"
            style={{ backgroundColor: aboutColors.creamSoft }}
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: aboutColors.oliveDark }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" color={aboutColors.creamSoft} />
                <h3
                  className="text-sm font-semibold"
                  style={{ color: aboutColors.creamSoft }}
                >
                  Report submitted
                </h3>
              </div>

              <button
                aria-label="Close"
                onClick={onClose}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" color={aboutColors.creamSoft} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-relaxed text-slate-700">
                Thanks for helping keep KU Market safe. Our team will review your report.
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: aboutColors.brown,
                    color: aboutColors.creamSoft,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}