"use client";

import { aboutColors } from "./SectionColors";

export default function AboutTeamAndContact() {
  return (
    <section
      className="w-full border-t"
      style={{
        backgroundColor: aboutColors.creamBg,
        borderColor: aboutColors.borderSoft,
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10">
        {/* ---------- Team block ---------- */}
        <div>
          <h3
            className="text-lg md:text-xl font-bold mb-3"
            style={{ color: aboutColors.oliveDark }}
          >
            The team
          </h3>
          <p className="text-sm md:text-base leading-relaxed text-slate-700">
            KU Market is built by KU students who were tired of the <br />“DM me” culture
            and ghosted meetups.
            <br />
            <br />
            We’re focusing on:
            <br />• Safety (verified KU accounts)
            <br />• Convenience (chat, meet on campus)
            <br />• Sustainability (reuse / rehome stuff instead of buying new)
          </p>
        </div>
       
      </div>
    </section>
  );
}