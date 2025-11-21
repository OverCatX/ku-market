"use client";

import { useEffect } from "react";
import {
  X,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aboutColors } from "@/components/aboutus/SectionColors";
import Link from "next/link";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({
  isOpen,
  onClose,
}: TermsOfServiceModalProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: aboutColors.creamBg }}
            >
              {/* Header */}
              <div
                className="flex-shrink-0 px-6 py-4 border-b"
                style={{
                  backgroundColor: aboutColors.oliveDark,
                  borderColor: aboutColors.borderSoft,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale className="text-[#F6F2E5]" size={24} />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: aboutColors.creamSoft }}
                    >
                      Terms of Service
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-black/20 transition-colors"
                    aria-label="Close"
                  >
                    <X className="text-[#F6F2E5]" size={24} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                  <Calendar size={14} />
                  <span>Last updated: {currentDate}</span>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="prose prose-sm max-w-none space-y-6">
                  {/* Introduction */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      1. Acceptance of Terms
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      By accessing or using KU Market, you agree to be bound by these
                      Terms of Service (&quot;Terms&quot;). If you disagree with any
                      part of these terms, you may not access the service.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      KU Market is a marketplace platform exclusively for Kasetsart
                      University students, faculty, and staff.
                    </p>
                  </div>

                  {/* Eligibility */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-[#69773D]" size={20} />
                      <h3
                        className="text-xl font-bold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        2. Eligibility and Account Requirements
                      </h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        You must be a current student, faculty member, or staff of
                        Kasetsart University
                      </li>
                      <li>
                        You must use a valid KU email address (@ku.th for users,
                        @ku.ac.th for admins)
                      </li>
                      <li>
                        You must be at least 18 years old or have parental consent
                      </li>
                      <li>
                        You must complete identity verification before making purchases
                      </li>
                      <li>
                        You are responsible for maintaining the security of your account
                      </li>
                    </ul>
                  </div>

                  {/* User Conduct */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-[#69773D]" size={20} />
                      <h3
                        className="text-xl font-bold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        3. User Conduct and Prohibited Activities
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      You agree NOT to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        Post false, misleading, or fraudulent listings or information
                      </li>
                      <li>
                        Sell prohibited items (weapons, drugs, stolen goods, illegal
                        items, etc.)
                      </li>
                      <li>
                        Engage in any fraudulent, deceptive, or illegal activities
                      </li>
                      <li>Harass, threaten, or abuse other users</li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>
                        Attempt to gain unauthorized access to the platform or other
                        users&apos; accounts
                      </li>
                      <li>
                        Use automated systems (bots, scrapers) to access the platform
                      </li>
                    </ul>
                  </div>

                  {/* Seller Responsibilities */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      4. Seller Responsibilities
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      If you list items for sale, you agree to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        Provide accurate descriptions, prices, and images of items
                      </li>
                      <li>
                        Ensure items are legal, safe, and in the condition described
                      </li>
                      <li>
                        Respond promptly to buyer inquiries and order confirmations
                      </li>
                      <li>Complete transactions in a timely manner</li>
                      <li>
                        Deliver items as described or provide refunds for
                        misrepresented items
                      </li>
                    </ul>
                  </div>

                  {/* Buyer Responsibilities */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      5. Buyer Responsibilities
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      As a buyer, you agree to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        Complete identity verification before checkout
                      </li>
                      <li>
                        Provide accurate delivery information or meetup preferences
                      </li>
                      <li>Make payments promptly after seller confirmation</li>
                      <li>
                        Pick up items at agreed meetup points or receive deliveries
                        as arranged
                      </li>
                      <li>
                        Inspect items upon receipt and report any issues promptly
                      </li>
                    </ul>
                  </div>

                  {/* Transactions */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      6. Transactions and Payments
                    </h3>
                    <div className="space-y-2 ml-4">
                      <h4
                        className="text-lg font-semibold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        6.1 Payment Methods
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>
                          <strong>Cash:</strong> Available only for pickup orders
                        </li>
                        <li>
                          <strong>PromptPay:</strong> QR code payment via banking app
                        </li>
                        <li>
                          <strong>Bank Transfer:</strong> Direct bank transfer
                        </li>
                      </ul>
                      <p className="text-gray-700 leading-relaxed text-sm mt-3">
                        All transactions are between buyers and sellers; KU Market
                        facilitates but does not process payments.
                      </p>
                    </div>
                  </div>

                  {/* Disclaimers */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-[#69773D]" size={20} />
                      <h3
                        className="text-xl font-bold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        7. Disclaimers and Limitation of Liability
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      KU Market is provided &quot;as is&quot; without warranties of any
                      kind. We do not:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        Guarantee the accuracy, completeness, or quality of listings
                      </li>
                      <li>
                        Verify the identity, qualifications, or reliability of users
                        beyond our verification process
                      </li>
                      <li>Endorse or guarantee any products or services listed</li>
                      <li>
                        Process payments or handle financial transactions directly
                      </li>
                      <li>Assume liability for transactions between users</li>
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="text-[#69773D]" size={20} />
                      <h3
                        className="text-xl font-bold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        8. Contact Information
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      If you have questions about these Terms of Service, please contact
                      us:
                    </p>
                    <div
                      className="p-4 rounded-lg border text-sm"
                      style={{
                        backgroundColor: aboutColors.creamSoft,
                        borderColor: aboutColors.borderSoft,
                      }}
                    >
                      <p className="text-gray-700">
                        <strong>KU Market Support</strong>
                        <br />
                        Email: support@ku-market.com
                        <br />
                        Platform: Visit{" "}
                        <Link
                          href="/report"
                          className="text-[#69773D] hover:underline font-semibold"
                          onClick={onClose}
                        >
                          /report
                        </Link>{" "}
                        to submit inquiries
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex-shrink-0 px-6 py-4 border-t flex justify-between items-center"
                style={{ borderColor: aboutColors.borderSoft }}
              >
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} KU Market. All rights reserved.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: aboutColors.oliveDark,
                    color: aboutColors.creamSoft,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

