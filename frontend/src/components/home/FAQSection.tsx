"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { faqData } from "@/constants/faq";
import { ChevronDown } from "lucide-react";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 md:px-20 bg-white border-t border-gray-200">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="font-header text-3xl md:text-4xl text-[#69773D] mb-4">
            FAQ
          </h2>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, idx) => (
            <motion.div
              key={idx}
              layout
              className="bg-gray-100 rounded-xl overflow-hidden shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                className="w-full p-6 flex justify-between items-center text-left"
              >
                <h3 className="font-header text-xl text-[#69773D] pr-4">
                  {faq.q}
                </h3>
                <motion.div
                  animate={{ rotate: openFAQ === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-[#69773D]" />
                </motion.div>
              </button>
              {openFAQ === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 text-gray-700 leading-relaxed"
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
