"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-20 bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2369773D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      {/* Soft gradient orbs */}
      <motion.div
        animate={{
          opacity: [0.3, 0.4, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-64 h-64 bg-green-100/10 rounded-full blur-3xl"
      ></motion.div>
      <motion.div
        animate={{
          opacity: [0.2, 0.3, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-100/10 rounded-full blur-3xl"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-header text-4xl md:text-5xl text-[#69773D] mb-4">
            Welcome to KU Market
          </h1>
          <p className="font-body text-[#4A5130] mb-8 text-lg md:text-xl leading-relaxed">
            Your one-stop platform for smarter trading and campus marketplace
            solutions
          </p>
        </motion.div>

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
               bg-white border-2 border-[#69773D] transition-all hover:bg-[#69773D]/10"
          >
            Get Started
          </Link>
        </div>
      </motion.div>

      {/* Scroll down arrow */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-10"
      >
        <a href="#featured-products" className="block">
          <div className="w-6 h-6 border-b-2 border-r-2 border-[#69773D] rotate-45"></div>
        </a>
      </motion.div>
    </section>
  );
}
