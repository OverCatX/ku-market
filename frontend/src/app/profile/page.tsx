"use client";

import { User, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen mt-15 p-8 ">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-600 p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center space-y-4 lg:min-w-[200px]">
              <div className="w-32 h-32 bg-green-300 border-4 border-gray-300 shadow-md rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-green-800" />
              </div>
              <h2 className="text-2xl font-semibold text-green-900">Buyer</h2>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-2 bg-red-200/80 hover:bg-red-300/80 text-red-900 border border-red-300 rounded-xl px-4 py-2 font-medium shadow-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Profile Form Section */}
            <div className="flex-1 space-y-6">
              <div className="bg-white/80 border border-gray-500 p-6 rounded-2xl shadow-xl">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-green-900 font-medium text-sm"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full bg-green-100/70 border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-xl h-12 px-4 text-green-900 placeholder-green-600"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="faculty"
                      className="block text-green-900 font-medium text-sm"
                    >
                      Faculty
                    </label>
                    <input
                      id="faculty"
                      type="text"
                      className="w-full bg-green-100/70 border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-xl h-12 px-4 text-green-900 placeholder-green-600"
                      placeholder="Enter your faculty"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-green-900 font-medium text-sm"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full bg-green-100/70 border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-xl h-12 px-4 text-green-900 placeholder-green-600"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="bg-green-200/80 hover:bg-green-300/80 text-green-900 border border-green-300 rounded-xl px-6 py-2 font-medium shadow-sm flex items-center gap-2 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Seller
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
