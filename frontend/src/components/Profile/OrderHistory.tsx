import { ShoppingBag } from "lucide-react";

export default function OrderHistory() {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <ShoppingBag className="w-5 h-5 text-[#69773D]" />
        Order History
      </h2>

      <div className="p-6 border rounded-xl bg-gray-50 text-center text-gray-500">
        No orders yet.
      </div>
    </div>
  );
}
