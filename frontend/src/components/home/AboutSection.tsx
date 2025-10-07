"use client";

import { motion } from "framer-motion";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function AboutSection() {
  return (
    <section className="py-20 px-6 md:px-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="font-header text-3xl md:text-4xl text-[#69773D] mb-6">
          What is KU Market?
        </h2>
        <p className="font-body text-gray-700 text-lg md:text-xl">
          KU Market is a campus marketplace where students can buy, sell, and
          trade items easily. Connect with fellow students, discover great
          deals, and enjoy a smarter way to shop on campus.
        </p>
      </motion.div>
    </section>
  );
}
