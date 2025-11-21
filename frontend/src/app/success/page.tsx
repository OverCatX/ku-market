"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Extract orderId from URL if present (e.g., /order/123?payment=success)
    const path = window.location.pathname;
    const orderMatch = path.match(/\/order\/([^\/]+)/);
    if (orderMatch) {
      setOrderId(orderMatch[1]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8f1] via-white to-[#eef4e6] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-[#84B067] shadow-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ชำระเงินสำเร็จ!
        </h1>
        <p className="text-gray-600 mb-6">
          ขอบคุณสำหรับการชำระเงินของคุณ ระบบกำลังประมวลผลการชำระเงิน
        </p>

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Session ID</p>
            <p className="text-sm font-mono text-gray-700 break-all">
              {sessionId}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link
              href={`/order/${orderId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84B067] px-6 py-3 text-sm font-semibold text-white hover:bg-[#73995a] transition shadow-md"
            >
              <ArrowLeft size={16} />
              ดูรายละเอียด Order
            </Link>
          )}
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#84B067] px-6 py-3 text-sm font-semibold text-[#84B067] hover:bg-[#f3f8ed] transition"
          >
            ไปที่ Orders ของฉัน
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ShoppingBag size={16} />
            กลับไป Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

