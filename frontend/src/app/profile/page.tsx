"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, ProfileData, updateProfile } from "@/config/profile";
import ProfileSidebar from "@/components/Profile/ProfileSidebar";
import ProfileForm from "@/components/Profile/ProfileForm";
import OrdersSection from "@/components/Profile/OrdersSection";

interface Order {
  id: string;
  item: string;
  date: string;
  price: number;
  status: "Completed" | "Pending" | "Cancelled";
}

export default function ProfilePage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    faculty: "",
    email: "",
    contact: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    getProfile(token)
      .then(setProfile)
      .catch((err) => console.error("Failed to fetch profile:", err));

    // (optional) mock orders
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          item: "Coffee A",
          date: "2025-10-04",
          price: 80,
          status: "Completed",
        },
        {
          id: "2",
          item: "Coffee B",
          date: "2025-10-03",
          price: 60,
          status: "Pending",
        },
      ]);
      setLoadingOrders(false);
    }, 800);
  }, [router]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const updated = await updateProfile(token, {
        name: profile.name,
        faculty: profile.faculty,
        contact: profile.contact,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unexpected error occurred:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <ProfileSidebar profile={profile} onLogout={handleLogout} />
          <div className="flex-1 space-y-6">
            <ProfileForm
              profile={profile}
              setProfile={setProfile}
              editing={editing}
              setEditing={setEditing}
              onSave={handleSaveProfile}
            />
            <OrdersSection orders={orders} loading={loadingOrders} />
          </div>
        </div>
      </div>
    </div>
  );
}
