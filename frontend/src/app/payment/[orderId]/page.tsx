"use client";

import { useEffect, useState, use } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, QrCode, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { getAuthToken, isAuthenticated, clearAuthTokens } from "@/lib/auth";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
}

function PaymentForm({ clientSecret, orderId, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast.error(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
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
      {/* Payment Element */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-[#84B067]" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        </div>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold text-gray-900">
            ฿{amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          You will be redirected to complete the payment via PromptPay
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || paymentStatus === "processing"}
        className="w-full py-3 px-4 bg-[#84B067] text-white rounded-lg font-semibold hover:bg-[#6A8F52] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing || paymentStatus === "processing" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ฿{amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </>
        )}
      </button>

      <Link
        href={`/order/${orderId}`}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order</span>
      </Link>
    </form>
  );
}

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

  useEffect(() => {
    const fetchPaymentIntent = async () => {
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
        setError(err instanceof Error ? err.message : "Failed to initialize payment");
        toast.error(err instanceof Error ? err.message : "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [resolvedParams.orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#84B067] mx-auto mb-4" />
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error || "Failed to initialize payment"}</p>
          <Link
            href={`/order/${resolvedParams.orderId}`}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#84B067] text-white rounded-lg hover:bg-[#6A8F52] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Order
          </Link>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
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
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href={`/order/${resolvedParams.orderId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Pay securely using PromptPay</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              clientSecret={clientSecret}
              orderId={resolvedParams.orderId}
              amount={amount}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}

