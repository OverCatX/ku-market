"use client";
import { motion, AnimatePresence } from "framer-motion";
import { aboutColors } from "@/components/aboutus/SectionColors";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
          >
            {children}
            {onClose && (
            <button
              onClick={onClose}
              className="
                absolute top-2 right-2
                flex items-center justify-center
                w-8 h-8 rounded-md
                text-2xl
                hover:bg-black/10
                transition
              "
              aria-label="Close"
              style={{ color: aboutColors.creamSoft }}
            >
              ×
            </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}