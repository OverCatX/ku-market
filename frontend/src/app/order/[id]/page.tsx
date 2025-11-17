"use client";

import { useCallback, useEffect, useMemo, useState, use } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  MessageCircle,
  Home,
  ShoppingBag,
  CreditCard,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { useRouter } from "next/navigation";
import { clearAuthTokens, getAuthToken, isAuthenticated } from "@/lib/auth";

interface OrderItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface SellerDetails {
  id: string;
  name?: string;
}

interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
}

interface BuyerContact {
  fullName: string;
  phone: string;
}

interface OrderDetail {
  id: string;
  seller: SellerDetails;
  items: OrderItem[];
  totalPrice: number;
  status:
    | "pending_seller_confirmation"
    | "confirmed"
    | "rejected"
    | "completed"
    | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  paymentMethod: "cash" | "transfer" | "promptpay";
  paymentStatus?:
    | "pending"
    | "awaiting_payment"
    | "payment_submitted"
    | "paid"
    | "not_required";
  paymentSubmittedAt?: string;
  shippingAddress?: ShippingAddress;
  pickupDetails?: {
    locationName: string;
    address?: string;
    note?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    preferredTime?: string;
  };
  buyerContact: BuyerContact;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  completedAt?: string;
  buyerReceived?: boolean;
  buyerReceivedAt?: string;
  sellerDelivered?: boolean;
  sellerDeliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusStyles: Record<
  OrderDetail["status"],
  {
    label: string;
    badge: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }
> = {
  pending_seller_confirmation: {
    label: "Pending seller confirmation",
    badge: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-100 text-blue-700",
    icon: Package,
  },
  completed: {
    label: "Completed",
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
};

const statusTips: Record<OrderDetail["status"], string> = {
  pending_seller_confirmation:
    "The seller is reviewing your order. You will be notified once they confirm.",
  confirmed:
    "Seller has confirmed the order. Coordinate the meetup or delivery, and submit payment if PromtPay/transfer is required.",
  completed:
    "Order marked as completed. Thank you for shopping with KU Market!",
  rejected:
    "Seller rejected the order. Review the reason below and contact the seller if needed.",
  cancelled:
    "Order was cancelled. If this is unexpected, contact the seller for support.",
};

const paymentStatusBadge = (status?: OrderDetail["paymentStatus"]) => {
  if (!status || status === "not_required") {
    return null;
  }

  const map: Record<
    Exclude<OrderDetail["paymentStatus"], undefined>,
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending seller review",
      className: "bg-gray-100 text-gray-700",
    },
    awaiting_payment: {
      label: "Awaiting your payment",
      className: "bg-orange-100 text-orange-800",
    },
    payment_submitted: {
      label: "Payment submitted",
      className: "bg-blue-100 text-blue-700",
    },
    paid: {
      label: "Payment completed",
      className: "bg-green-100 text-green-700",
    },
    not_required: {
      label: "Payment not required",
      className: "bg-gray-100 text-gray-600",
    },
  };

  const badge = map[status] ?? map.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.className}`}
    >
      <CreditCard size={12} />
      {badge.label}
    </span>
  );
};

const formatPaymentMethod = (method: OrderDetail["paymentMethod"]) => {
  const normalized = normalizePaymentMethod(method);
  if (normalized === "promptpay") return "PromptPay";
  if (normalized === "transfer") return "Bank transfer";
  return "Cash";
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeStatus = (
  status?: OrderDetail["status"]
): OrderDetail["status"] | null => {
  if (!status) return null;
  const lowered = status.trim().toLowerCase();
  const map: Record<string, OrderDetail["status"]> = {
    pending_seller_confirmation: "pending_seller_confirmation",
    confirmed: "confirmed",
    rejected: "rejected",
    completed: "completed",
    cancelled: "cancelled",
  };
  return map[lowered] ?? null;
};

const normalizePaymentStatus = (
  status?: OrderDetail["paymentStatus"]
): OrderDetail["paymentStatus"] | null => {
  if (!status) return null;
  const lowered = status.trim().toLowerCase();
  const map: Record<string, OrderDetail["paymentStatus"]> = {
    pending: "pending",
    awaiting_payment: "awaiting_payment",
    payment_submitted: "payment_submitted",
    paid: "paid",
    not_required: "not_required",
  };
  return map[lowered] ?? null;
};

const normalizePaymentMethod = (
  method?: OrderDetail["paymentMethod"]
): "cash" | "promptpay" | "transfer" | null => {
  if (!method) return null;
  const lowered = method.trim().toLowerCase();
  if (lowered === "cash" || lowered === "promptpay" || lowered === "transfer") {
    return lowered as "cash" | "promptpay" | "transfer";
  }
  return null;
};

const resolveMessage = (
  payload: Record<string, unknown>,
  fallback: string
): string => {
  const fromError =
    typeof payload.error === "string" ? payload.error : undefined;
  const fromMessage =
    typeof payload.message === "string" ? payload.message : undefined;
  return fromError || fromMessage || fallback;
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [contactingSeller, setContactingSeller] = useState(false);
  const [markingReceived, setMarkingReceived] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authentication");
      if (!token) {
        setError("Please login to view this order.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payloadText = await response.text();
      let payload: Record<string, unknown> = {};
      if (payloadText) {
        try {
          payload = JSON.parse(payloadText);
        } catch {
          payload = {};
        }
      }

      if (response.status === 401) {
        setError("Your session expired. Please login again.");
        return;
      }

      if (response.status === 403) {
        setError(
          resolveMessage(payload, "You do not have access to this order.")
        );
        return;
      }

      if (response.status === 404) {
        setError(resolveMessage(payload, "This order could not be found."));
        return;
      }

      if (!response.ok) {
        throw new Error(resolveMessage(payload, "Failed to load order"));
      }

      if (!payload.order) {
        throw new Error("Order details are unavailable.");
      }

      setOrder(payload.order as OrderDetail);
    } catch (err) {
      console.error("Order detail failed: ", err);
      setError(
        err instanceof Error ? err.message : "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleMakePayment = useCallback(async () => {
    if (!order) {
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to submit payment");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login to submit payment");
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/orders/${order.id}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload as { error?: string }).error ||
          (payload as { message?: string }).message ||
          "Failed to submit payment";
        throw new Error(message);
      }

      toast.success("Payment submitted! The seller will verify shortly.");
      await fetchOrder();
    } catch (err) {
      console.error("Submit payment error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit payment"
      );
    } finally {
      setSubmittingPayment(false);
    }
  }, [fetchOrder, order]);

  const handleMarkReceived = useCallback(async () => {
    if (!order) {
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login first");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login first");
      return;
    }

    setMarkingReceived(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/orders/${order.id}/buyer-received`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload as { error?: string }).error ||
          (payload as { message?: string }).message ||
          "Failed to mark as received";
        throw new Error(message);
      }

      toast.success("Order marked as received!");
      await fetchOrder();
    } catch (err) {
      console.error("Mark received error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to mark as received"
      );
    } finally {
      setMarkingReceived(false);
    }
  }, [fetchOrder, order]);

  const handleContactSeller = useCallback(async () => {
    if (!order?.seller?.id) {
      toast.error("Seller information unavailable");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to contact the seller");
      router.push(`/login?redirect=/order/${order.id}`);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      clearAuthTokens();
      toast.error("Please login to contact the seller");
      router.push(`/login?redirect=/order/${order.id}`);
      return;
    }

    setContactingSeller(true);
    try {
      const response = await fetch(`${API_BASE}/api/chats/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          sellerId: order.seller.id,
        }),
      });

      if (response.status === 401) {
        clearAuthTokens();
        toast.error("Session expired. Please login again");
        router.push(`/login?redirect=/order/${order.id}`);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        const message =
          payload?.error || payload?.message || "Failed to contact seller";
        throw new Error(message);
      }

      const data = (await response.json().catch(() => null)) as {
        id?: string;
        threadId?: string;
        _id?: string;
      } | null;
      const threadId = data?.id || data?.threadId || data?._id;

      if (!threadId) {
        throw new Error("Chat thread not available");
      }

      router.push(`/chats?threadId=${encodeURIComponent(threadId)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to contact seller";
      toast.error(message);
    } finally {
      setContactingSeller(false);
    }
  }, [order, router]);

  const statusBlock = useMemo(() => {
    if (!order) return null;
    const normalizedStatus =
      normalizeStatus(order.status) ?? "pending_seller_confirmation";
    const meta = statusStyles[normalizedStatus];
    const Icon = meta.icon;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${meta.badge}`}
          >
            <Icon size={16} />
            {meta.label}
          </span>
          <span className="text-xs text-gray-500">
            Placed on {formatDateTime(order.createdAt)}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Last updated {formatDateTime(order.updatedAt)}
        </div>
      </div>
    );
  }, [order]);

  const paymentState = useMemo(() => {
    if (!order) {
      return {
        requiresPayment: false,
        awaitingBuyerPayment: false,
        paymentComplete: false,
      };
    }

    const normalizedMethod = normalizePaymentMethod(order.paymentMethod);
    const rawMethod = order.paymentMethod
      ? order.paymentMethod.trim().toLowerCase()
      : null;
    const normalizedStatus = normalizeStatus(order.status);
    const normalizedPaymentStatus = normalizePaymentStatus(order.paymentStatus);

    const requiresPayment =
      normalizedMethod === "promptpay" ||
      normalizedMethod === "transfer" ||
      (rawMethod !== null && rawMethod !== "cash");
    const awaitingBuyerPayment =
      requiresPayment &&
      normalizedStatus === "confirmed" &&
      (normalizedPaymentStatus === "awaiting_payment" ||
        normalizedPaymentStatus === "pending" ||
        normalizedPaymentStatus === null);
    const paymentComplete =
      normalizedPaymentStatus === "payment_submitted" ||
      normalizedPaymentStatus === "paid";

    return { requiresPayment, awaitingBuyerPayment, paymentComplete };
  }, [order]);

  const { awaitingBuyerPayment, paymentComplete } = paymentState;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
          <div className="rounded-3xl bg-white p-8 shadow animate-pulse">
            <div className="h-8 w-40 rounded bg-gray-200" />
            <div className="mt-6 h-4 w-full rounded bg-gray-200" />
            <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
            <div className="mt-10 grid gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-3xl">
          <div className="rounded-3xl bg-white p-8 shadow text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Oops!</h1>
            <p className="mt-2 text-gray-600">
              {error || "We couldn’t find this order."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-xl bg-[#69773D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#55602f]"
              >
                <ArrowLeft size={16} /> Back to orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d6e4c3] px-4 py-2 text-sm font-semibold text-[#4c5c2f] hover:bg-[#f3f8ed]"
              >
                <Home size={16} /> Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normalizedStatus =
    normalizeStatus(order.status) ?? "pending_seller_confirmation";
  const meta = statusStyles[normalizedStatus];
  const StatusIcon = meta.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8f1] via-white to-[#eef4e6] py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-4xl">
        <div className="mb-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4c5c2f] hover:text-[#2f3816]"
          >
            <ArrowLeft size={16} /> Back to orders
          </Link>
        </div>

        <div className="rounded-3xl bg-white/90 border border-[#e4ecd7] shadow-xl shadow-[#c8d3ba]/30 p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  Order ID
                </span>
                <h1 className="text-2xl font-bold text-[#3d4a29]">
                  {order.id}
                </h1>
              </div>
              <StatusIcon size={32} className="text-[#69773D]" />
            </div>

            {statusBlock}

            <div className="rounded-2xl bg-[#f3f8ed] border border-[#dfe7cf] p-4">
              <p className="text-sm text-gray-600">
                {statusTips[normalizedStatus]}
              </p>
              {order.rejectionReason && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  Reason: {order.rejectionReason}
                </p>
              )}
            </div>

            <section className="rounded-2xl border border-[#e4ecd7] bg-white p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#3d4a29]">
                Items in this order
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#eef2e1] pb-3 last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#f5f9ef] border border-[#e4ecd7]">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} × {item.price.toLocaleString()} THB
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} THB
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total amount</span>
                  <span>{order.totalPrice.toLocaleString()} THB</span>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e4ecd7] bg-white p-4">
                <h3 className="text-sm font-semibold text-[#3d4a29]">
                  Delivery & payment
                </h3>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-[#69773D]" />
                    <span className="capitalize">{order.deliveryMethod}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Package size={16} className="text-[#69773D]" />
                    <span>{formatPaymentMethod(order.paymentMethod)}</span>
                    {paymentStatusBadge(
                      normalizePaymentStatus(order.paymentStatus) ?? undefined
                    )}
                  </div>
                  {order.deliveryMethod === "delivery" &&
                    order.shippingAddress && (
                      <div className="mt-2 space-y-1 rounded border border-[#d6e4c3] bg-[#f8fbef] p-3 text-xs text-[#3f4e24]">
                        <p className="font-semibold text-[#2f3b11]">
                          Shipping address
                        </p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                          {order.shippingAddress.city}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                      </div>
                    )}
                  {order.deliveryMethod === "pickup" && order.pickupDetails && (
                    <div className="mt-2 space-y-1 rounded border border-[#d6e4c3] bg-[#f8fbef] p-3 text-xs text-[#3f4e24]">
                      <p className="font-semibold text-[#2f3b11]">
                        Meetup point
                      </p>
                      <p className="flex items-center gap-1 font-medium text-[#2f3b11]">
                        <MapPin size={12} className="text-[#84B067]" />
                        {order.pickupDetails.locationName}
                      </p>
                      {order.pickupDetails.address && (
                        <p>{order.pickupDetails.address}</p>
                      )}
                      {order.pickupDetails.coordinates && (
                        <p className="text-[11px] text-gray-500">
                          Coordinates:{" "}
                          {order.pickupDetails.coordinates.lat.toFixed(5)},{" "}
                          {order.pickupDetails.coordinates.lng.toFixed(5)}
                        </p>
                      )}
                      {order.pickupDetails.note && (
                        <p className="text-[11px] text-gray-500">
                          Buyer note: {order.pickupDetails.note}
                        </p>
                      )}
                      {order.pickupDetails.preferredTime && (
                        <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                          <Clock size={10} />
                          Preferred time: {new Date(order.pickupDetails.preferredTime).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-[#e4ecd7] bg-white p-4">
                <h3 className="text-sm font-semibold text-[#3d4a29]">
                  Buyer contact
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">
                    {order.buyerContact.fullName}
                  </p>
                  <p>{order.buyerContact.phone}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleContactSeller}
                    disabled={contactingSeller}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      contactingSeller
                        ? "border-[#d6e4c3] bg-[#f3f8ed] text-gray-400 cursor-not-allowed"
                        : "border-[#d6e4c3] text-[#4c5c2f] hover:bg-[#f3f8ed]"
                    }`}
                  >
                    <MessageCircle size={16} />
                    {contactingSeller ? "Opening chat..." : "Contact seller"}
                  </button>
                </div>
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              {awaitingBuyerPayment && !paymentComplete && (
                <button
                  type="button"
                  onClick={handleMakePayment}
                  disabled={submittingPayment}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    submittingPayment
                      ? "bg-[#f3f8ed] text-gray-400 border border-[#d6e4c3] cursor-not-allowed"
                      : "bg-[#4c5c2f] text-white hover:bg-[#3a4b23]"
                  }`}
                >
                  <CreditCard size={16} />
                  {submittingPayment ? "Submitting..." : "Make payment"}
                </button>
              )}
              {normalizedStatus === "confirmed" &&
                order.deliveryMethod === "pickup" &&
                !order.buyerReceived && (
                  <button
                    type="button"
                    onClick={handleMarkReceived}
                    disabled={markingReceived}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      markingReceived
                        ? "bg-[#f3f8ed] text-gray-400 border border-[#d6e4c3] cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    <CheckCircle size={16} />
                    {markingReceived ? "Saving..." : "I received the product"}
                  </button>
                )}
              {order.buyerReceived && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  <CheckCircle size={16} />
                  You have confirmed receiving the product
                </div>
              )}
              {order.sellerDelivered && !order.buyerReceived && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                  <CheckCircle size={16} />
                  Seller has confirmed delivery - Please confirm receipt
                </div>
              )}
              {order.buyerReceived && order.sellerDelivered && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-green-200 px-4 py-2 text-sm font-semibold text-green-800">
                  <CheckCircle size={16} />
                  Both parties confirmed - Order completed
                </div>
              )}
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-xl bg-[#69773D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#55602f] transition"
              >
                <ArrowLeft size={16} /> Back to my orders
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d6e4c3] px-4 py-2 text-sm font-semibold text-[#4c5c2f] hover:bg-[#f3f8ed] transition"
              >
                <ShoppingBag size={16} /> Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
