"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/config/profile";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Store, ShieldCheck, AlertCircle } from "lucide-react";

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

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userData = (await getProfile(token)) as unknown as BackendUser;
        setUser(userData);
        setForm({
          name: userData.name || "",
          faculty: userData.faculty || "",
          contact: userData.contact || "",
        });
      } catch {
        localStorage.removeItem("authentication");
        router.replace("/login");
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
        token,
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
    // TODO: Implement verification flow
    toast("Identity verification feature coming soon!", {
      icon: "🔍",
      duration: 3000,
    });
    // router.push("/verify-identity");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-8 mt-12 bg-white rounded-2xl shadow-lg border border-gray-100"
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
      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck
                className={`w-6 h-6 ${
                  user.isVerified ? "text-green-600" : "text-gray-400"
                }`}
              />
              <h3 className="text-lg font-semibold text-gray-800">
                Identity Verification
              </h3>
            </div>

            {user.isVerified ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
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
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              <ShieldCheck className="w-5 h-5" />
              Verify Identity
            </button>
          )}
        </div>
      </div>

      {user.role !== "seller" && (
        <div className="mt-6">
          <button
            onClick={handleRequestStore}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Store className="w-5 h-5" />
            Become a Seller
          </button>
        </div>
      )}

      <OrderHistory />

      <LogoutButton />
    </motion.div>
  );
}
