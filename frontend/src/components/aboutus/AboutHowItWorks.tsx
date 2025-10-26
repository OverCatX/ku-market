"use client";

import { aboutColors } from "./SectionColors";

function StepItem({
  step,
  text,
}: {
  step: string;
  text: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-2">
      <div
        className="h-7 w-7 flex items-center justify-center rounded-full text-[11px] font-semibold shrink-0"
        style={{
          backgroundColor: aboutColors.brown,
          color: aboutColors.creamSoft,
        }}
      >
        {step}
      </div>
      <div className="flex-1 text-slate-700 text-sm leading-relaxed">
        {text}
      </div>
    </div>
  );
}

export default function AboutHowItWorks() {
  return (
    <section
        className="w-full"
        style={{ backgroundColor: aboutColors.oliveDark }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-12">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
          How KU Market works
        </h2>

        <div className="space-y-4 text-sm leading-relaxed text-slate-700">
          <StepItem
            step="1"
            text="Browse items in Marketplace. Hoodies, student merch, notes, stationery, handmade stuff, etc."
          />
          <StepItem
            step="2"
            text='Chat with the seller. Ask “Is this still available?” or “Can we meet at KU gate today 5pm?”'
          />
          <StepItem
            step="3"
            text="Meet up in a safe public spot. Pay in cash (COD) or other method you both agree on."
          />
          <StepItem
            step="4"
            text="Done. No shipping drama. No platform fee between students."
          />
        </div>
      </div>
    </section>
  );
}