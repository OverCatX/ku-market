"use client";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authentication");
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  return (
    <div className="mt-10">
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm hover:shadow-md transition"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
