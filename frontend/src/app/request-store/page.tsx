"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface StoreRequestForm {
  storeName: string;
  description: string;
  category: string;
  contact: string;
  logo: File | null;
  reason: string;
  confirmed?: boolean;
}

type Step = 1 | 2 | 3 | 4;

export default function RequestToOpenStore() {
  const router = useRouter();
  const [form, setForm] = useState<StoreRequestForm>({
    storeName: "",
    description: "",
    category: "",
    contact: "",
    logo: null,
    reason: "",
    confirmed: false,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const mainDark = "#4B5D34";
  const mainLight = "#7BAA5F";
  const borderColor = "#a0c16d";

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
      setLogoPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeLogo = () => {
    setForm((prev) => ({ ...prev, logo: null }));
    setLogoPreview(null);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.storeName.trim())
        newErrors.storeName = "Store Name is required";
      if (!form.description.trim())
        newErrors.description = "Description is required";
      if (!form.reason.trim()) newErrors.reason = "Reason is required";
      if (!form.category) newErrors.category = "Category is required";
    }
    if (step === 2) {
      if (!form.contact.trim()) newErrors.contact = "Contact is required";
    }
    if (step === 3) {
      if (!form.confirmed)
        newErrors.confirmed = "Please confirm the information";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  };

  const prevStep = () =>
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1500);
  };

  const steps = ["Info", "Contact & Logo", "Review", "Status"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-200"
      >
        {/* Header */}
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 relative px-2"
          style={{ color: mainDark }}
        >
          Request to Open Your Store
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 md:mb-10 px-1 sm:px-2 relative">
          {/* Background Line */}
          <div className="absolute top-3 sm:top-4 md:top-5 left-[10%] right-[10%] sm:left-[12.5%] sm:right-[12.5%] h-0.5 md:h-1 bg-gray-300 rounded" />
          {/* Progress Line */}
          <motion.div
            className="absolute top-3 sm:top-4 md:top-5 left-[10%] sm:left-[12.5%] h-0.5 md:h-1 rounded"
            style={{
              background: `linear-gradient(to right, ${mainDark}, ${mainLight})`,
            }}
            animate={{
              width: `${((step - 1) / (steps.length - 1)) * 80}%`,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          {/* Step Circles */}
          {steps.map((label, idx) => {
            const isCurrent = step - 1 === idx;
            const done = step - 1 > idx;
            return (
              <div
                key={idx}
                className="relative flex-1 flex flex-col items-center z-10 min-w-0"
              >
                <motion.div
                  animate={{
                    backgroundColor: done
                      ? mainLight
                      : isCurrent
                      ? mainDark
                      : "#d1d5db",
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-bold shadow-md border-2 sm:border-3 md:border-4 border-white flex-shrink-0"
                >
                  {idx + 1}
                </motion.div>
                <span
                  className={`mt-1 sm:mt-2 text-[8px] sm:text-[10px] md:text-xs font-semibold text-center leading-tight px-1 ${
                    done || isCurrent ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form / Content */}
        <AnimatePresence mode="wait">
          {step < 4 && (
            <motion.form
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* Step 1 */}
              {step === 1 && (
                <>
                  {/* Store Name */}
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Store Name
                    </label>
                    <input
                      name="storeName"
                      value={form.storeName}
                      onChange={handleChange}
                      placeholder="Enter store name"
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.storeName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.storeName}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your store..."
                      rows={3}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    >
                      <option value="">Select category</option>
                      <option value="Food">Food</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Why do you want to open this store?
                    </label>
                    <textarea
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      placeholder="Explain your reason for opening the store..."
                      rows={3}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.reason}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  {/* Contact */}
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Contact Info
                    </label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="Email or phone number"
                      className={`w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1`}
                      style={{
                        backgroundColor: "white",
                        borderColor: borderColor,
                        color: mainDark,
                      }}
                    />
                    {errors.contact && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs sm:text-sm mt-1"
                      >
                        {errors.contact}
                      </motion.p>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Upload Logo (Optional)
                    </label>

                    {!logoPreview ? (
                      <label
                        className="w-full p-6 sm:p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-opacity-80 flex flex-col items-center justify-center gap-2"
                        style={{ borderColor: borderColor }}
                      >
                        <Upload size={32} style={{ color: mainLight }} />
                        <span className="text-sm text-gray-600">
                          Click to upload logo
                        </span>
                        <span className="text-xs text-gray-400">
                          PNG, JPG up to 5MB
                        </span>
                        <input
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full"
                      >
                        <div className="relative w-full h-48 sm:h-64 rounded-lg border overflow-hidden shadow-md bg-gray-50">
                          <Image
                            src={logoPreview}
                            alt="logo preview"
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 768px"
                          />
                          {/* Overlay Buttons */}
                          <div className="absolute top-2 right-2 flex gap-2 z-10">
                            <button
                              type="button"
                              onClick={() => setShowImageModal(true)}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
                            >
                              <ZoomIn size={18} style={{ color: mainDark }} />
                            </button>
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all"
                            >
                              <X size={18} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {form.logo?.name}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3
                    className="text-base sm:text-lg font-semibold mb-3"
                    style={{ color: mainDark }}
                  >
                    Review & Confirm
                  </h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="break-words">
                      <strong>Store Name:</strong> {form.storeName}
                    </li>
                    <li className="break-words">
                      <strong>Description:</strong> {form.description}
                    </li>
                    <li>
                      <strong>Category:</strong> {form.category}
                    </li>
                    <li className="break-words">
                      <strong>Contact:</strong> {form.contact}
                    </li>
                    {form.reason && (
                      <li className="break-words">
                        <strong>Reason:</strong> {form.reason}
                      </li>
                    )}
                    {logoPreview && (
                      <li>
                        <strong>Logo:</strong>
                        <div className="mt-2 relative inline-block">
                          <img
                            src={logoPreview}
                            alt="logo"
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowImageModal(true)}
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-lg cursor-pointer"
                            onClick={() => setShowImageModal(true)}
                          >
                            <ZoomIn size={24} className="text-white" />
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>

                  {/* Confirm checkbox */}
                  <div className="mt-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.confirmed || false}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            confirmed: e.target.checked,
                          }))
                        }
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-green-600 cursor-pointer"
                      />
                      <span className="ml-2 text-sm sm:text-base text-gray-700">
                        I confirm all information is correct
                      </span>
                    </label>
                    {errors.confirmed && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.confirmed}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 gap-2 sm:gap-3">
                {step > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={prevStep}
                    type="button"
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold w-full sm:w-auto shadow-md hover:shadow-xl transition-all"
                    style={{ backgroundColor: mainLight, color: "white" }}
                  >
                    Back
                  </motion.button>
                )}
                {step < 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={nextStep}
                    type="button"
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold w-full sm:w-auto shadow-md hover:shadow-xl transition-all"
                    style={{ backgroundColor: mainDark, color: "white" }}
                  >
                    Next
                  </motion.button>
                )}
                {step === 3 && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading || !form.confirmed}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold w-full sm:w-auto shadow-md hover:shadow-xl transition-all"
                    style={{
                      backgroundColor: mainDark,
                      color: "white",
                      opacity: loading || !form.confirmed ? 0.6 : 1,
                      cursor:
                        loading || !form.confirmed ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </motion.button>
                )}
              </div>
            </motion.form>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2
                className="text-xl sm:text-2xl font-bold mb-4 text-center"
                style={{ color: mainDark }}
              >
                Store Request Submitted
              </h2>
              <div
                className="px-3 sm:px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold mb-4 sm:mb-6"
                style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
              >
                ⏳ In Progress - Waiting for Admin Approval
              </div>

              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                <li
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: mainLight }}
                >
                  🟢 Submitted
                </li>
                <li
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: "#d97706" }}
                >
                  ⏳ In Progress
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  ✅ Approved
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  ❌ Rejected
                </li>
              </ul>

              <button
                onClick={() => {
                  setStep(1);
                  setForm({
                    storeName: "",
                    description: "",
                    category: "",
                    contact: "",
                    logo: null,
                    reason: "",
                    confirmed: false,
                  });
                  setLogoPreview(null);
                }}
                className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:scale-105 transition-all shadow-md"
                style={{ backgroundColor: mainDark, color: "white" }}
              >
                Submit New Request
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImageModal && logoPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[85vh] cursor-default"
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-10 right-0 sm:-right-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-all z-10"
              >
                <X size={24} />
              </button>
              <div className="relative w-full h-full">
                <Image
                  src={logoPreview}
                  alt="logo full view"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
