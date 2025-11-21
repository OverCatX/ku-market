"use client";

import { useEffect, useState, use, useMemo, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { getAuthToken, isAuthenticated, clearAuthTokens } from "@/lib/auth";

// Lazy load Stripe to reduce initial bundle size
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Lazy load payment form component
const PromptPayPaymentForm = dynamic(
  () => import("@/components/payment/PromptPayPaymentForm"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#84B067]" />
      </div>
    ),
    ssr: false,
  }
);

export default function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentIntent = useCallback(async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to make payment");
      router.push("/login");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login to make payment");
      router.push("/login");
      return;
    }

    try {
      // Create payment intent
      const response = await fetch(
        `${API_BASE}/api/checkout/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            orderId: resolvedParams.orderId,
          }),
        }
      );

      if (response.status === 401) {
        clearAuthTokens();
        toast.error("Your session expired. Please login again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setAmount(data.amount);
    } catch (err) {
      console.error("Error initializing payment:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize payment"
      );
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.orderId, router]);

  useEffect(() => {
    fetchPaymentIntent();
  }, [fetchPaymentIntent]);

  // Memoize Stripe Elements options to prevent re-creation (must be before conditional returns)
  const elementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret || "",
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#84B067",
          colorBackground: "#ffffff",
          colorText: "#1f2937",
          colorDanger: "#ef4444",
          fontFamily: "system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "8px",
        },
      },
      locale: "th" as const,
    }),
    [clientSecret]
  );

  // Memoize loading state to prevent unnecessary re-renders
  const loadingState = useMemo(
    () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#84B067] mx-auto mb-4" />
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    ),
    []
  );

  // Memoize error state
  const errorState = useMemo(
    () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-8 text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Payment Error
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {error || "Failed to initialize payment"}
          </p>
          <Link
            href={`/order/${resolvedParams.orderId}`}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#84B067] text-white rounded-lg hover:bg-[#6A8F52] transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Order
          </Link>
        </div>
      </div>
    ),
    [error, resolvedParams.orderId]
  );

  if (loading) {
    return loadingState;
  }

  if (error || !clientSecret) {
    return errorState;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <Link
            href={`/order/${resolvedParams.orderId}`}
            className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Pay securely using PromptPay
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {clientSecret && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PromptPayPaymentForm
                clientSecret={clientSecret}
                orderId={resolvedParams.orderId}
                amount={amount}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

