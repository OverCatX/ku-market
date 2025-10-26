"use client";

import AboutHero from "@/components/aboutus/AboutHero";
import AboutWhy from "@/components/aboutus/AboutWhy";
import AboutTeamAndContact from "@/components/aboutus/AboutTeamContact";
import { aboutColors } from "@/components/aboutus/SectionColors";
import AboutHowItWorks from "@/components/aboutus/AboutHowItWorks";

export default function AboutUsPage() {
  return (
    <main
      style={{
        backgroundColor: aboutColors.creamBg,
      }}
      className="min-h-screen w-full"
    >
      {/* top hero section */}
      <AboutHero />

      {/* why we built this */}
      <AboutWhy />

      <footer
        className="text-center text-[11px] text-slate-500 py-8 border-t"
        style={{ borderColor: aboutColors.borderSoft }}
      ></footer>

      {/* how it works section */}
      <AboutHowItWorks/>

      {/* team + contact */}
      <AboutTeamAndContact />

      {/* tiny footer-ish line */}
      <footer
        className="text-center text-[11px] text-slate-500 py-8 border-t"
        style={{ borderColor: aboutColors.borderSoft }}
      >
        KU Market · built for KU students · {new Date().getFullYear()}
      </footer>
    </main>
  );
}