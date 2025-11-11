"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  return (
    <div className="min-h-screen">
      <ResetPasswordModal
        open={open}
        token={token}
        onClose={() => {
          setOpen(false);
          router.push("/login");
        }}
      />
    </div>
  );
}