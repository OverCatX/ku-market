"use client";

import { useEffect } from "react";
import { X, Shield, Lock, Eye, Mail, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aboutColors } from "@/components/aboutus/SectionColors";
import Link from "next/link";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
}: PrivacyPolicyModalProps) {
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
                    <Shield className="text-[#F6F2E5]" size={24} />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: aboutColors.creamSoft }}
                    >
                      Privacy Policy
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
                      1. Introduction
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      KU Market (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                      is committed to protecting your privacy. This Privacy Policy
                      explains how we collect, use, disclose, and safeguard your
                      information when you use our marketplace platform for Kasetsart
                      University students.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      By using KU Market, you agree to the collection and use of
                      information in accordance with this policy.
                    </p>
                  </div>

                  {/* Information We Collect */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="text-[#69773D]" size={20} />
                      <h3
                        className="text-xl font-bold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        2. Information We Collect
                      </h3>
                    </div>
                    <div className="space-y-2 ml-6">
                      <h4
                        className="text-lg font-semibold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        2.1 Personal Information
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>
                          <strong>Account Information:</strong> Name, KU email address
                          (@ku.th), password (hashed), faculty, phone number
                        </li>
                        <li>
                          <strong>Identity Verification:</strong> Student ID or
                          National ID documents (for verification purposes)
                        </li>
                        <li>
                          <strong>Profile Information:</strong> Profile picture,
                          additional contact information
                        </li>
                      </ul>

                      <h4
                        className="text-lg font-semibold mt-3"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        2.2 Transaction Information
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Order details, purchase history, payment information</li>
                        <li>Delivery addresses and meetup point preferences</li>
                        <li>Communication records with buyers/sellers</li>
                      </ul>

                      <h4
                        className="text-lg font-semibold mt-3"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        2.3 Automatically Collected Information
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Device information, IP address, browser type</li>
                        <li>Usage data, pages visited, time spent on platform</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>

                  {/* How We Use Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="text-[#69773D]" size={20} />
                      <h3
                        className="text-xl font-bold"
                        style={{ color: aboutColors.oliveDark }}
                      >
                        3. How We Use Your Information
                      </h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>To provide and maintain our marketplace services</li>
                      <li>To process transactions and facilitate payments</li>
                      <li>To verify user identity and prevent fraud</li>
                      <li>To communicate with you about orders, updates, and support</li>
                      <li>To improve our platform and user experience</li>
                      <li>To send important notifications and announcements</li>
                      <li>To enforce our Terms of Service and policies</li>
                      <li>To comply with legal obligations</li>
                    </ul>
                  </div>

                  {/* Information Sharing */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      4. Information Sharing and Disclosure
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      We do not sell your personal information. We may share your
                      information only in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        <strong>With Other Users:</strong> Basic profile information
                        (name, profile picture) is visible to other users when you
                        interact on the platform
                      </li>
                      <li>
                        <strong>For Transactions:</strong> Order details and contact
                        information are shared between buyers and sellers to complete
                        transactions
                      </li>
                      <li>
                        <strong>Service Providers:</strong> We may share data with
                        trusted third-party services (e.g., Cloudinary for image
                        storage, email services) that help us operate the platform
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> We may disclose
                        information if required by law or to protect our rights and
                        safety
                      </li>
                    </ul>
                  </div>

                  {/* Data Security */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      5. Data Security
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      We implement appropriate technical and organizational measures to
                      protect your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>Encrypted password storage using bcrypt</li>
                      <li>Secure HTTPS connections for all data transmission</li>
                      <li>JWT-based authentication for secure sessions</li>
                      <li>Regular security assessments and updates</li>
                      <li>Limited access to personal data on a need-to-know basis</li>
                    </ul>
                  </div>

                  {/* Your Rights */}
                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: aboutColors.oliveDark }}
                    >
                      6. Your Rights and Choices
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      You have the following rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                      <li>
                        <strong>Access:</strong> Request access to your personal data
                      </li>
                      <li>
                        <strong>Correction:</strong> Update or correct your information
                        through your profile settings
                      </li>
                      <li>
                        <strong>Deletion:</strong> Request deletion of your account and
                        associated data
                      </li>
                      <li>
                        <strong>Opt-out:</strong> Unsubscribe from non-essential
                        communications
                      </li>
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
                        7. Contact Us
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      If you have questions or concerns about this Privacy Policy or
                      our data practices, please contact us:
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

