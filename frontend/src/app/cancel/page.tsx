"use client";

import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8f1] via-white to-[#eef4e6] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-red-200 shadow-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ยกเลิกการชำระเงิน
        </h1>
        <p className="text-gray-600 mb-6">
          การชำระเงินถูกยกเลิก คุณสามารถลองใหม่อีกครั้งได้
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84B067] px-6 py-3 text-sm font-semibold text-white hover:bg-[#73995a] transition shadow-md"
          >
            <ArrowLeft size={16} />
            กลับไปที่ Orders
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

