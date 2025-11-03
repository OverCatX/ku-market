"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listItems, Item } from "@/config/items";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function FeaturedProducts() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await listItems({
          page: 1,
          limit: 3,
          status: "available",
          sortBy: "createAt",
          sortOrder: "desc",
        });
        if (res.success && res.data.items) {
          setItems(res.data.items);
        }
      } catch (error) {
        console.error("Fetch featured items error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section id="featured-products" className="py-20 px-6 md:px-20 bg-white border-t border-gray-200">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="font-header text-3xl md:text-4xl text-[#69773D] mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover the latest items from fellow students
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No featured products available yet.</p>
            <Link
              href="/marketplace"
              className="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white rounded-xl overflow-hidden shadow-md border-2 border-gray-200 hover:border-[#69773D] hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                
                <Link href={`/marketplace/${item._id}`} className="block relative z-10">
                  <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-xl">
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    
                    {item.photo && item.photo.length > 0 ? (
                      <>
                        <Image
                          src={item.photo[0]}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        {/* View Details Badge on Hover */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[#69773D] text-xs font-semibold rounded-full shadow-xl border-2 border-[#69773D]">
                            View Details
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-green-100 group-hover:to-emerald-100 transition-colors duration-300">
                        <ShoppingBag className="w-16 h-16 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-green-700 text-xs font-semibold rounded-full shadow-lg border border-green-200">
                        {item.status === "available" ? "Available" : item.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t-2 border-gray-100 group-hover:border-green-200 transition-colors duration-300">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2 leading-tight group-hover:text-[#69773D] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xl font-bold text-[#69773D] group-hover:scale-110 transition-transform duration-300 inline-block">
                        ฿{item.price.toLocaleString()}
                      </div>
                    </div>
                    {item.category && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 group-hover:bg-green-100 group-hover:shadow-sm group-hover:border-green-300 transition-all duration-300">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-30 pointer-events-none rounded-xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/marketplace"
              className="relative inline-block px-8 py-4 bg-gradient-to-r from-[#4B5D34] to-[#7BAA5F] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden group"
            >
              <span className="relative z-10">View All Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#7BAA5F] to-[#4B5D34] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
