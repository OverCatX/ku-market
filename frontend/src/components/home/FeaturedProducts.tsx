"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listItems, Item } from "@/config/items";
import { getReviewSummary } from "@/config/reviews";
import { ShoppingBag } from "lucide-react";
import ItemCard from "../Marketplace/ItemCard";

const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

interface ItemWithRating extends Item {
  rating?: number;
  totalReviews?: number;
}

export default function FeaturedProducts() {
  const [items, setItems] = useState<ItemWithRating[]>([]);
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
          // Fetch ratings for each item
          const itemsWithRatings = await Promise.all(
            res.data.items.map(async (item) => {
              try {
                const summary = await getReviewSummary(item._id);
                return {
                  ...item,
                  rating: summary.averageRating,
                  totalReviews: summary.totalReviews,
                };
              } catch {
                // If review summary fails, return item without rating
                return {
                  ...item,
                  rating: 0,
                  totalReviews: 0,
                };
              }
            })
          );
          setItems(itemsWithRatings);
        } else {
          // If API call failed, show empty state
          setItems([]);
        }
      } catch (error) {
        // Only log non-AbortError errors
        if (error instanceof Error && error.name !== "AbortError") {
          console.warn("Fetch featured items error:", error);
        }
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section
      id="featured-products"
      className="py-20 px-6 md:px-20 bg-[#F6F2E5] border-t border-gray-200"
    >
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
          <p className="text-[#4A5130] text-lg max-w-2xl mx-auto">
            Discover the latest items from fellow students
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <ShoppingBag className="w-16 h-16 text-[#4A5130] mx-auto mb-4" />
            <p className="text-[#4A5130] text-lg">
              No featured products available yet.
            </p>
            <Link
              href="/marketplace"
              className="inline-block mt-4 px-8 py-4 rounded-xl font-semibold text-white 
               bg-gradient-to-r from-[#4B5D34] to-[#7BAA5F] 
               shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Link
                  href={`/marketplace/${item._id}`}
                  className="block h-full"
                >
                  <ItemCard
                    id={item._id}
                    title={item.title}
                    description={item.description}
                    price={item.price}
                    photo={item.photo[0] || ""}
                    status={item.status}
                    rating={item.rating}
                    totalReviews={item.totalReviews}
                  />
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
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#4B5D34] to-[#7BAA5F] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              View All Products
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
