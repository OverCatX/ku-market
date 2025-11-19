"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  Store,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_BASE } from "@/config/constants";
import { getUserFromToken } from "@/lib/jwt";
import { getVerificationStatus } from "@/config/verification";

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
  const [isChecking, setIsChecking] = useState(true);
  const [shopStatus, setShopStatus] = useState<{
    status: "pending" | "approved" | "rejected" | null;
    shopName?: string;
    shopType?: string;
    submittedAt?: string;
    rejectionReason?: string;
  }>({ status: null });
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const mainDark = "#4B5D34";
  const mainLight = "#7BAA5F";
  const borderColor = "#a0c16d";

  // Check authentication and load user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authentication");
      if (!token) {
        router.replace("/login?redirect=/request-store");
        return;
      }

      // Decode JWT to get user data (fast, no API call needed!)
      const tokenData = getUserFromToken(token);
      if (!tokenData) {
        console.log("❌ Invalid or expired token");
        localStorage.clear();
        router.replace("/login?redirect=/request-store");
        return;
      }

      console.log("✅ Token data:", tokenData);

      // Check if user is verified; if not, refresh from server once
      if (!tokenData.isVerified) {
        try {
          const statusRes = await getVerificationStatus();
          const approved =
            statusRes.success &&
            statusRes.verification &&
            (statusRes.verification as { status?: string }).status === "approved";
          if (approved) {
            // Update local user cache and continue
            try {
              const userStr = localStorage.getItem("user");
              const latestUser = userStr ? JSON.parse(userStr) : {};
              localStorage.setItem(
                "user",
                JSON.stringify({ ...latestUser, isVerified: true })
              );
            } catch {
              // ignore storage errors
            }
          } else {
            console.log("⚠️ User not verified");
            router.replace("/verify-identity");
            return;
          }
        } catch {
          console.log("⚠️ Could not refresh verification status");
          router.replace("/verify-identity");
          return;
        }
      }

      // Get full user data from localStorage for auto-fill
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setForm((prev) => ({
            ...prev,
            fullName: userData.name || prev.fullName,
            email: userData.email || prev.email,
            phone: userData.contact || prev.phone,
          }));
        } catch {
          console.log("Failed to parse user data from localStorage");
        }
      }

      // Check shop status
      try {
        const shopResponse = await fetch(`${API_BASE}/api/shop/my-shop`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          // Backend returns { success: true, shop: {...} }
          const shop = shopData.shop || shopData;
          setShopStatus({
            status: shop.shopStatus,
            shopName: shop.shopName,
            shopType: shop.shopType,
            submittedAt: shop.shopRequestDate,
            rejectionReason: shop.shopRejectionReason,
          });
        }
      } catch (error) {
        // No shop found - user can apply
        console.log("No shop found:", error);
      }

      // Authentication check complete
      setIsChecking(false);
    };

    // Add small delay to ensure localStorage is ready after redirect
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
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

  // Real-time validation
  const isValidEmail = useMemo(() => {
    if (!form.email) return null;
    return /^[^\s@]+@ku\.th$/.test(form.email);
  }, [form.email]);

  const isValidPhone = useMemo(() => {
    if (!form.phone) return null;
    return /^\d{9,10}$/.test(form.phone);
  }, [form.phone]);

  const businessNameLength = useMemo(() => form.businessName.trim().length, [form.businessName]);
  const businessDescriptionLength = useMemo(() => form.businessDescription.trim().length, [form.businessDescription]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@ku\.th$/.test(form.email))
        newErrors.email = "Email must end with @ku.th";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^\d{9,10}$/.test(form.phone))
        newErrors.phone = "Phone number must be 9-10 digits";
    }

    if (step === 2) {
      if (!form.businessName.trim())
        newErrors.businessName = "Business name is required";
      else if (form.businessName.trim().length < 2)
        newErrors.businessName = "Business name must be at least 2 characters";
      if (!form.businessType)
        newErrors.businessType = "Business type is required";
      else if (form.businessType.length < 2)
        newErrors.businessType = "Business type must be at least 2 characters";
      if (!form.productCategory)
        newErrors.productCategory = "Product category is required";
      if (!form.businessDescription.trim())
        newErrors.businessDescription = "Description is required";
      else if (form.businessDescription.trim().length < 10)
        newErrors.businessDescription =
          "Description must be at least 10 characters";
      else if (form.businessDescription.trim().length > 1000)
        newErrors.businessDescription =
          "Description must not exceed 1000 characters";
    }

    if (step === 3) {
      if (!form.profileImage) newErrors.profileImage = "Shop photo is required";
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

  const handleCancelRequest = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your shop request? You can apply again later."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      const response = await fetch(`${API_BASE}/api/shop/cancel`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Shop request canceled successfully!");
        setShopStatus({ status: null });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to cancel request");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel request");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authentication");
      const formData = new FormData();

      formData.append("shopName", form.businessName.trim());
      formData.append("shopType", form.businessType);
      formData.append(
        "productCategory",
        JSON.stringify([form.productCategory])
      );
      formData.append("shopdescription", form.businessDescription.trim());

      if (form.profileImage) {
        formData.append("photo", form.profileImage);
      }

      console.log("📦 Submitting:", {
        shopName: form.businessName.trim(),
        shopNameLength: form.businessName.trim().length,
        shopType: form.businessType,
        category: form.productCategory,
        descriptionLength: form.businessDescription.trim().length,
        hasPhoto: !!form.profileImage,
      });

      const response = await fetch(`${API_BASE}/api/shop/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Shop request submitted successfully! Redirecting to profile..."
        );

        // Redirect to profile after 1.5 seconds with full page reload
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1500);
      } else {
        // Show detailed validation errors
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach((detail: string) => {
            toast.error(detail, { duration: 4000 });
          });
        } else {
          toast.error(data.error || "Failed to submit request");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show status page if user has already applied
  if (shopStatus.status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-200"
        >
          <div className="text-center mb-8">
            {shopStatus.status === "pending" && (
              <>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Application Pending
                </h2>
                <p className="text-gray-600">
                  Your shop request is waiting for admin approval
                </p>
              </>
            )}
            {shopStatus.status === "approved" && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Shop Approved!
                </h2>
                <p className="text-gray-600">
                  Congratulations! Your shop has been approved
                </p>
              </>
            )}
            {shopStatus.status === "rejected" && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Application Rejected
                </h2>
                <p className="text-gray-600">
                  Unfortunately, your shop request was not approved
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Shop Name:</span>
              <span className="font-semibold text-gray-800">
                {shopStatus.shopName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shop Type:</span>
              <span className="font-semibold text-gray-800">
                {shopStatus.shopType || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-semibold text-gray-800">
                {shopStatus.submittedAt
                  ? new Date(shopStatus.submittedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            {shopStatus.rejectionReason && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-600 mb-2">Rejection Reason:</p>
                <p className="text-red-600 font-medium">
                  {shopStatus.rejectionReason}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {(shopStatus.status === "pending" ||
              shopStatus.status === "rejected") && (
              <button
                onClick={handleCancelRequest}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Canceling..." : "Cancel & Apply Again"}
              </button>
            )}
            <button
              onClick={() => (window.location.href = "/profile")}
              className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all shadow-md hover:shadow-lg"
            >
              Back to Profile
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
                    <div className="relative">
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your full name"
                        className={`w-full p-2 sm:p-3 pr-10 text-sm sm:text-base rounded-lg border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          focusedField === "fullName" ? "shadow-sm" : ""
                        } ${
                          form.fullName && form.fullName.trim()
                            ? "border-green-500"
                            : errors.fullName
                            ? "border-red-400"
                            : ""
                        }`}
                        style={{
                          borderColor: focusedField === "fullName" ? mainDark : errors.fullName ? "#ef4444" : form.fullName && form.fullName.trim() ? "#10b981" : borderColor,
                          backgroundColor: "white"
                        }}
                      />
                      {form.fullName && form.fullName.trim() && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
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
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="your.email@ku.th"
                        className={`w-full p-2 sm:p-3 pr-10 text-sm sm:text-base rounded-lg border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          focusedField === "email" ? "shadow-sm" : ""
                        } ${
                          isValidEmail === true
                            ? "border-green-500"
                            : isValidEmail === false && form.email
                            ? "border-red-400"
                            : errors.email
                            ? "border-red-400"
                            : ""
                        }`}
                        style={{
                          borderColor: focusedField === "email" ? mainDark : isValidEmail === true ? "#10b981" : isValidEmail === false && form.email ? "#ef4444" : errors.email ? "#ef4444" : borderColor,
                          backgroundColor: "white"
                        }}
                      />
                      {form.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isValidEmail ? (
                            <svg className="w-5 h-5 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    {form.email && isValidEmail === false && !errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Email must end with @ku.th
                      </p>
                    )}
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
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
                    <div className="relative">
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Phone number (9-10 digits)"
                        className={`w-full p-2 sm:p-3 pr-10 text-sm sm:text-base rounded-lg border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          focusedField === "phone" ? "shadow-sm" : ""
                        } ${
                          isValidPhone === true
                            ? "border-green-500"
                            : isValidPhone === false && form.phone
                            ? "border-red-400"
                            : errors.phone
                            ? "border-red-400"
                            : ""
                        }`}
                        style={{
                          borderColor: focusedField === "phone" ? mainDark : isValidPhone === true ? "#10b981" : isValidPhone === false && form.phone ? "#ef4444" : errors.phone ? "#ef4444" : borderColor,
                          backgroundColor: "white"
                        }}
                      />
                      {form.phone && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isValidPhone ? (
                            <svg className="w-5 h-5 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    {form.phone && isValidPhone === false && !errors.phone && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Phone number must be 9-10 digits
                      </p>
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
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
                    <div className="relative">
                      <input
                        name="businessName"
                        value={form.businessName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("businessName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your business name"
                        className={`w-full p-2 sm:p-3 ${
                          businessNameLength >= 2 ? "pr-10" : ""
                        } text-sm sm:text-base rounded-lg border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          focusedField === "businessName" ? "shadow-sm" : ""
                        } ${
                          businessNameLength >= 2
                            ? "border-green-500"
                            : businessNameLength > 0 && businessNameLength < 2
                            ? "border-red-400"
                            : errors.businessName
                            ? "border-red-400"
                            : ""
                        }`}
                        style={{
                          borderColor: focusedField === "businessName" ? mainDark : businessNameLength >= 2 ? "#10b981" : businessNameLength > 0 && businessNameLength < 2 ? "#ef4444" : errors.businessName ? "#ef4444" : borderColor,
                          backgroundColor: "white"
                        }}
                      />
                      {businessNameLength >= 2 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {businessNameLength > 0 && businessNameLength < 2 && !errors.businessName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Business name must be at least 2 characters
                      </p>
                    )}
                    {errors.businessName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
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
                    <div className="relative">
                      <textarea
                        name="businessDescription"
                        value={form.businessDescription}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("businessDescription")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Tell us about your business and products..."
                        rows={4}
                        className={`w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border resize-none transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          focusedField === "businessDescription" ? "shadow-sm" : ""
                        } ${
                          businessDescriptionLength >= 10 && businessDescriptionLength <= 1000
                            ? "border-green-500"
                            : businessDescriptionLength > 0 && (businessDescriptionLength < 10 || businessDescriptionLength > 1000)
                            ? "border-red-400"
                            : errors.businessDescription
                            ? "border-red-400"
                            : ""
                        }`}
                        style={{
                          borderColor: focusedField === "businessDescription" ? mainDark : businessDescriptionLength >= 10 && businessDescriptionLength <= 1000 ? "#10b981" : businessDescriptionLength > 0 && (businessDescriptionLength < 10 || businessDescriptionLength > 1000) ? "#ef4444" : errors.businessDescription ? "#ef4444" : borderColor,
                          backgroundColor: "white"
                        }}
                      />
                      {businessDescriptionLength >= 10 && businessDescriptionLength <= 1000 && (
                        <div className="absolute bottom-3 right-3">
                          <svg className="w-5 h-5 text-green-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {businessDescriptionLength > 0 && businessDescriptionLength < 10 && !errors.businessDescription && (
                          <p className="text-red-500 text-xs sm:text-sm flex items-center animate-fade-in">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Description must be at least 10 characters
                          </p>
                        )}
                        {businessDescriptionLength > 1000 && !errors.businessDescription && (
                          <p className="text-red-500 text-xs sm:text-sm flex items-center animate-fade-in">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Description must not exceed 1000 characters
                          </p>
                        )}
                        {errors.businessDescription && (
                          <p className="text-red-500 text-xs sm:text-sm flex items-center animate-fade-in">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.businessDescription}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs ${
                        businessDescriptionLength > 1000 ? "text-red-500" : businessDescriptionLength >= 10 ? "text-green-600" : "text-gray-500"
                      }`}>
                        {businessDescriptionLength}/1000
                      </span>
                    </div>
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

                  <div>
                    <FileUploadBox
                      name="profileImage"
                      label="Shop Photo *"
                      preview={previews.profileImage}
                      icon={Store}
                    />
                    {errors.profileImage && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.profileImage}
                      </p>
                    )}
                  </div>

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
            className="fixed inset-0 bg-black/60 backdrop-blur-md backdrop-saturate-150 z-50 flex items-center justify-center p-4 cursor-zoom-out"
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
