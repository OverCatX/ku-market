"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Category = "Electronics" | "Books" | "Fashion" | "Dorm" | "Other";
type Condition = "New" | "Like New" | "Good" | "Fair";
type Delivery = "Meet-up" | "Shipping" | "Both";

const MAX_IMAGES = 3;
const GREEN = "#69773D";
const LIGHT = "#f7f4f1";

export default function NewItemPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<string>("");
  const [qty, setQty] = useState<string>("");
  const [category, setCategory] = useState<Category>("Other");
  const [condition, setCondition] = useState<Condition>("Good");
  const [delivery, setDelivery] = useState<Delivery>("Meet-up");
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [priceError, setPriceError] = useState<string | null>(null);
  const [qtyError, setQtyError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  // --- image handling ---
  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    const next: File[] = [];
    for (const f of files) {
      if (images.length + next.length >= MAX_IMAGES) break;
      if (!/^image\//.test(f.type)) continue;
      if (f.size > 5 * 1024 * 1024) continue;
      next.push(f);
    }
    setImages((prev) => [...prev, ...next]);
    e.currentTarget.value = "";
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    if (currentIndex >= images.length - 1) setCurrentIndex(0);
  }
  const previews = useMemo(
    () => images.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [images]
  );

  // --- slider controls ---
  function nextImage() {
    setCurrentIndex((prev) => (prev + 1) % previews.length);
  }
  function prevImage() {
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);
  }

  // --- input validation ---
  function handlePriceChange(val: string) {
    setPrice(val);
    if (val.trim() === "" || isNaN(Number(val))) {
      setPriceError("Please enter number");
    } else {
      setPriceError(null);
    }
  }
  function handleQtyChange(val: string) {
    setQty(val);
    if (val.trim() === "" || isNaN(Number(val))) {
      setQtyError("Please enter number");
    } else if (Number(val) < 1) {
      setQtyError("Quantity must be ≥ 1");
    } else {
      setQtyError(null);
    }
  }

  // --- submit ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!title.trim() || !desc.trim() || !price.trim() || !qty.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (priceError || qtyError) {
      setError("Fix the errors before submitting.");
      return;
    }

    const p = Number(price);
    const q = Number(qty);

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", desc.trim());
      form.append("price", String(p));
      form.append("quantity", String(q));
      form.append("category", category);
      form.append("condition", condition);
      form.append("delivery", delivery);
      images.forEach((f) => form.append("images", f, f.name));

      const res = await fetch(`${apiBase}/items/create`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        // try to read text for a clearer backend error message
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Request failed with status ${res.status}`);
      }

      setOk(true);
      setTitle("");
      setDesc("");
      setPrice("");
      setQty("");
      setCategory("Other");
      setCondition("Good");
      setDelivery("Meet-up");
      setImages([]);
      setCurrentIndex(0);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F6F2E5' }}>
      {/* Top bar */}
      <motion.div
        {...{ initial: { opacity: 0 }, animate: { opacity: 1 } }}
        className="w-full"
        style={{ background: GREEN }}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 text-white font-medium">
          Add Item
        </div>
      </motion.div>

      <motion.div
        {...{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
        className="mx-auto max-w-6xl px-6 py-6 bg-white rounded-2xl shadow mt-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* LEFT: slideshow + insert boxes */}
            <div>
              {/* big slideshow display */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgba(122,74,34,0.3)] flex items-center justify-center bg-gray-50">
                {previews.length > 0 ? (
                  <motion.img
                    key={previews[currentIndex].url}
                    src={previews[currentIndex].url}
                    alt={`preview-${currentIndex}`}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                ) : (
                  <EmptyImage />
                )}

                {previews.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* dots */}
              {previews.length > 1 && (
                <div className="flex justify-center mt-3 gap-2">
                  {previews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      type="button"
                      className={`w-3 h-3 rounded-full ${
                        i === currentIndex
                          ? "bg-[rgba(122,74,34,0.9)]"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* insert boxes */}
              <div className="mt-6 grid grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className="aspect-square rounded-2xl border-2"
                    style={{ borderColor: GREEN }}
                  >
                    {previews[i] ? (
                      <div className="relative h-full w-full overflow-hidden rounded-2xl">
                        <Image
                          src={previews[i].url}
                          alt={`img-${i}`}
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => setCurrentIndex(i)}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={i === 0} // preload รูปแรก
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 text-xs bg-white/90 border px-2 py-1 rounded"
                        >
                          remove
                        </button>
                      </div>
                    ) : (
                      <label className="h-full w-full flex items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onFilesChange}
                        />
                        <PlusMark color={GREEN} />
                      </label>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT: details */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 break-words leading-tight">
                {title.trim() ? title : "Your Item Title"}
              </h1>

              {/* Condition + Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <CustomSelect<Condition>
                  label="Condition"
                  value={condition}
                  options={["New", "Like New", "Good", "Fair"]}
                  onChange={setCondition}
                />
                <CustomSelect<Delivery>
                  label="Delivery"
                  value={delivery}
                  options={["Meet-up", "Shipping", "Both"]}
                  onChange={setDelivery}
                />
              </div>

              {/* Title + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title<span className="text-[#780606]">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border p-3 outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="eg. iPad 9th Gen"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (THB)<span className="text-[#780606]">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-xl border p-3 outline-none ${
                      priceError ? "border-[#780606]" : ""
                    }`}
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="120"
                    required
                  />
                  {priceError && (
                    <p className="text-sm text-[#780606]">{priceError}</p>
                  )}
                </div>
              </div>

              {/* Category + Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <CustomSelect<Category>
                  label="Category"
                  value={category}
                  options={["Electronics", "Books", "Fashion", "Dorm", "Other"]}
                  onChange={setCategory}
                />
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity<span className="text-[#780606]">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-xl border p-3 outline-none ${
                      qtyError ? "border-[#780606]" : ""
                    }`}
                    value={qty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    placeholder="1"
                    required
                  />
                  {qtyError && (
                    <p className="text-sm text-[#780606]">{qtyError}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Description<span className="text-[#780606]">*</span>
                </label>
                <textarea
                  className="w-full min-h-[120px] rounded-xl border p-3 outline-none"
                  placeholder="Condition, meet-up place, extra details…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -1 }}
                className="rounded-xl px-6 py-3 font-semibold text-white shadow disabled:opacity-60"
                style={{ background: GREEN }}
              >
                {submitting ? "Adding…" : "Add to Marketplace"}
              </motion.button>

              {error && <p className="mt-3 text-sm text-[#780606]">{error}</p>}
              {ok && (
                <p className="mt-3 text-sm text-green-600">Item posted! 🎉</p>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------- helpers ---------- */
function EmptyImage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[rgba(0,0,0,0.03)]">
      <span className="text-gray-400">No image selected</span>
    </div>
  );
}
function PlusMark({ color }: { color: string }) {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* ---------- Custom Select ---------- */
function useOutsideClose<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClose: () => void
) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onClose]);
}

function ChevronDown({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function CustomSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div ref={ref}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-xl border p-3 text-left flex items-center justify-between hover:border-[rgba(122,74,34,0.7)] transition"
        >
          <span>{String(value)}</span>
          <ChevronDown
            className={`ml-2 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 right-0 z-20 mt-1 rounded-xl border bg-white shadow-lg overflow-hidden"
            >
              {options.map((opt) => {
                const isSelected = opt === value;
                return (
                  <li
                    key={String(opt)}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between
                                ${
                                  isSelected
                                    ? "font-medium text-[rgba(122,74,34,0.95)]"
                                    : "text-gray-700"
                                }`}
                  >
                    <span>{String(opt)}</span>
                    {isSelected && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
