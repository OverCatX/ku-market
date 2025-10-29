"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  deliveryMethod: "pickup" | "delivery";
  paymentMethod: "cash" | "promptpay";
  status: "pending" | "confirmed" | "rejected" | "completed";
  createdAt: string;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
  };
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "completed"
  >("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) return;

      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE}/api/seller/orders`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();

      // Simulate data
      setTimeout(() => {
        setOrders([
          {
            id: "1",
            orderNumber: "ORD-2024-001",
            buyer: {
              name: "John Doe",
              email: "john@ku.th",
              phone: "0812345678",
            },
            items: [
              {
                id: "1",
                title: "Programming Textbook",
                price: 450,
                quantity: 1,
                image: "/placeholder.png",
              },
            ],
            total: 450,
            deliveryMethod: "pickup",
            paymentMethod: "cash",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) return;

      // TODO: API call
      // await confirmOrder(token, orderId);

      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: "confirmed" as const } : o
        )
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const handleRejectOrder = async (orderId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("authentication");
      if (!token) return;

      // TODO: API call
      // await rejectOrder(token, orderId);

      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: "rejected" as const } : o
        )
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to reject order:", error);
    }
  };

  const filteredOrders = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage your customer orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "pending", "confirmed", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-2 text-xs">
                ({orders.filter((o) => o.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "You haven't received any orders yet"
                : `No ${filter} orders`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status === "pending" && <Clock size={12} />}
                  {order.status === "confirmed" && <CheckCircle size={12} />}
                  {order.status === "rejected" && <XCircle size={12} />}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Buyer Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Buyer Information
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {order.buyer.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.buyer.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.buyer.phone}
                  </p>
                  <p>
                    <span className="font-medium">Delivery:</span>{" "}
                    {order.deliveryMethod === "pickup"
                      ? "Self Pick-up"
                      : "Delivery"}
                  </p>
                  <p>
                    <span className="font-medium">Payment:</span>{" "}
                    {order.paymentMethod === "cash" ? "Cash" : "PromptPay"}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-green-600">
                  ฿{order.total.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              {order.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleConfirmOrder(order.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle size={18} className="inline mr-2" />
                    Confirm Order
                  </button>
                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <XCircle size={18} className="inline mr-2" />
                    Reject Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
