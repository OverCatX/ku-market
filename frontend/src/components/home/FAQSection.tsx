"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { faqData } from "@/constants/faq";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 md:px-20 bg-[#F6F2E5]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
        className="max-w-3xl mx-auto"
      >
        <h2 className="font-header text-3xl md:text-4xl text-[#69773D] mb-8 text-center">
          FAQ
        </h2>
        <div className="space-y-4">
          {faqData.map((faq, idx) => (
            <motion.div
              key={idx}
              layout
              className="bg-white rounded-xl cursor-pointer overflow-hidden shadow-sm"
              onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
              whileHover={{ scale: 1.02 }}
              transition={{ layout: { duration: 0.3, type: "spring" } }}
            >
              <div className="p-6 flex justify-between items-center">
                <h3 className="font-header text-xl text-[#69773D]">{faq.q}</h3>
                <span className="text-[#69773D] font-bold text-2xl">
                  {openFAQ === idx ? "-" : "+"}
                </span>
              </div>
              {openFAQ === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 text-[#4A5130]"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
