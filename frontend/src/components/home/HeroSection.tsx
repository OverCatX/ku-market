"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-20 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center max-w-2xl"
      >
        <h1 className="font-header text-4xl md:text-5xl text-[#69773D] mb-4">
          Welcome to KU Market
        </h1>
        <p className="font-body text-gray-600 mb-6 text-lg md:text-xl">
          Your one-stop platform for smarter trading and campus marketplace
          solutions
        </p>
        <a
          href="/login"
          className="relative inline-block px-8 py-4 rounded-xl font-semibold text-white 
             bg-gradient-to-r from-[#4B5D34] to-[#7BAA5F] 
             shadow-lg overflow-hidden transition-all transform 
             hover:scale-105 hover:shadow-2xl 
             before:absolute before:top-0 before:left-[-75%] before:w-2/3 before:h-full 
             before:bg-white before:opacity-20 before:rotate-12 before:blur-xl 
             before:transition-all before:duration-700 hover:before:left-[125%]"
        >
          <span className="relative z-10">Get Started</span>
        </a>
      </motion.div>

      {/* Scroll down arrow */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-10"
      >
        <div className="w-6 h-6 border-b-2 border-r-2 border-[#69773D] rotate-45 mx-auto animate-bounce"></div>
      </motion.div>
    </section>
  );
}
