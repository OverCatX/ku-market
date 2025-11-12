"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { aboutColors } from "@/components/aboutus/SectionColors";
import ReportItemSuccessModal from "@/components/report-item/ReportItemSuccessModal";
import { submitItemReport } from "@/config/reports";

type ReasonKey =
  | "scam"
  | "counterfeit"
  | "prohibited"
  | "misleading"
  | "spam"
  | "other";

type ReportItemPayload = {
  itemUrlOrId: string;
  reason: ReasonKey;
  details: string;
  contact?: string;
  images?: File[];
};

const REASONS: { key: ReasonKey; label: string }[] = [
  { key: "scam",        label: "Scam / Fraud" },
  { key: "counterfeit", label: "Counterfeit goods" },
  { key: "prohibited",  label: "Prohibited item" },
  { key: "misleading",  label: "Misleading information" },
  { key: "spam",        label: "Spam / Irrelevant" },
  { key: "other",       label: "Other" },
];

export default function ReportItemForm() {
  const [form, setForm] = useState<ReportItemPayload>({
    itemUrlOrId: "",
    reason: "scam",
    details: "",
    contact: "",
    images: [],
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const [previews, setPreviews] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const itemIdParam = searchParams?.get("itemId") ?? "";
  const titleParam = searchParams?.get("title") ?? "";
  const [didPrefill, setDidPrefill] = useState(false);
  const [detectedItemId, setDetectedItemId] = useState<string>("");
  const [prefilledTitle, setPrefilledTitle] = useState<string>("");

  const extractItemId = useMemo(
    () => (value: string): string | null => {
      const match = value.match(/[0-9a-fA-F]{24}/);
      return match ? match[0] : null;
    },
    []
  );

  useEffect(() => {
    if (didPrefill) return;
    if (!itemIdParam && !titleParam) return;
    setForm((prev) => {
      if (prev.itemUrlOrId) {
        setDidPrefill(true);
        return prev;
      }
      const labelParts: string[] = [];
      if (titleParam) labelParts.push(titleParam);
      if (itemIdParam) labelParts.push(`ID: ${itemIdParam}`);
      setDidPrefill(true);
      if (itemIdParam) {
        setDetectedItemId(itemIdParam);
      }
      if (titleParam) {
        setPrefilledTitle(titleParam);
      }
      return {
        ...prev,
        itemUrlOrId: labelParts.join(" • ") || prev.itemUrlOrId,
      };
    });
  }, [didPrefill, itemIdParam, titleParam]);

  useEffect(() => {
    if (!form.images?.length) {
      setPreviews([]);
      return;
    }
    const urls = form.images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [form.images]);

  function onAddMoreFiles(files: FileList | null) {
    if (!files) return;
    onChange("images", [ ...(form.images || []), ...Array.from(files) ]);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSuccess(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onChange<K extends keyof ReportItemPayload>(
    key: K,
    value: ReportItemPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "itemUrlOrId" && typeof value === "string") {
      const itemId = extractItemId(value);
      setDetectedItemId(itemId || "");
    }
  }

  function onFilesChange(files: FileList | null) {
    if (!files) return;
    onChange("images", Array.from(files));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.itemUrlOrId.trim()) {
      toast.error("Please provide the item URL or ID");
      return;
    }

    if (!form.details.trim()) {
      toast.error("Please provide report details");
      return;
    }

    const effectiveItemId =
      detectedItemId || extractItemId(form.itemUrlOrId) || itemIdParam;

    if (!effectiveItemId || effectiveItemId.length !== 24) {
      toast.error("Please provide a valid item URL or ID (24-character code)");
      return;
    }

    setSubmitting(true);
    try {
      await submitItemReport({
        itemId: effectiveItemId,
        reason: form.reason,
        details: form.details,
        contact: form.contact,
        title: prefilledTitle || titleParam || undefined,
        images: form.images,
      });

      setForm({
        itemUrlOrId: "",
        reason: "scam",
        details: "",
        contact: "",
        images: [],
      });
      setDetectedItemId("");
      setPrefilledTitle("");
      setShowSuccess(true);
      toast.success("Report submitted. Thank you for keeping KU Market safe.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit report";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Item reference */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: aboutColors.oliveDark }}
          >
            Item URL or ID <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.itemUrlOrId}
            onChange={(e) => onChange("itemUrlOrId", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            style={{ borderColor: aboutColors.borderSoft }}
            placeholder="Paste the marketplace item URL or 24-character item ID"
            required
          />
          <div className="mt-1 text-xs text-gray-500">
            {detectedItemId
              ? `Detected item ID: ${detectedItemId}`
              : "For example: https://ku-market/marketplace/<itemId>"}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: aboutColors.oliveDark }}>
            Reason <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <label
                key={r.key}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer"
                style={{ borderColor: aboutColors.borderSoft, backgroundColor: "#fff" }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.key}
                  checked={form.reason === r.key}
                  onChange={() => onChange("reason", r.key)}
                  className="accent-current"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: aboutColors.oliveDark }}>
            Details <span className="text-red-600">*</span>
          </label>
          <textarea
            value={form.details}
            onChange={(e) => onChange("details", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none min-h-[120px]"
            style={{ borderColor: aboutColors.borderSoft }}
            placeholder="Explain what looks suspicious or breaks the rules..."
          />
        </div>

        {/* Evidence (optional) */}
        <div>
        <label
            className="block text-sm font-medium mb-1"
            style={{ color: aboutColors.oliveDark }}
        >
            Additional images ( optional )
        </label>

        <div
            className="border rounded-md px-3 py-3 bg-white flex flex-col gap-3"
            style={{ borderColor: aboutColors.borderSoft }}
        >
            {previews.length === 0 ? (
            <>
                <label
                htmlFor="file-upload"
                className="mt-1 inline-block rounded-md bg-[#6b705c] px-4 py-2 text-sm font-medium text-white hover:opacity-90 self-start"
                >
                Choose files
                </label>

                <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFilesChange(e.target.files)}
                className="hidden"
                />

                <p className="text-xs text-slate-500 italic">
                PNG / JPG, up to 5MB each.
                </p>
            </>
            ) : (
            <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {previews.map((src, idx) => (
                    <div key={idx} className="relative group">
                        <Image
                        src={src}
                        alt={`evidence-${idx}`}
                        width={96}
                        height={96}
                        unoptimized
                        className="h-24 w-24 object-cover rounded-md border"
                        style={{ borderColor: aboutColors.borderSoft }}
                        />

                        <button
                        type="button"
                        onClick={() => {
                            const newPreviews = previews.filter((_, i) => i !== idx);
                            const newFiles = (form.images || []).filter((_, i) => i !== idx);
                            setPreviews(newPreviews);
                            onChange("images", newFiles);
                        }}
                        className="absolute -top-2 -right-0 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                        title="Remove"
                        >
                        ✕
                        </button>
                    </div>
                    ))}
                </div>

                <label
                htmlFor="file-upload-more"
                className="mt-1 inline-block rounded-md bg-[#6b705c] px-4 py-2 text-sm font-medium text-white hover:opacity-90 self-start"
                >
                Add more
                </label>
                <input
                id="file-upload-more"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onAddMoreFiles(e.target.files)}
                className="hidden"
                />
            </>
            )}
        </div>
        </div>

        {/* Contact (optional) */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: aboutColors.oliveDark }}>
            Contact ( optional )
          </label>
          <input
            type="text"
            value={form.contact ?? ""}
            onChange={(e) => onChange("contact", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            style={{ borderColor: aboutColors.borderSoft }}
            placeholder="Email or Line ID ( so we can follow up )"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60"
            style={{ backgroundColor: aboutColors.brown, color: aboutColors.creamSoft }}
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </form>

      {/* Success modal */}
      <ReportItemSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}