"use client";

import { motion } from "framer-motion";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function FeaturedProducts() {
  return (
    <section id="featured-products" className="py-20 px-6 md:px-20 bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
        className="max-w-6xl mx-auto text-center"
      >
        <h2 className="font-header text-3xl md:text-4xl text-[#69773D] mb-8">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
              }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 rounded-xl p-6 cursor-pointer"
            >
              <div className="h-48 bg-gray-300 rounded-lg mb-4 animate-pulse"></div>
              <h3 className="font-header text-xl mb-2 text-[#69773D]">
                Product {item}
              </h3>
              <p className="text-gray-600">
                Quick description of product {item}.
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
