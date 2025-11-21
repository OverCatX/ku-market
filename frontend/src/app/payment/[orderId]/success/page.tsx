"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/config/constants";
import { getAuthToken } from "@/lib/auth";
import toast from "react-hot-toast";

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        toast.error("Invalid payment session");
        router.push(`/order/${resolvedParams.orderId}`);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        toast.error("Please login to confirm payment");
        router.push("/login");
        return;
      }

      try {
        // Extract payment intent ID from session if needed
        // For now, we'll use the orderId to confirm
        const response = await fetch(`${API_BASE}/api/checkout/confirm-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            paymentIntentId: sessionId, // This might need adjustment based on Stripe response
            orderId: resolvedParams.orderId,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to confirm payment");
        }

        toast.success("Payment confirmed successfully!");
      } catch (err) {
        console.error("Error confirming payment:", err);
        toast.error(err instanceof Error ? err.message : "Failed to confirm payment");
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId, resolvedParams.orderId, router]);

  if (confirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#84B067] mx-auto mb-4" />
          <p className="text-gray-600">Confirming payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. You will receive a confirmation email shortly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={`/order/${resolvedParams.orderId}`}
            className="px-6 py-2 bg-[#84B067] text-white rounded-lg hover:bg-[#6A8F52] transition-colors"
          >
            View Order
          </Link>
          <Link
            href="/orders"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

