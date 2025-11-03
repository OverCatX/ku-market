"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-20 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2369773D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl relative z-10"
      >
        <h1 className="font-header text-4xl md:text-5xl text-[#69773D] mb-4">
          Welcome to KU Market
        </h1>
        <p className="font-body text-gray-600 mb-6 text-lg md:text-xl">
          Your one-stop platform for smarter trading and campus marketplace
          solutions
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketplace"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-white 
               bg-gradient-to-r from-[#4B5D34] to-[#7BAA5F] 
               shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-[#69773D]
               bg-white border-2 border-[#69773D] transition-all hover:bg-green-50"
          >
            Get Started
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
