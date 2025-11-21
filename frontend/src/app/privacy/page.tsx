"use client";

import Link from "next/link";
import { aboutColors } from "@/components/aboutus/SectionColors";
import { MotionFadeIn } from "@/components/aboutus/MotionFadeIn";
import { Shield, Lock, Eye, FileText, Mail, Calendar } from "lucide-react";

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      className="min-h-screen w-full"
      style={{ backgroundColor: aboutColors.creamBg }}
    >
      {/* Header Section */}
      <section
        className="w-full"
        style={{ backgroundColor: aboutColors.oliveDark }}
      >
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 text-[#F6F2E5]">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-[#F6F2E5]" size={32} />
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ color: aboutColors.creamSoft }}
            >
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-90">
            Your privacy is important to us. This policy explains how we collect,
            use, and protect your personal information on KU Market.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs opacity-75">
            <Calendar size={14} />
            <span>Last updated: {currentDate}</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <MotionFadeIn delay={0.2}>
        <section className="w-full py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg max-w-none space-y-8">
              {/* Introduction */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  KU Market (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                  is committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you use our marketplace platform for Kasetsart
                  University students.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using KU Market, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="text-[#69773D]" size={24} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    2. Information We Collect
                  </h2>
                </div>

                <div className="space-y-3">
                  <h3
                    className="text-xl font-semibold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    2.1 Personal Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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

                  <h3
                    className="text-xl font-semibold mt-4"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    2.2 Transaction Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Order details, purchase history, payment information</li>
                    <li>Delivery addresses and meetup point preferences</li>
                    <li>Communication records with buyers/sellers</li>
                  </ul>

                  <h3
                    className="text-xl font-semibold mt-4"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    2.3 Seller Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Shop name, description, and business information</li>
                    <li>Product listings, images, and descriptions</li>
                    <li>Sales statistics and revenue data</li>
                  </ul>

                  <h3
                    className="text-xl font-semibold mt-4"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    2.4 Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Device information, IP address, browser type</li>
                    <li>Usage data, pages visited, time spent on platform</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="text-[#69773D]" size={24} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    3. How We Use Your Information
                  </h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell your personal information. We may share your
                  information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
                  <li>
                    <strong>With Your Consent:</strong> We may share information
                    with your explicit permission
                  </li>
                </ul>
              </div>

              {/* Data Security */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  5. Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to
                  protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Encrypted password storage using bcrypt</li>
                  <li>Secure HTTPS connections for all data transmission</li>
                  <li>JWT-based authentication for secure sessions</li>
                  <li>Regular security assessments and updates</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the Internet is 100%
                  secure. While we strive to protect your data, we cannot guarantee
                  absolute security.
                </p>
              </div>

              {/* Your Rights */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  6. Your Rights and Choices
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
                  <li>
                    <strong>Data Portability:</strong> Request a copy of your data
                    in a portable format
                  </li>
                </ul>
              </div>

              {/* Cookies */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  7. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Improve user experience</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can control cookies through your browser settings, but this
                  may affect platform functionality.
                </p>
              </div>

              {/* Third-Party Services */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  8. Third-Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our platform integrates with third-party services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    <strong>Google OAuth:</strong> For authentication (subject to
                    Google&apos;s Privacy Policy)
                  </li>
                  <li>
                    <strong>Cloudinary:</strong> For image storage and processing
                  </li>
                  <li>
                    <strong>Email Services:</strong> For sending notifications and
                    OTP codes
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  These services have their own privacy policies. We encourage you
                  to review them.
                </p>
              </div>

              {/* Children's Privacy */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  9. Children&apos;s Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  KU Market is designed for Kasetsart University students. We do
                  not knowingly collect personal information from children under 13
                  years of age. If you believe we have collected such information,
                  please contact us immediately.
                </p>
              </div>

              {/* Changes to Policy */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  10. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new policy on this page
                  and updating the &quot;Last updated&quot; date. You are advised
                  to review this policy periodically.
                </p>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="text-[#69773D]" size={24} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    11. Contact Us
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions or concerns about this Privacy Policy or
                  our data practices, please contact us:
                </p>
                <div
                  className="p-4 rounded-lg border"
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
                    >
                      /report
                    </Link>{" "}
                    to submit inquiries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MotionFadeIn>

      {/* Footer */}
      <footer
        className="text-center text-sm text-slate-500 py-8 border-t"
        style={{ borderColor: aboutColors.borderSoft }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <p>
            KU Market · Privacy Policy · {new Date().getFullYear()}
            <br />
            <Link
              href="/terms"
              className="text-[#69773D] hover:underline mt-2 inline-block"
            >
              View Terms of Service
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

