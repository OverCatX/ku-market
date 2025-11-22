"use client";

import { aboutColors } from "@/components/aboutus/SectionColors";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ReportSuccessModal from "./ReportSuccessModal";
import { submitGeneralReport } from "@/config/reports";

type ReportPayload = {
  category: string;
  details: string;
  contact: string;
};

export default function ReportForm() {
  const [form, setForm] = useState<ReportPayload>({
    category: "",
    details: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // close with ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSuccess(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.category.trim()) {
      toast.error("Please select a category");
      return;
    }

    if (!form.details.trim()) {
      toast.error("Please provide report details");
      return;
    }

    setSubmitting(true);
    try {
      await submitGeneralReport({
        category: form.category,
        details: form.details,
        contact: form.contact,
      });

      setShowSuccess(true);
      setForm({ category: "", details: "", contact: "" });
      toast.success("Report submitted. Our admins will review it shortly.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit report";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="w-full border-t"
      style={{
        backgroundColor: aboutColors.creamBg,
        borderColor: aboutColors.borderSoft,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h2
          className="text-lg md:text-xl font-bold mb-6"
          style={{ color: aboutColors.oliveDark }}
        >
          Report Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1"
              style={{ color: aboutColors.oliveDark }}
            >
              Type of Issue
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#69773D] focus:border-[#69773D] outline-none"
              style={{
                borderColor: aboutColors.lightGreen,
                backgroundColor: aboutColors.creamSoft,
              }}
              required
            >
              <option value="">Select category</option>
              <option value="user">User / Seller behavior</option>
              <option value="item">Inappropriate item</option>
              <option value="bug">Bug / Technical issue</option>
              <option value="other">Other</option>
            </select>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <label
              htmlFor="details"
              className="block text-sm font-medium mb-1"
              style={{ color: aboutColors.oliveDark }}
            >
              Details
            </label>
            <textarea
              id="details"
              rows={5}
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#69773D] focus:border-[#69773D] outline-none"
              style={{
                borderColor: aboutColors.lightGreen,
                backgroundColor: aboutColors.creamSoft,
              }}
              placeholder="Please describe what happened..."
              required
            />
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <label
              htmlFor="contact"
              className="block text-sm font-medium mb-1"
              style={{ color: aboutColors.oliveDark }}
            >
              Your Contact (optional)
            </label>
            <input
              id="contact"
              type="text"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#69773D] focus:border-[#69773D] outline-none"
              style={{
                borderColor: aboutColors.lightGreen,
                backgroundColor: aboutColors.creamSoft,
              }}
              placeholder="e.g. your KU email"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className="px-5 py-2 rounded-full font-semibold text-sm shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5a6530]"
              style={{
                backgroundColor: aboutColors.lightGreen,
                color: aboutColors.creamSoft,
              }}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </motion.button>
          </motion.div>
        </form>
      </div>

      {/* Success Modal */}
      <ReportSuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </section>
  );
}