"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [profile, setProfile] = useState({
    name: "Buyer",
    faculty: "Faculty of Science",
    email: "buyer@ku.th",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    setLoadingOrders(true);
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          item: "iPad 9th Gen",
          date: "2025-09-18",
          price: 12000,
          status: "Completed",
        },
        {
          id: "2",
          item: "Textbook: Math 101",
          date: "2025-09-15",
          price: 500,
          status: "Pending",
        },
      ]);
      setLoadingOrders(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSaveProfile = () => setEditing(false);

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
