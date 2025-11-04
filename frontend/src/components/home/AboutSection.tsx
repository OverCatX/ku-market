"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Users, Shield, TrendingUp } from "lucide-react";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const features = [
  {
    icon: ShoppingBag,
    title: "Easy Trading",
    description: "Buy and sell items with just a few clicks. Simple, fast, and secure.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Campus Community",
    description: "Connect with fellow KU students. Build trust within your campus network.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Verified student accounts and secure transactions. Your safety is our priority.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Great Deals",
    description: "Discover amazing deals from your peers. Save money while supporting your community.",
    color: "from-orange-500 to-red-500",
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-6 md:px-20 bg-gray-50 border-t border-gray-200">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="font-header text-3xl md:text-4xl text-[#69773D] mb-4">
            What is KU Market?
          </h2>
          <p className="font-body text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            KU Market is a campus marketplace where students can buy, sell, and
            trade items easily. Connect with fellow students, discover great
            deals, and enjoy a smarter way to shop on campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
