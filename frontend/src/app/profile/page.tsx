"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/config/profile";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Store, ShieldCheck, AlertCircle, Flag } from "lucide-react";
import { API_BASE } from "@/config/constants";

import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileForm from "@/components/Profile/ProfileForm";
import OrderHistory from "@/components/Profile/OrderHistory";
import LogoutButton from "@/components/Profile/LogoutButton";

export default function ProfilePage() {
  const router = useRouter();
  type User = {
    name: string;
    kuEmail: string;
    role: "buyer" | "seller";
    faculty?: string;
    contact?: string;
    isVerified?: boolean;
  } | null;

  type BackendUser = NonNullable<User>;

  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", faculty: "", contact: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [hasApprovedShop, setHasApprovedShop] = useState(false);
  const [shopStatus, setShopStatus] = useState<"pending" | "rejected" | null>(
    null
  );
  const [shopDetails, setShopDetails] = useState<{
    shopName?: string;
    shopType?: string;
    submittedAt?: string;
    rejectionReason?: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userData = (await getProfile()) as unknown as BackendUser;
        setUser(userData);
        setForm({
          name: userData.name || "",
          faculty: userData.faculty || "",
          contact: userData.contact || "",
        });

        // Check if user has a shop (any status)
        try {
          const response = await fetch(`${API_BASE}/api/shop/my-shop`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const shopData = await response.json();
            // Backend returns { success: true, shop: {...} }
            const shop = shopData.shop || shopData;

            if (shop.shopStatus === "approved") {
              setHasApprovedShop(true);
              // Save shop data to localStorage for seller panel
              localStorage.setItem("shop", JSON.stringify(shop));
            } else if (
              shop.shopStatus === "pending" ||
              shop.shopStatus === "rejected"
            ) {
              setShopStatus(shop.shopStatus);
              setShopDetails({
                shopName: shop.shopName,
                shopType: shop.shopType,
                submittedAt: shop.shopRequestDate,
                rejectionReason: shop.shopRejectionReason,
              });
            }
          }
        } catch (err) {
          // No shop or error - ignore
          console.log("No shop found:", err);
        }
      } catch {
        localStorage.removeItem("authentication");
        localStorage.removeItem("cart_backup");
        router.replace("/login");
        setTimeout(() => window.location.reload(), 100);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authentication");
    if (!token) return router.replace("/login");

    setSaving(true);
    setSaveMessage("");
    try {
      const updated = (await updateProfile(
        form
      )) as unknown as BackendUser;
      setUser(updated);
      setSaveMessage("Saved successfully");
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
      setSaveMessage("Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 2000);
    }
  };

  const handleRequestStore = () => {
    router.push("/request-store");
  };

  const handleVerifyIdentity = () => {
    router.push("/verify-identity");
  };

  if (loading)
    return (
      <div className="max-w-3xl mx-auto p-8 mt-12 bg-white rounded-2xl shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    );

  if (!user) return null;

  return (
    <div style={{ backgroundColor: '#F6F2E5', minHeight: '100vh', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
      >
      <ProfileHeader name={user.name} role={user.role} />

      <ProfileForm
        form={form}
        onChange={setForm}
        onSave={handleSave}
        saving={saving}
        saveMessage={saveMessage}
        email={user.kuEmail}
      />

      {/* Verification Section */}
      <div className="mt-8 p-6 bg-[#8DB368]/10 rounded-xl border border-[#8DB368]/20">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck
                className={`w-6 h-6 ${
                  user.isVerified ? "text-green-600" : "text-gray-400"
                }`}
              />
              <h3 className="text-lg font-semibold text-[#4A5130]">
                Identity Verification
              </h3>
            </div>

            {user.isVerified ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4E781A]/20 text-[#4E781A] border border-[#4E781A]/30">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Verified
                </span>
                <p className="text-sm text-gray-600">
                  Your identity has been verified
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Not Verified
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Verify your identity to unlock seller features and build trust
                  with buyers
                </p>
              </div>
            )}
          </div>

          {!user.isVerified && (
            <button
              onClick={handleVerifyIdentity}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#364C91] text-white rounded-lg hover:bg-[#2d3d75] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              <ShieldCheck className="w-5 h-5" />
              Verify Identity
            </button>
          )}
        </div>
      </div>

      {/* Seller Actions */}
      <div className="mt-6 space-y-4">
        {hasApprovedShop ? (
          <div className="p-6 bg-[#A0704F]/10 rounded-xl border border-[#A0704F]/20">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-6 h-6 text-[#A0704F]" />
                  <h3 className="text-lg font-semibold text-[#A0704F]">
                    Seller Panel
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Manage your shop, items, and orders
                </p>
              </div>
              <button
                onClick={() => router.push("/seller/dashboard")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A0704F] text-white rounded-lg hover:bg-[#8a5f3f] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
              >
                <Store className="w-5 h-5" />
                Manage Seller Panel
              </button>
            </div>
          </div>
        ) : shopStatus === "pending" ? (
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-6 h-6 text-[#A0704F]" />
                  <h3 className="text-lg font-semibold text-[#A0704F]">
                    Seller Application Pending
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Your shop application is currently being reviewed by admin
                </p>
                {shopDetails && (
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium text-[#A0704F]">
                        Shop Name:
                      </span>
                      <span className="text-gray-600">
                        {shopDetails.shopName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-[#A0704F]">Type:</span>
                      <span className="text-gray-600">
                        {shopDetails.shopType}
                      </span>
                    </div>
                    {shopDetails.submittedAt && (
                      <div className="flex gap-2">
                        <span className="font-medium text-[#A0704F]">
                          Submitted:
                        </span>
                        <span className="text-gray-600">
                          {new Date(
                            shopDetails.submittedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push("/request-store")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A0704F] text-white rounded-lg hover:bg-[#8a5f3f] shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                View Status
              </button>
            </div>
          </div>
        ) : shopStatus === "rejected" ? (
          <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-[#780606]">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-6 h-6 text-[#780606]" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Application Rejected
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Your shop application was not approved. You can apply again.
                </p>
                {shopDetails && (
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-700">
                        Shop Name:
                      </span>
                      <span className="text-gray-600">
                        {shopDetails.shopName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="text-gray-600">
                        {shopDetails.shopType}
                      </span>
                    </div>
                    {shopDetails.rejectionReason && (
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-700">
                          Reason:
                        </span>
                        <span className="text-[#780606]">
                          {shopDetails.rejectionReason}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push("/request-store")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#780606] text-white rounded-lg hover:bg-[#780606] shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                View Details & Reapply
              </button>
            </div>
          </div>
        ) : (
          user.role !== "seller" && (
            <button
              onClick={handleRequestStore}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-[#A0704F] text-white rounded-lg hover:bg-[#8a5f3f] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Store className="w-5 h-5" />
              Become a Seller
            </button>
          )
        )}
      </div>

      <OrderHistory />

      <div className="mt-8 p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-[#780606] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[#780606] text-white p-2 mt-0.5">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#780606]">
              Report history
            </h3>
            <p className="text-sm text-gray-600">
              Review the status of any reports you have submitted to the admins.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/profile/reports")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#780606] text-white rounded-lg hover:bg-[#5c0505] shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
        >
          <Flag className="w-4 h-4" />
          View my reports
        </button>
      </div>

      <LogoutButton />
      </motion.div>
    </div>
  );
}
