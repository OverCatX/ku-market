"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export const MotionFadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Ensure we never block initial render: show static content, then animate on client
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.max(0, delay) }}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
};