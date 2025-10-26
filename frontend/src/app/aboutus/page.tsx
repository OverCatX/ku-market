"use client";

import AboutHero from "@/components/aboutus/AboutHero";
import AboutWhy from "@/components/aboutus/AboutWhy";
import AboutHowItWorks from "@/components/aboutus/AboutHowItWorks";
import AboutTeamAndContact from "@/components/aboutus/AboutTeamContact";
import { aboutColors } from "@/components/aboutus/SectionColors";
import { MotionFadeIn } from "@/components/aboutus/MotionFadeIn";

export default function AboutUsPage() {
  return (
    <main
      style={{ backgroundColor: aboutColors.creamBg }}
      className="min-h-screen w-full"
    >
      {/* hero */}
      <MotionFadeIn delay={0.2}>
        <AboutHero />
      </MotionFadeIn>

      {/* why */}
      <MotionFadeIn delay={0.3}>
        <AboutWhy />
      </MotionFadeIn>

      {/* how */}
      <MotionFadeIn delay={0.4}>
        <AboutHowItWorks />
      </MotionFadeIn>

      {/* team & contact */}
      <MotionFadeIn delay={0.5}>
        <AboutTeamAndContact />
      </MotionFadeIn>

      {/* CTA */}
      <MotionFadeIn delay={0.6}>
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
              Ready to try it?
            </p>

            <p className="text-sm md:text-base text-slate-700 mb-6"
            style={{ color: aboutColors.creamBg }}>
              Browse real listings from KU students. Ask questions. Meet on campus.
            </p>

            <a
              href="/marketplace"
              className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition"
              style={{
                backgroundColor: aboutColors.yellowBright,
                color: aboutColors.brown,
              }}
            >
              Explore Marketplace →
            </a>
          </div>
        </section>
      </MotionFadeIn>

      {/* footer */}
      <footer
        className="text-center text-[11px] text-slate-500 py-8 border-t"
        style={{ borderColor: aboutColors.borderSoft }}
      >
        KU Market · built by KU students · {new Date().getFullYear()}
      </footer>
    </main>
  );
}