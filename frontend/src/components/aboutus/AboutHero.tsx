"use client";

import { aboutColors } from "./SectionColors";

export default function AboutHero() {
  return (
    <section
      className="w-full"
      style={{ backgroundColor: aboutColors.oliveDark }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 text-[#F6F2E5]">
        {/* small pill label */}
        <div className="inline-block rounded-full px-3 py-1 text-xs font-medium mb-4"
          style={{
            backgroundColor: aboutColors.brown,
            color: aboutColors.creamSoft,
          }}
        >
          about KU Market
        </div>

        {/* headline */}
        <h1
          className="text-2xl md:text-3xl font-bold leading-tight"
          style={{ color: aboutColors.creamSoft }}
        >
          A safer way for KU students to buy & sell.
        </h1>

        {/* sub text */}
        <p
          className="mt-3 text-sm md:text-base leading-relaxed max-w-2xl"
          style={{ color: aboutColors.creamSoft }}
        >
          KU Market is a campus's marketplace where students can trade and sell
          second-hand items like bags, hoodies, notes, plants, snacks or anything  
           —  in a safe and trusted way. No random strangers. No sketchy meetups.
          Just KU students helping KU students.
        </p>
      </div>
    </section>
  );
}