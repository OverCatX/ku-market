"use client";

import Link from "next/link";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import { use } from "react";

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-5 h-5 text-[#84B067]" />
              <span className="text-sm font-medium text-gray-600">Order Number</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{orderId}</p>
          </div>

          {/* What's Next */}
          <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You will receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>The seller will process your order and prepare it for shipping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You&apos;ll get a notification when your order is shipped</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Track your order status in your profile</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#84B067] text-white rounded-lg hover:bg-[#69773D] transition font-semibold"
            >
              <Package className="w-5 h-5" />
              View Order History
            </Link>
            <Link
              href="/marketplace"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#84B067] text-[#84B067] rounded-lg hover:bg-[#84B067] hover:text-white transition font-semibold"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-6"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        {/* Need Help Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your order, feel free to contact us.
          </p>
          <Link
            href="/chats"
            className="text-[#84B067] hover:text-[#69773D] font-medium text-sm"
          >
            Go to Messages →
          </Link>
        </div>
      </div>
    </div>
  );
}

