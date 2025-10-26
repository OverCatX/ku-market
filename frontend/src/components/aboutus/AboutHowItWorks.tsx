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

      <div
        className="flex-1 text-sm leading-relaxed"
        style={{ color: aboutColors.creamSoft }}
      >
        {text}
      </div>
    </div>
  );
}

export default function AboutHowItWorks() {
  return (
    <section
      className="w-full border-t -mt-[70px]"
      style={{
        backgroundColor: aboutColors.oliveDark,
        borderColor: aboutColors.borderSoft,
      }}
    >
      <div
        className="
          max-w-5xl mx-auto px-6
          pt-8 md:pt-10
          pb-12 md:pb-16
        "
      >
        <h2
          className="text-2xl md:text-3xl font-semibold mb-6"
          style={{ color: aboutColors.creamSoft }}
        >
          How KU Market works
        </h2>

        <div className="space-y-4">
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
            text="Meet up in a safe public spot. Pay in cash (COD) or any method you both trust."
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