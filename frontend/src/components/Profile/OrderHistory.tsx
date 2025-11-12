import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function OrderHistory() {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
        <ShoppingBag className="w-5 h-5 text-[#69773D]" />
        Order History
      </h2>

      <div className="rounded-2xl border border-[#dfe7cf] bg-gradient-to-br from-[#f8fbf3] to-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Keep track of every purchase you've made on KU Market. View current
          statuses, delivery methods, and detailed receipts.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-500">
            Ready to review your orders? Jump to the orders dashboard for full
            details.
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#69773D] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#55602f] transition"
          >
            View all orders
          </Link>
        </div>
      </div>
    </section>
  );
}
