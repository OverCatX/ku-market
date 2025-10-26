"use client";

import { aboutColors } from "./SectionColors";

export default function AboutWhy() {
  return (
    <section
      className="w-full border-t border-b"
      style={{
        backgroundColor: aboutColors.creamBg,
        borderColor: aboutColors.borderSoft,
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <h2
          className="text-xl md:text-2xl font-bold mb-4"
          style={{ color: aboutColors.oliveDark }}
        >
          Why did we build this?
        </h2>

        <p className="text-sm md:text-base leading-relaxed text-slate-700 max-w-3xl">
          Before KU Market, buying and selling on campus usually meant random
          Line groups, IG stories, or asking friends-of-friends. It was slow,
          messy, and sometimes unsafe.
        </p>

        <p className="text-sm md:text-base font-semibold mt-6 mb-3 text-slate-800"
        style={{ color: aboutColors.oliveDark }}>
          We want a marketplace built by students, for students:
        </p>

        <ul className="text-sm md:text-base leading-relaxed text-slate-700 max-w-3xl space-y-2">
          <li>• A space where trust matters more than profit.</li>
          <li>• You can meet up in a public spot on campus ( not somewhere weird ).</li>
          <li>• You’re talking to other KU students — not strangers.</li>
          <li>• A small step towards a more sustainable KU campus.</li>
        </ul>
      </div>
    </section>
  );
}