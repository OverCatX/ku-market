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

      {/* CTA block */}
      <section
        className="w-full border-t"
        style={{
          backgroundColor: aboutColors.oliveDark,
          borderColor: aboutColors.borderSoft,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <p
            className="text-base md:text-lg font-semibold mb-4"
            style={{ color: aboutColors.creamBg }}
          >
            Ready to try ?
          </p>

          <p className="text-sm md:text-base text-slate-700 mb-6"
           style={{
            color: aboutColors.creamSoft,
          }}>
            Browse real listings from KU students. Ask questions. Meet on campus.
          </p>

          <a
            href="/marketplace"
            className="inline-block rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: aboutColors.yellowBright,
              color: aboutColors.brown,
            }}
          >
            Explore Marketplace →
          </a>
        </div>
      </section>

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