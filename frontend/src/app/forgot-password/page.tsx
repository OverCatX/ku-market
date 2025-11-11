"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { aboutColors } from "@/components/aboutus/SectionColors";

export default function ForgotPasswordPage() {
  const [open, setOpen] = useState(true);

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: aboutColors.creamBg }}
    >
      <Modal open={open} onClose={() => setOpen(false)}>
        <ForgotPasswordForm />
      </Modal>
    </main>
  );
}