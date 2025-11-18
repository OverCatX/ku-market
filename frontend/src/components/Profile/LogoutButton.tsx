"use client";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();

    toast.success("Logged out successfully");

    // Redirect then refresh to clear all state
    router.replace("/login");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="mt-10">
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-[#780606] text-white rounded-lg hover:bg-[#780606] shadow-sm hover:shadow-md transition"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
