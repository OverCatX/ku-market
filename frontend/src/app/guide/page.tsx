"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShoppingBag,
  User,
  Store,
  Shield,
  CheckCircle,
  Package,
  CreditCard,
  MapPin,
  ArrowRight,
  X,
  Sparkles,
  Clock,
  Truck,
  Printer,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const buyerSteps: Step[] = [
  {
    icon: User,
    title: "1. Create Account",
    description: "Sign up with your KU email (@ku.th) or login with Google",
  },
  {
    icon: Shield,
    title: "2. Verify Identity",
    description:
      "Upload your student ID or national ID for verification (required before checkout)",
  },
  {
    icon: ShoppingBag,
    title: "3. Browse Products",
    description: "Search and select items you want in the Marketplace",
  },
  {
    icon: Package,
    title: "4. Add to Cart",
    description: "Click 'Add to Cart' and review items in your cart",
  },
  {
    icon: CreditCard,
    title: "5. Checkout",
    description:
      "Choose delivery method (Pickup/Delivery) and payment method (Cash/PromptPay/Transfer)",
  },
  {
    icon: CheckCircle,
    title: "6. Track Orders",
    description: "TRACK_ORDERS_SPECIAL", // Special marker for custom rendering
  },
];

const sellerSteps: Step[] = [
  {
    icon: Shield,
    title: "1. Verify Identity",
    description:
      "Complete identity verification before applying to become a Seller",
  },
  {
    icon: Store,
    title: "2. Become a Seller",
    description: "Fill in shop information and wait for Admin approval",
  },
  {
    icon: Package,
    title: "3. Add Products",
    description: "Add products with details, prices, and images",
  },
  {
    icon: ShoppingBag,
    title: "4. Manage Orders",
    description: "Review and approve orders from customers",
  },
  {
    icon: MapPin,
    title: "5. Deliver Products",
    description: "DELIVER_PRODUCTS_SPECIAL", // Special marker for custom rendering
  },
  {
    icon: CheckCircle,
    title: "6. Track Revenue",
    description: "Monitor earnings and completed orders",
  },
];

function DeliverProductsDescription() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-5 text-gray-600">
      {/* Intro */}
      <p className="leading-relaxed text-base">
        After confirming orders, you need to deliver products based on the
        delivery method chosen by the buyer.
      </p>

      {/* Pickup Orders */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
          <MapPin className="text-[#69773D]" size={16} />
          Pickup Orders
        </h4>
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="p-4 rounded-lg bg-gradient-to-br from-[#69773D]/5 via-[#84B067]/5 to-[#69773D]/5 border border-[#69773D]/20 hover:border-[#69773D]/40 hover:shadow-md transition-all"
        >
          <ol className="space-y-2 pl-1 text-sm text-gray-700">
            <li className="flex items-start gap-2.5">
              <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                1.
              </span>
              <span>
                After buyer confirms receipt by clicking{" "}
                <span className="font-semibold text-[#69773D] bg-[#69773D]/10 px-1.5 py-0.5 rounded">
                  &quot;I received the product&quot;
                </span>
                , you&apos;ll see a notification.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                2.
              </span>
              <span>
                Go to the order details and click{" "}
                <span className="font-semibold text-[#69773D] bg-[#69773D]/10 px-1.5 py-0.5 rounded">
                  &quot;Mark as delivered&quot;
                </span>{" "}
                to complete the order.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                3.
              </span>
              <span>
                The order will be marked as{" "}
                <span className="font-semibold text-[#69773D]">completed</span>{" "}
                when both parties have confirmed.
              </span>
            </li>
          </ol>
        </motion.div>
      </div>

      {/* Delivery Orders */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
          <Truck className="text-amber-700" size={16} />
          Delivery Orders
        </h4>
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="p-4 rounded-lg bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 border border-amber-200/60 hover:border-amber-300/80 hover:shadow-md transition-all"
        >
          <ol className="space-y-2 pl-1 text-sm text-amber-900/80">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                1.
              </span>
              <span>
                For delivery orders, go to{" "}
                <span className="font-semibold text-amber-800">
                  &quot;/seller/orders&quot;
                </span>{" "}
                and find the confirmed order.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                2.
              </span>
              <span>
                Click the{" "}
                <span className="font-semibold text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                  <Printer size={14} />
                  &quot;Print Delivery Slip&quot;
                </span>{" "}
                button next to the order.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                3.
              </span>
              <span>
                On the delivery slip page, ensure your{" "}
                <span className="font-semibold text-amber-800">
                  sender address
                </span>{" "}
                is complete (address, city, postal code). Add it if missing.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                4.
              </span>
              <span>
                Click the{" "}
                <span className="font-semibold text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded">
                  &quot;Print&quot;
                </span>{" "}
                button to print the delivery slip.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                5.
              </span>
              <span>
                Attach the printed slip to your package and ship it to the
                buyer&apos;s address shown on the slip.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                6.
              </span>
              <span>
                The order will be marked as{" "}
                <span className="font-semibold text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded">
                  completed
                </span>{" "}
                automatically after delivery confirmation.
              </span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}

function TrackOrdersDescription() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-5 text-gray-600">
      {/* Intro */}
      <p className="leading-relaxed text-base">
        Visit{" "}
        <Link
          href="/orders"
          className="font-semibold text-[#69773D] hover:text-[#84B067] transition-colors underline decoration-2 underline-offset-2"
        >
          /orders
        </Link>{" "}
        to view and track your orders.
      </p>

      {/* Order Status Flow - Compact Cards */}
      <div className="space-y-2.5">
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
          <ArrowRight className="text-[#69773D]" size={14} />
          Status Flow
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-yellow-50/80 border border-yellow-200/60 hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-sm transition-all group"
          >
            <Clock
              className="text-yellow-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform"
              size={18}
            />
            <div className="min-w-0">
              <div className="font-semibold text-yellow-800 text-sm">
                Pending
              </div>
              <div className="text-yellow-700/90 text-xs mt-0.5">
                Waiting for seller confirmation
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/80 border border-blue-200/60 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <CheckCircle
              className="text-blue-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform"
              size={18}
            />
            <div className="min-w-0">
              <div className="font-semibold text-blue-800 text-sm">
                Confirmed
              </div>
              <div className="text-blue-700/90 text-xs mt-0.5">
                Seller approved • Pay if needed
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50/80 border border-green-200/60 hover:bg-green-50 hover:border-green-300 hover:shadow-sm transition-all group"
          >
            <CheckCircle
              className="text-green-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform"
              size={18}
            />
            <div className="min-w-0">
              <div className="font-semibold text-green-800 text-sm">
                Completed
              </div>
              <div className="text-green-700/90 text-xs mt-0.5">
                Order finished successfully
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pickup Orders - Detailed Sections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="text-[#69773D]" size={16} />
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Pickup Orders
          </h4>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pl-6 border-l-2 border-[#69773D]/20">
          For pickup orders, you&apos;ll meet the seller at a designated{" "}
          <span className="font-semibold text-[#69773D]">meetup point</span>.
          The location name, address, preferred time, and coordinates are shown
          in your order details. You can view the map and open the location in
          Google Maps directly from the order page.
        </p>

        <div className="space-y-3">
          {/* Cash Payment */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="p-4 rounded-lg bg-gradient-to-br from-[#69773D]/5 via-[#84B067]/5 to-[#69773D]/5 border border-[#69773D]/20 hover:border-[#69773D]/40 hover:shadow-md transition-all"
          >
            <div className="font-semibold text-[#69773D] text-sm flex items-center gap-2 mb-3">
              <CreditCard className="text-[#69773D]" size={18} />
              Cash Payment Flow
            </div>
            <ol className="space-y-2 pl-1 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                  1.
                </span>
                <span>
                  After seller{" "}
                  <span className="font-semibold text-[#69773D]">confirms</span>{" "}
                  your order, check the order details for the{" "}
                  <span className="font-semibold text-[#69773D]">
                    meetup point
                  </span>{" "}
                  location, address, and{" "}
                  <span className="font-semibold text-[#69773D]">
                    preferred time
                  </span>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                  2.
                </span>
                <span>
                  Go to the{" "}
                  <span className="font-semibold text-[#69773D]">
                    meetup point
                  </span>{" "}
                  at the scheduled time. You can click &quot;Show Map&quot; to
                  view the location or &quot;Open in Google Maps&quot; for
                  directions.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                  3.
                </span>
                <span>
                  Meet the seller and{" "}
                  <span className="font-semibold text-[#69773D]">
                    pay in cash
                  </span>{" "}
                  when you receive the product. Verify the items match your
                  order.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                  4.
                </span>
                <span>
                  Click the{" "}
                  <span className="font-semibold text-[#69773D] bg-[#69773D]/10 px-1.5 py-0.5 rounded">
                    &quot;I received the product&quot;
                  </span>{" "}
                  button in your order details to confirm receipt.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#69773D] font-bold mt-0.5 flex-shrink-0">
                  5.
                </span>
                <span>
                  Wait for the seller to click{" "}
                  <span className="font-semibold text-[#69773D] bg-[#69773D]/10 px-1.5 py-0.5 rounded">
                    &quot;Mark as delivered&quot;
                  </span>
                  . The order will be marked as{" "}
                  <span className="font-semibold text-[#69773D]">
                    completed
                  </span>{" "}
                  when both parties have confirmed.
                </span>
              </li>
            </ol>
          </motion.div>

          {/* QR Payment */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="p-4 rounded-lg bg-gradient-to-br from-[#84B067]/5 via-[#69773D]/5 to-[#84B067]/5 border border-[#84B067]/20 hover:border-[#84B067]/40 hover:shadow-md transition-all"
          >
            <div className="font-semibold text-[#84B067] text-sm flex items-center gap-2 mb-3">
              <CheckCircle className="text-[#84B067]" size={18} />
              PromptPay/Transfer Payment Flow
            </div>
            <ol className="space-y-2 pl-1 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  1.
                </span>
                <span>
                  After seller{" "}
                  <span className="font-semibold text-[#84B067]">confirms</span>{" "}
                  your order, click the{" "}
                  <span className="font-semibold text-[#84B067] bg-[#84B067]/10 px-1.5 py-0.5 rounded">
                    &quot;Show QR Code&quot;
                  </span>{" "}
                  button to view the payment QR code.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  2.
                </span>
                <span>
                  Scan the QR code with your banking app and{" "}
                  <span className="font-semibold text-[#84B067]">
                    complete the payment
                  </span>
                  . Then click &quot;Make Payment&quot; to submit the payment
                  notification.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  3.
                </span>
                <span>
                  Check your order details for the{" "}
                  <span className="font-semibold text-[#84B067]">
                    meetup point
                  </span>{" "}
                  location, address, and{" "}
                  <span className="font-semibold text-[#84B067]">
                    preferred time
                  </span>
                  . Go to the location at the scheduled time.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  4.
                </span>
                <span>
                  You can use &quot;Show Map&quot; to view the location or{" "}
                  <span className="font-semibold text-[#84B067]">
                    &quot;Open in Google Maps&quot;
                  </span>{" "}
                  for navigation directions.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  5.
                </span>
                <span>
                  Meet the seller and{" "}
                  <span className="font-semibold text-[#84B067]">
                    receive your product
                  </span>
                  . Verify the items match your order.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  6.
                </span>
                <span>
                  Click the{" "}
                  <span className="font-semibold text-[#84B067] bg-[#84B067]/10 px-1.5 py-0.5 rounded">
                    &quot;I received the product&quot;
                  </span>{" "}
                  button to confirm receipt.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#84B067] font-bold mt-0.5 flex-shrink-0">
                  7.
                </span>
                <span>
                  Wait for the seller to click{" "}
                  <span className="font-semibold text-[#84B067] bg-[#84B067]/10 px-1.5 py-0.5 rounded">
                    &quot;Mark as delivered&quot;
                  </span>
                  . The order will be marked as{" "}
                  <span className="font-semibold text-[#84B067]">
                    completed
                  </span>{" "}
                  when both parties have confirmed.
                </span>
              </li>
            </ol>
          </motion.div>
        </div>
      </div>

      {/* Delivery Orders */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: 0.35 }}
        className="p-4 rounded-lg bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 border border-amber-200/60 hover:border-amber-300/80 hover:shadow-md transition-all"
      >
        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
          <Truck className="text-amber-700" size={16} />
          Delivery Orders
        </h4>
        <ol className="space-y-2 pl-1 text-sm text-amber-900/80">
          <li className="flex items-start gap-2.5">
            <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
              1.
            </span>
            <span>
              After payment, wait for the seller to{" "}
              <span className="font-semibold text-amber-800">
                ship your order
              </span>
              . You&apos;ll receive updates on the shipping status.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
              2.
            </span>
            <span>
              The order will be marked as{" "}
              <span className="font-semibold text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded">
                completed
              </span>{" "}
              automatically after the delivery is confirmed. No additional
              action is required from you.
            </span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
}

export default function GuidePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller">("buyer");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const user = getAuthUser();
    if (
      user &&
      typeof user === "object" &&
      "role" in user &&
      typeof user.role === "string"
    ) {
      const role = user.role.toLowerCase();
      if (role === "buyer" || role === "seller") {
        setSelectedRole(role);
      }
    }
  }, []);

  const currentSteps = useMemo(() => {
    return selectedRole === "buyer" ? buyerSteps : sellerSteps;
  }, [selectedRole]);

  const handleRoleChange = useCallback((role: "buyer" | "seller") => {
    setSelectedRole(role);
  }, []);

  // Optimized animation variants - simpler for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden"
        >
          {/* Decorative gradient - only on desktop to save resources */}
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#69773D]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="text-[#69773D]" size={28} />
                KU Market User Guide
              </h1>
              <p className="text-gray-600">
                Learn how to use the system for each role
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 relative z-10">
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              onClick={() => handleRoleChange("buyer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative overflow-hidden ${
                selectedRole === "buyer"
                  ? "bg-[#69773D] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {selectedRole === "buyer" && !prefersReducedMotion && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#69773D] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {selectedRole === "buyer" && prefersReducedMotion && (
                <div className="absolute inset-0 bg-[#69773D] rounded-lg" />
              )}
              <User size={18} className="relative z-10" />
              <span className="relative z-10">For Buyers</span>
            </motion.button>
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              onClick={() => handleRoleChange("seller")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative overflow-hidden ${
                selectedRole === "seller"
                  ? "bg-[#69773D] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {selectedRole === "seller" && !prefersReducedMotion && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#69773D] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {selectedRole === "seller" && prefersReducedMotion && (
                <div className="absolute inset-0 bg-[#69773D] rounded-lg" />
              )}
              <Store size={18} className="relative z-10" />
              <span className="relative z-10">For Sellers</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            {currentSteps.map((step, index) => {
              const Icon = step.icon;
              const isTrackOrders = step.description === "TRACK_ORDERS_SPECIAL";
              const isDeliverProducts =
                step.description === "DELIVER_PRODUCTS_SPECIAL";

              return (
                <motion.div
                  key={`${selectedRole}-${index}`}
                  variants={itemVariants}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow relative overflow-hidden group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#69773D] to-[#84B067] rounded-lg flex items-center justify-center text-white shadow-lg transition-shadow group-hover:shadow-xl">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#69773D] transition-colors">
                        {step.title}
                      </h3>
                      {isTrackOrders ? (
                        <TrackOrdersDescription />
                      ) : isDeliverProducts ? (
                        <DeliverProductsDescription />
                      ) : (
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {step.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-2xl font-bold text-gray-300 group-hover:text-[#69773D]/30 transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Progress line - only on hover for performance */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#69773D] to-[#84B067] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Quick Links - Only for Buyers */}
        {selectedRole === "buyer" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className="mt-8 bg-white rounded-xl shadow-md p-6 relative overflow-hidden"
          >
            {/* Decorative element - only on desktop */}
            <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#84B067]/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-gray-900 mb-4 relative z-10 flex items-center gap-2">
              <ArrowRight className="text-[#69773D]" size={20} />
              Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#69773D]/10 hover:to-[#84B067]/10 transition-all group border border-transparent hover:border-[#69773D]/20 active:scale-[0.98]"
              >
                <ShoppingBag
                  size={20}
                  className="text-[#69773D] group-hover:text-[#84B067] transition-colors"
                />
                <span className="font-medium text-gray-700 group-hover:text-[#69773D] transition-colors">
                  Marketplace
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto text-gray-400 group-hover:text-[#69773D] group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#69773D]/10 hover:to-[#84B067]/10 transition-all group border border-transparent hover:border-[#69773D]/20 active:scale-[0.98]"
              >
                <Package
                  size={20}
                  className="text-[#69773D] group-hover:text-[#84B067] transition-colors"
                />
                <span className="font-medium text-gray-700 group-hover:text-[#69773D] transition-colors">
                  My Orders
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto text-gray-400 group-hover:text-[#69773D] group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#69773D]/10 hover:to-[#84B067]/10 transition-all group border border-transparent hover:border-[#69773D]/20 active:scale-[0.98]"
              >
                <User
                  size={20}
                  className="text-[#69773D] group-hover:text-[#84B067] transition-colors"
                />
                <span className="font-medium text-gray-700 group-hover:text-[#69773D] transition-colors">
                  Profile
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto text-gray-400 group-hover:text-[#69773D] group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
