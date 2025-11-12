"use client";

import { aboutColors } from "@/components/aboutus/SectionColors";
import ReportForm from "@/components/report/ReportForm";
import { MotionFadeIn } from "@/components/aboutus/MotionFadeIn";

export default function ReportPage() {
  return (
    <main
      className="min-h-screen w-full"
      style={{ backgroundColor: aboutColors.creamBg }}
    >
      {/* Header Section */}
      <section
        className="w-full"
        style={{ backgroundColor: aboutColors.oliveDark }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 text-[#F6F2E5]">
          <h1
            className="text-2xl md:text-3xl font-bold leading-tight mb-3"
            style={{ color: aboutColors.creamSoft }}
          >
            Report an Issue
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-2xl">
            Help us keep KU Market safe and reliable.  
            You can report inappropriate behavior, scam attempts, or broken features here.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <MotionFadeIn delay={0.2}>
        <ReportForm />
      </MotionFadeIn>

      {/* Footer */}
      <footer
        className="text-center text-[11px] text-slate-500 py-8 border-t"
        style={{ borderColor: aboutColors.borderSoft }}
      >
        KU Market · Report Center · {new Date().getFullYear()}
      </footer>
    </main>
  );
}