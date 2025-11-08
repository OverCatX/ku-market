"use client";

import { aboutColors } from "@/components/aboutus/SectionColors";
import { MotionFadeIn } from "@/components/aboutus/MotionFadeIn";
import ReportItemForm from "@/components/report-item/ReportItemForm";

export default function ReportItemPage() {
  return (
    <main
      className="min-h-screen w-full"
      style={{ backgroundColor: aboutColors.creamBg }}
    >
      <section
        className="w-full"
        style={{ backgroundColor: aboutColors.oliveDark }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 text-[#F6F2E5]">
        {/* small pill label */}
        <div
          className="inline-block rounded-full px-6 py-3 text-base font-semibold mb-6 shadow-sm"
          style={{
            backgroundColor: aboutColors.brown,
            color: aboutColors.creamSoft,
          }}
        >
          report item
        </div>

          <h1
            className="text-2xl md:text-3xl font-bold leading-tight"
            style={{ color: aboutColors.creamSoft }}
          >
            Report an Item
          </h1>

          <p className="text-sm md:text-base text-creamSoft leading-relaxed max-w-4xl">
            Help us keep KU Market safe. If you find a suspicious or prohibited listing, please report it here.
          <br />
            Our team will review and take action.
          </p>
        </div>
      </section>

      <MotionFadeIn delay={0.1}>
        <section className="w-full">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <ReportItemForm />
          </div>
        </section>
      </MotionFadeIn>

      <footer
        className="text-center text-[11px] text-slate-500 py-8 border-t"
        style={{ borderColor: aboutColors.borderSoft }}
      >
        KU Market · community safety first
      </footer>
    </main>
  );
}