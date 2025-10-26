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
            KU Market is built by KU students who were tired of the <br />“ DM me ” culture
            and ghosted meetups.
            <br />
            <br />
            We’re focusing on:
            <br />• Safety ( verified KU accounts )
            <br />• Convenience ( chat, meet on campus )
            <br />• Sustainability ( reuse / rehome stuff instead of buying new )
          </p>
        </div>

        {/* ---------- Contact block (temporarily removed) ---------- */}
        
        {/* <div>
          <h3
            className="text-lg md:text-xl font-bold mb-3"
            style={{ color: aboutColors.oliveDark }}
          >
            Talk to us
          </h3>
          <p className="text-sm md:text-base leading-relaxed text-slate-700">
            Got feedback? <br /> Want to contact us?
            <br />
            <br />
            Drop us a message and we’ll get back:
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 w-16">email</span>
              <span className="text-slate-700 break-all">kumarket@ku.th</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 w-16">discord</span>
              <span className="text-slate-700">@ku-market</span>
            </div>
          </div>
        </div> */}
       
      </div>
    </section>
  );
}