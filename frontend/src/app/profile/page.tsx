"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/config/profile";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Store } from "lucide-react";

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

      {user.role !== "seller" && (
        <div className="mt-8">
          <button
            onClick={handleRequestStore}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-sm hover:shadow-md"
          >
            <Store className="w-5 h-5" />
            Request to Open Store
          </button>
        </div>
      )}

      <OrderHistory />

      <LogoutButton />
    </motion.div>
  );
}
