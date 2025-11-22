"use client";

import Link from "next/link";
import { aboutColors } from "@/components/aboutus/SectionColors";
import { MotionFadeIn } from "@/components/aboutus/MotionFadeIn";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Mail,
  Calendar,
} from "lucide-react";

export default function TermsOfServicePage() {
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
            <Scale className="text-[#F6F2E5]" size={32} />
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ color: aboutColors.creamSoft }}
            >
              Terms of Service
            </h1>
          </div>
          <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-90">
            Please read these terms carefully before using KU Market. By using our
            platform, you agree to be bound by these terms.
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using KU Market, you agree to be bound by these
                  Terms of Service (&quot;Terms&quot;). If you disagree with any
                  part of these terms, you may not access the service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  KU Market is a marketplace platform exclusively for Kasetsart
                  University students, faculty, and staff.
                </p>
              </div>

              {/* Eligibility */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-[#69773D]" size={24} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    2. Eligibility and Account Requirements
                  </h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
                  <li>
                    You must provide accurate and complete information when
                    creating an account
                  </li>
                </ul>
              </div>

              {/* User Conduct */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-[#69773D]" size={24} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    3. User Conduct and Prohibited Activities
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  You agree NOT to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
                  <li>
                    Harass, threaten, or abuse other users
                  </li>
                  <li>
                    Violate any applicable laws or regulations
                  </li>
                  <li>
                    Attempt to gain unauthorized access to the platform or other
                    users&apos; accounts
                  </li>
                  <li>
                    Use automated systems (bots, scrapers) to access the platform
                  </li>
                  <li>
                    Interfere with or disrupt the platform&apos;s operation
                  </li>
                  <li>
                    Impersonate any person or entity
                  </li>
                  <li>
                    Collect or store personal data about other users without
                    permission
                  </li>
                </ul>
              </div>

              {/* Seller Responsibilities */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  4. Seller Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you list items for sale, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    Provide accurate descriptions, prices, and images of items
                  </li>
                  <li>
                    Ensure items are legal, safe, and in the condition described
                  </li>
                  <li>
                    Respond promptly to buyer inquiries and order confirmations
                  </li>
                  <li>
                    Complete transactions in a timely manner
                  </li>
                  <li>
                    Deliver items as described or provide refunds for
                    misrepresented items
                  </li>
                  <li>
                    Comply with all applicable laws regarding sales and taxes
                  </li>
                  <li>
                    Maintain appropriate inventory levels and update availability
                  </li>
                </ul>
              </div>

              {/* Buyer Responsibilities */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  5. Buyer Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  As a buyer, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    Complete identity verification before checkout
                  </li>
                  <li>
                    Provide accurate delivery information or meetup preferences
                  </li>
                  <li>
                    Make payments promptly after seller confirmation
                  </li>
                  <li>
                    Pick up items at agreed meetup points or receive deliveries
                    as arranged
                  </li>
                  <li>
                    Inspect items upon receipt and report any issues promptly
                  </li>
                  <li>
                    Complete the order confirmation process (click &quot;I received
                    the product&quot; for pickup orders)
                  </li>
                  <li>
                    Communicate respectfully with sellers
                  </li>
                </ul>
              </div>

              {/* Transactions */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  6. Transactions and Payments
                </h2>
                <div className="space-y-3">
                  <h3
                    className="text-xl font-semibold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    6.1 Payment Methods
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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

                  <h3
                    className="text-xl font-semibold mt-4"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    6.2 Transaction Process
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      Orders are subject to seller approval
                    </li>
                    <li>
                      Payment is required after seller confirmation (for
                      PromptPay/Transfer)
                    </li>
                    <li>
                      All transactions are between buyers and sellers; KU Market
                      facilitates but does not process payments
                    </li>
                    <li>
                      Disputes should be resolved directly between parties
                    </li>
                  </ul>

                  <h3
                    className="text-xl font-semibold mt-4"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    6.3 Refunds and Returns
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Refund and return policies are determined by individual sellers.
                    Buyers should review seller policies before purchasing. KU
                    Market is not responsible for refund disputes but may assist in
                    resolution.
                  </p>
                </div>
              </div>

              {/* Intellectual Property */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  7. Intellectual Property
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    KU Market platform, design, and code are owned by KU Market
                  </li>
                  <li>
                    You retain ownership of content you post (listings, images,
                    reviews)
                  </li>
                  <li>
                    By posting content, you grant KU Market a license to display,
                    distribute, and use your content on the platform
                  </li>
                  <li>
                    You may not use KU Market&apos;s trademarks or branding without
                    permission
                  </li>
                  <li>
                    You may not copy, modify, or create derivative works of the
                    platform
                  </li>
                </ul>
              </div>

              {/* Disclaimers */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="text-[#69773D]" size={24} />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: aboutColors.oliveDark }}
                  >
                    8. Disclaimers and Limitation of Liability
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  KU Market is provided &quot;as is&quot; without warranties of any
                  kind. We do not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    Guarantee the accuracy, completeness, or quality of listings
                  </li>
                  <li>
                    Verify the identity, qualifications, or reliability of users
                    beyond our verification process
                  </li>
                  <li>
                    Endorse or guarantee any products or services listed
                  </li>
                  <li>
                    Process payments or handle financial transactions directly
                  </li>
                  <li>
                    Assume liability for transactions between users
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, KU Market shall not be
                  liable for any indirect, incidental, special, or consequential
                  damages arising from your use of the platform.
                </p>
              </div>

              {/* Account Termination */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  9. Account Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account if you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    Violate these Terms of Service
                  </li>
                  <li>
                    Engage in fraudulent or illegal activities
                  </li>
                  <li>
                    Provide false or misleading information
                  </li>
                  <li>
                    Harass or harm other users
                  </li>
                  <li>
                    Fail to comply with platform policies
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You may delete your account at any time through your profile
                  settings. Upon termination, your right to use the platform
                  immediately ceases.
                </p>
              </div>

              {/* Dispute Resolution */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  10. Dispute Resolution
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  For disputes between users:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    First, attempt to resolve directly with the other party
                  </li>
                  <li>
                    Use the platform&apos;s reporting system for serious issues
                  </li>
                  <li>
                    Contact KU Market support for assistance
                  </li>
                  <li>
                    For legal disputes, these Terms are governed by Thai law
                  </li>
                </ul>
              </div>

              {/* Changes to Terms */}
              <div className="space-y-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: aboutColors.oliveDark }}
                >
                  11. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will
                  notify users of significant changes by posting the updated Terms
                  on this page and updating the &quot;Last updated&quot; date. Your
                  continued use of the platform after changes constitutes acceptance
                  of the new Terms.
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
                    12. Contact Information
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about these Terms of Service, please contact
                  us:
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
            KU Market · Terms of Service · {new Date().getFullYear()}
            <br />
            <Link
              href="/privacy"
              className="text-[#69773D] hover:underline mt-2 inline-block"
            >
              View Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

