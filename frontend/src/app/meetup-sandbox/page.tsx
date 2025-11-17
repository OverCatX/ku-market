"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const MeetupLeafletMap = dynamic(
  () => import("@/components/maps/MeetupLeafletMap"),
  { ssr: false }
);

const CAMPUS_CENTER = { lat: 13.8495, lng: 100.571 };

const PRESETS = [
  {
    label: "Main Gate (Ngamwongwan)",
    lat: 13.846995,
    lng: 100.568308,
  },
  {
    label: "KU Avenue Plaza",
    lat: 13.851944,
    lng: 100.573817,
  },
  {
    label: "Central Library Lawn",
    lat: 13.852583,
    lng: 100.571013,
  },
  {
    label: "Sriwattanawilai Dorm",
    lat: 13.840732,
    lng: 100.572632,
  },
];

export default function MeetupSandboxPage() {
  const [selectedPoint, setSelectedPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [note, setNote] = useState("");

  const payloadPreview = useMemo(() => {
    if (!selectedPoint) {
      return "null";
    }
    return JSON.stringify(
      {
        locationName: "Custom meetup point",
        note: note || undefined,
        coordinates: selectedPoint,
      },
      null,
      2
    );
  }, [note, selectedPoint]);

  const shareUrl = useMemo(() => {
    if (!selectedPoint) return "";
    const query = new URLSearchParams({
      lat: selectedPoint.lat.toString(),
      lng: selectedPoint.lng.toString(),
      note,
    });
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL ?? "https://ku-market.local";
    return `${origin}/meetup-sandbox?${query.toString()}`;
  }, [note, selectedPoint]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8f1] via-white to-[#eef4e6] py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2f3b11]">
            KU Meetup Playground
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Click on the map to drop a meetup pin within Kasetsart University
            (Bangkhen Campus). Use this sandbox to test the self pick-up flow
            before wiring it into the real checkout.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">
          <div className="h-[420px] rounded-3xl border border-[#dfe7cf] bg-white/90 shadow-lg shadow-[#d2ddc1]/40 overflow-hidden">
            <MeetupLeafletMap
              position={
                selectedPoint
                  ? [selectedPoint.lat, selectedPoint.lng]
                  : [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]
              }
              onPositionChange={(value) => {
                setSelectedPoint(value);
                toast.success("Meetup point updated", { icon: "📍" });
              }}
            />
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-[#dfe7cf] bg-white/95 p-4 sm:p-5 shadow">
              <h2 className="text-lg font-semibold text-[#394720]">
                Quick presets
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Select one of the popular in-campus spots or drop your own.
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSelectedPoint({ lat: preset.lat, lng: preset.lng });
                      toast.success(`Pinned ${preset.label}`, {
                        icon: "📍",
                      });
                    }}
                    className="rounded-full border border-[#cddab6] px-3 py-1 text-xs font-medium text-[#3f4e24] hover:bg-[#f0f6e5] transition"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPoint(null);
                    toast("Marker cleared");
                  }}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Clear marker
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfe7cf] bg-white/95 p-4 sm:p-5 shadow space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#394720]">
                  Selected coordinates
                </h3>
                {selectedPoint ? (
                  <div className="mt-1 font-mono text-xs sm:text-sm bg-[#f6f9f1] border border-[#e0ebcd] rounded-lg px-3 py-2 text-[#2f3b11]">
                    <div>Lat: {selectedPoint.lat.toFixed(6)}</div>
                    <div>Lng: {selectedPoint.lng.toFixed(6)}</div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Tap the map to place a marker inside KU campus.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="meetup-note"
                  className="text-sm font-semibold text-[#394720]"
                >
                  Optional note for the seller
                </label>
                <textarea
                  id="meetup-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#dfe7cf] bg-[#f8fbef] px-3 py-2 text-sm text-[#2f3b11] focus:outline-none focus:ring-2 focus:ring-[#7da757]"
                  placeholder="e.g. I'll wait at the bench next to the Central Library entrance."
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#394720]">
                  Shareable JSON payload
                </label>
                <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-[#dfe7cf] bg-[#f6f9f1] p-3 text-xs text-[#2f3b11]">
{`{
  "pickupDetails": ${payloadPreview}
}`}
                </pre>
              </div>

              {shareUrl && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(shareUrl)
                      .then(() => toast.success("Copied share link!"))
                      .catch(() =>
                        toast.error("Unable to copy link to clipboard")
                      );
                  }}
                  className="w-full rounded-xl bg-[#4c5c2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a4b23] transition"
                >
                  Copy share link
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e4ecd7] bg-white/90 p-6 shadow">
          <h2 className="text-lg font-semibold text-[#394720] mb-3">
            Usage notes
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li>
              Tiles are served by OpenStreetMap (free) — suitable for internal
              testing, not production-level SLA.
            </li>
            <li>
              Click outside the Bangkhen campus bounds triggers a warning and
              cancels the drop.
            </li>
            <li>
              Copy the JSON snippet directly into checkout requests while the
              real map integration is work-in-progress.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

