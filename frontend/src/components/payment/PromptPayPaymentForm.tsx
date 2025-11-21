"use client";

import { useState, useCallback, memo, useMemo } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, CheckCircle, QrCode } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { getAuthToken } from "@/lib/auth";

interface PromptPayPaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
}

const PromptPayPaymentForm = memo(function PromptPayPaymentForm({
  orderId,
  amount,
}: PromptPayPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  // Memoize formatted amount to prevent recalculation
  const formattedAmount = useMemo(
    () =>
      amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [amount]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);
      setPaymentStatus("processing");

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/${orderId}/success`,
          },
          redirect: "if_required",
        });

        if (error) {
          setPaymentStatus("error");
          toast.error(error.message || "Payment failed. Please try again.");
          setIsProcessing(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          // Confirm payment on backend
          const token = getAuthToken();
          if (!token) {
            toast.error("Please login to confirm payment");
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_BASE}/api/checkout/confirm-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              orderId: orderId,
            }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Failed to confirm payment");
          }

          setPaymentStatus("success");
          toast.success("Payment successful!");

          // Redirect to order page after 2 seconds
          setTimeout(() => {
            router.push(`/order/${orderId}`);
          }, 2000);
        }
      } catch (err) {
        setPaymentStatus("error");
        console.error("Payment error:", err);
        toast.error(
          err instanceof Error
            ? err.message
            : "Payment failed. Please try again."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, orderId, router]
  );

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>
        <Link
          href={`/order/${orderId}`}
          className="px-6 py-2 bg-[#84B067] text-white rounded-lg hover:bg-[#6A8F52] transition-colors"
        >
          View Order
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - Customized for PromptPay */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-[#84B067] flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Payment Details
          </h3>
        </div>
        <div className="min-h-[200px]">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {/* Amount Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm sm:text-base text-gray-600">
            Total Amount
          </span>
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            ฿{formattedAmount}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Complete the payment using PromptPay via your banking app
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || paymentStatus === "processing"}
        className="w-full py-3 px-4 bg-[#84B067] text-white rounded-lg font-semibold hover:bg-[#6A8F52] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing || paymentStatus === "processing" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="hidden sm:inline">Processing Payment...</span>
            <span className="sm:hidden">Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ฿{formattedAmount}
          </>
        )}
      </button>

      <Link
        href={`/order/${orderId}`}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>←</span>
        <span>Back to Order</span>
      </Link>
    </form>
  );
});

export default PromptPayPaymentForm;

