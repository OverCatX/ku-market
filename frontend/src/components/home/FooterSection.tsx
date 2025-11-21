"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        {/* Left: Brand info */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-header text-xl text-[#69773D]">KU Market</h3>
          <p className="text-gray-600 text-sm">
            A smarter way to buy, sell, and connect on campus.
          </p>
        </div>

        {/* Right: Links and copyright */}
        <div className="flex flex-col md:items-end space-y-2">
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-[#69773D] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#69773D] transition-colors">
              Terms of Service
            </Link>
            <Link href="/report" className="hover:text-[#69773D] transition-colors">
              Contact Us
            </Link>
          </div>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} KU Market. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
