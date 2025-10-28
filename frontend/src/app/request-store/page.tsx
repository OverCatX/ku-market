"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  Store,
  User,
  FileText,
  CheckCircle,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SellerApplicationForm {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  productCategory: string;
  businessDescription: string;
  whySell: string;
  businessLicense: File | null;
  idDocument: File | null;
  profileImage: File | null;
  agreeToTerms: boolean;
  confirmed?: boolean;
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function BecomeASeller() {
  const router = useRouter();
  const [form, setForm] = useState<SellerApplicationForm>({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    productCategory: "",
    businessDescription: "",
    whySell: "",
    businessLicense: null,
    idDocument: null,
    profileImage: null,
    agreeToTerms: false,
    confirmed: false,
  });
  const [previews, setPreviews] = useState<{
    profileImage: string | null;
    businessLicense: string | null;
    idDocument: string | null;
  }>({
    profileImage: null,
    businessLicense: null,
    idDocument: null,
  });
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const mainDark = "#4B5D34";
  const mainLight = "#7BAA5F";
  const borderColor = "#a0c16d";

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    const files = target.files;

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (type === "checkbox") {
      const checked = target.checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setPreviews((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(files[0]),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeFile = (fieldName: keyof typeof previews) => {
    setForm((prev) => ({ ...prev, [fieldName]: null }));
    setPreviews((prev) => ({ ...prev, [fieldName]: null }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Invalid email format";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (step === 2) {
      if (!form.businessName.trim())
        newErrors.businessName = "Business name is required";
      if (!form.businessType)
        newErrors.businessType = "Business type is required";
      if (!form.productCategory)
        newErrors.productCategory = "Product category is required";
      if (!form.businessDescription.trim())
        newErrors.businessDescription = "Description is required";
    }

    if (step === 3) {
      if (!form.whySell.trim())
        newErrors.whySell = "Please tell us why you want to sell";
      if (!form.agreeToTerms)
        newErrors.agreeToTerms = "You must agree to the terms";
    }

    if (step === 4) {
      if (!form.confirmed)
        newErrors.confirmed = "Please confirm all information is correct";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => (prev < 5 ? ((prev + 1) as Step) : prev));
  };

  const prevStep = () =>
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(5);
    }, 1500);
  };

  const steps = [
    "Personal Info",
    "Business Details",
    "Documents",
    "Review",
    "Status",
  ];

  const FileUploadBox = ({
    name,
    label,
    preview,
    icon: Icon,
    accept = "image/*",
  }: {
    name: keyof typeof previews;
    label: string;
    preview: string | null;
    icon: LucideIcon;
    accept?: string;
  }) => (
    <div>
      <label
        className="block font-semibold mb-2 text-sm sm:text-base"
        style={{ color: mainDark }}
      >
        {label}
      </label>
      {!preview ? (
        <label
          className="w-full p-6 sm:p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-opacity-80 flex flex-col items-center justify-center gap-2"
          style={{ borderColor: borderColor }}
        >
          <Icon size={32} style={{ color: mainLight }} />
          <span className="text-sm text-gray-600">Click to upload</span>
          <span className="text-xs text-gray-400">PNG, JPG, PDF up to 5MB</span>
          <input
            type="file"
            name={name}
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-full h-48 rounded-lg border overflow-hidden shadow-md bg-gray-50">
            <Image
              src={preview}
              alt={label}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                type="button"
                onClick={() => setShowImageModal(preview)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
              >
                <ZoomIn size={18} style={{ color: mainDark }} />
              </button>
              <button
                type="button"
                onClick={() => removeFile(name)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all"
              >
                <X size={18} className="text-red-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-200"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4"
            style={{ backgroundColor: mainLight }}
          >
            <Store size={32} className="text-white" />
          </motion.div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
            style={{ color: mainDark }}
          >
            Become a Seller
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Join our marketplace and start selling your products today
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 md:mb-10 px-1 sm:px-2 relative">
          <div className="absolute top-3 sm:top-4 md:top-5 left-[10%] right-[10%] sm:left-[10%] sm:right-[10%] h-0.5 md:h-1 bg-gray-300 rounded" />
          <motion.div
            className="absolute top-3 sm:top-4 md:top-5 left-[10%] sm:left-[10%] h-0.5 md:h-1 rounded"
            style={{
              background: `linear-gradient(to right, ${mainDark}, ${mainLight})`,
            }}
            animate={{ width: `${((step - 1) / (steps.length - 1)) * 80}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
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

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {step < 5 && (
            <motion.form
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <>
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <>
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Business/Shop Name *
                    </label>
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business name"
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Business Type *
                    </label>
                    <select
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    >
                      <option value="">Select business type</option>
                      <option value="Individual">Individual Seller</option>
                      <option value="Small Business">Small Business</option>
                      <option value="Company">Registered Company</option>
                      <option value="Brand">Brand/Manufacturer</option>
                    </select>
                    {errors.businessType && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.businessType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Product Category *
                    </label>
                    <select
                      name="productCategory"
                      value={form.productCategory}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    >
                      <option value="">Select main category</option>
                      <option value="Fashion">Fashion & Apparel</option>
                      <option value="Electronics">Electronics & Gadgets</option>
                      <option value="Food">Food & Beverages</option>
                      <option value="Home">Home & Living</option>
                      <option value="Beauty">Beauty & Health</option>
                      <option value="Sports">Sports & Outdoors</option>
                      <option value="Books">Books & Media</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.productCategory && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.productCategory}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Business Description *
                    </label>
                    <textarea
                      name="businessDescription"
                      value={form.businessDescription}
                      onChange={handleChange}
                      placeholder="Tell us about your business and products..."
                      rows={4}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.businessDescription && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.businessDescription}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Documents & Motivation */}
              {step === 3 && (
                <>
                  <div>
                    <label
                      className="block font-semibold mb-1 text-sm sm:text-base"
                      style={{ color: mainDark }}
                    >
                      Why do you want to become a seller? *
                    </label>
                    <textarea
                      name="whySell"
                      value={form.whySell}
                      onChange={handleChange}
                      placeholder="Share your motivation and goals..."
                      rows={4}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ borderColor, backgroundColor: "white" }}
                    />
                    {errors.whySell && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.whySell}
                      </p>
                    )}
                  </div>

                  <FileUploadBox
                    name="profileImage"
                    label="Profile/Shop Image (Optional)"
                    preview={previews.profileImage}
                    icon={User}
                  />

                  <FileUploadBox
                    name="businessLicense"
                    label="Business License (Optional)"
                    preview={previews.businessLicense}
                    icon={FileText}
                    accept="image/*,application/pdf"
                  />

                  <FileUploadBox
                    name="idDocument"
                    label="ID Document (Optional)"
                    preview={previews.idDocument}
                    icon={FileText}
                    accept="image/*,application/pdf"
                  />

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={form.agreeToTerms}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-green-600 mt-0.5 cursor-pointer flex-shrink-0"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        I agree to the{" "}
                        <span className="font-semibold text-green-700">
                          Terms & Conditions
                        </span>{" "}
                        and{" "}
                        <span className="font-semibold text-green-700">
                          Seller Policy
                        </span>
                        . I understand that my application will be reviewed and
                        I will be notified of the decision.
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-xs sm:text-sm mt-2 ml-8">
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3
                    className="text-lg sm:text-xl font-bold mb-4"
                    style={{ color: mainDark }}
                  >
                    Review Your Application
                  </h3>

                  <div className="space-y-4 text-sm sm:text-base">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4
                        className="font-semibold mb-2"
                        style={{ color: mainDark }}
                      >
                        Personal Information
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>
                          <strong>Name:</strong> {form.fullName}
                        </li>
                        <li>
                          <strong>Email:</strong> {form.email}
                        </li>
                        <li>
                          <strong>Phone:</strong> {form.phone}
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4
                        className="font-semibold mb-2"
                        style={{ color: mainDark }}
                      >
                        Business Details
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>
                          <strong>Business Name:</strong> {form.businessName}
                        </li>
                        <li>
                          <strong>Type:</strong> {form.businessType}
                        </li>
                        <li>
                          <strong>Category:</strong> {form.productCategory}
                        </li>
                        <li>
                          <strong>Description:</strong>{" "}
                          {form.businessDescription}
                        </li>
                      </ul>
                    </div>

                    {form.whySell && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4
                          className="font-semibold mb-2"
                          style={{ color: mainDark }}
                        >
                          Motivation
                        </h4>
                        <p className="text-gray-700">{form.whySell}</p>
                      </div>
                    )}

                    {(previews.profileImage ||
                      previews.businessLicense ||
                      previews.idDocument) && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4
                          className="font-semibold mb-3"
                          style={{ color: mainDark }}
                        >
                          Uploaded Documents
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {previews.profileImage && (
                            <div
                              className="relative group cursor-pointer"
                              onClick={() =>
                                setShowImageModal(previews.profileImage)
                              }
                            >
                              <div className="relative w-full h-24 rounded-lg border overflow-hidden">
                                <Image
                                  src={previews.profileImage}
                                  alt="Profile"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 50vw, 33vw"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                <ZoomIn
                                  className="text-white opacity-0 group-hover:opacity-100"
                                  size={20}
                                />
                              </div>
                              <p className="text-xs text-center mt-1">
                                Profile
                              </p>
                            </div>
                          )}
                          {previews.businessLicense && (
                            <div
                              className="relative group cursor-pointer"
                              onClick={() =>
                                setShowImageModal(previews.businessLicense)
                              }
                            >
                              <div className="relative w-full h-24 rounded-lg border overflow-hidden">
                                <Image
                                  src={previews.businessLicense}
                                  alt="License"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 50vw, 33vw"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                <ZoomIn
                                  className="text-white opacity-0 group-hover:opacity-100"
                                  size={20}
                                />
                              </div>
                              <p className="text-xs text-center mt-1">
                                License
                              </p>
                            </div>
                          )}
                          {previews.idDocument && (
                            <div
                              className="relative group cursor-pointer"
                              onClick={() =>
                                setShowImageModal(previews.idDocument)
                              }
                            >
                              <div className="relative w-full h-24 rounded-lg border overflow-hidden">
                                <Image
                                  src={previews.idDocument}
                                  alt="ID"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 50vw, 33vw"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                <ZoomIn
                                  className="text-white opacity-0 group-hover:opacity-100"
                                  size={20}
                                />
                              </div>
                              <p className="text-xs text-center mt-1">ID</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.confirmed || false}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            confirmed: e.target.checked,
                          }))
                        }
                        className="form-checkbox h-5 w-5 text-green-600 mt-0.5 cursor-pointer flex-shrink-0"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        I confirm that all information provided is accurate and
                        complete
                      </span>
                    </label>
                    {errors.confirmed && (
                      <p className="text-red-500 text-xs sm:text-sm mt-2 ml-8">
                        {errors.confirmed}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                {step > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevStep}
                    type="button"
                    className="px-6 py-3 text-sm sm:text-base rounded-lg font-semibold w-full sm:w-auto shadow-md hover:shadow-xl transition-all"
                    style={{ backgroundColor: mainLight, color: "white" }}
                  >
                    Back
                  </motion.button>
                )}
                {step < 4 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextStep}
                    type="button"
                    className="px-6 py-3 text-sm sm:text-base rounded-lg font-semibold w-full sm:w-auto shadow-md hover:shadow-xl transition-all ml-auto"
                    style={{ backgroundColor: mainDark, color: "white" }}
                  >
                    Next
                  </motion.button>
                )}
                {step === 4 && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading || !form.confirmed}
                    className="px-6 py-3 text-sm sm:text-base rounded-lg font-semibold w-full sm:w-auto shadow-md hover:shadow-xl transition-all ml-auto"
                    style={{
                      backgroundColor: mainDark,
                      color: "white",
                      opacity: loading || !form.confirmed ? 0.6 : 1,
                      cursor:
                        loading || !form.confirmed ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </motion.button>
                )}
              </div>
            </motion.form>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ backgroundColor: mainLight }}
              >
                <CheckCircle size={48} className="text-white" />
              </motion.div>

              <h2
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ color: mainDark }}
              >
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
                Thank you for applying to become a seller. We wll review your
                application and get back to you within 2-3 business days.
              </p>

              <div className="max-w-md mx-auto mb-8">
                <div
                  className="p-4 rounded-lg text-center font-semibold mb-4"
                  style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                >
                  ⏳ Application Under Review
                </div>

                <ul className="space-y-3 text-left">
                  <li
                    className="flex items-center gap-3 font-semibold"
                    style={{ color: mainLight }}
                  >
                    <CheckCircle size={20} />
                    <span>Application Submitted</span>
                  </li>
                  <li
                    className="flex items-center gap-3 font-semibold"
                    style={{ color: "#d97706" }}
                  >
                    <div className="w-5 h-5 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    <span>Under Review</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Approved - Setup Your Store</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Start Selling!</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-sm text-left max-w-md mx-auto">
                <p className="font-semibold text-blue-900 mb-2">
                  📧 Check Your Email
                </p>
                <p className="text-blue-700">
                  We have sent a confirmation email to{" "}
                  <strong>{form.email}</strong>. You wll receive updates about
                  your application status there.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setStep(1);
                    setForm({
                      fullName: "",
                      businessName: "",
                      email: "",
                      phone: "",
                      businessType: "",
                      productCategory: "",
                      businessDescription: "",
                      whySell: "",
                      businessLicense: null,
                      idDocument: null,
                      profileImage: null,
                      agreeToTerms: false,
                      confirmed: false,
                    });
                    setPreviews({
                      profileImage: null,
                      businessLicense: null,
                      idDocument: null,
                    });
                  }}
                  className="px-6 py-3 text-sm sm:text-base rounded-lg font-semibold hover:scale-105 transition-all shadow-md"
                  style={{ backgroundColor: mainDark, color: "white" }}
                >
                  Submit Another Application
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-6 py-3 text-sm sm:text-base rounded-lg font-semibold hover:scale-105 transition-all shadow-md border-2"
                  style={{ borderColor: mainDark, color: mainDark }}
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(null)}
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
                onClick={() => setShowImageModal(null)}
                className="absolute -top-10 right-0 sm:-right-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-all z-10"
              >
                <X size={24} />
              </button>
              <div className="relative w-full h-full">
                <Image
                  src={showImageModal}
                  alt="Preview"
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
