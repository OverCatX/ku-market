import { CreditCard } from "lucide-react";

interface Order {
  id: string;
  item: string;
  date: string;
  price: number;
  status: "Completed" | "Pending" | "Cancelled";
}

export default function OrdersSection({
  orders,
  loading,
}: {
  orders: Order[];
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-6 md:p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" /> Purchase History
      </h3>

      {loading ? (
        <div className="space-y-2 sm:space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-12 sm:h-16 bg-gray-200 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-6 sm:py-10 text-gray-500 text-sm sm:text-base">
          No orders yet. Start shopping!
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border rounded-lg hover:shadow transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="font-medium">{o.item}</div>
                <div className="text-sm text-gray-500">{o.date}</div>
              </div>
              <div className="flex flex-col sm:text-right mt-2 sm:mt-0">
                <div className="font-semibold">{o.price} THB</div>
                <div
                  className={`text-sm ${
                    o.status === "Completed"
                      ? "text-green-600"
                      : o.status === "Pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {o.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
