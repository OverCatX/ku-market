"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { signup } from "@/config/auth";
import toast from "react-hot-toast";
import { aboutColors } from "@/components/aboutus/SectionColors";
import PrivacyPolicyModal from "@/components/modals/PrivacyPolicyModal";


type FormDataType = {
  name: string;
  kuEmail: string;
  password: string;
  confirmPassword: string;
  faculty: string;
  contact: string;
};

type FormErrors = {
  [K in keyof FormDataType]: string;
};

type PasswordStrength = {
  score: number; // 0-4
  label: string;
  color: string;
};

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, label: "", color: "" };
  }

  let score = 0;
  
  // Length scoring (more important for security)
  if (password.length >= 6) score += 0.5;  // Minimum requirement
  if (password.length >= 8) score += 0.5;  // Recommended minimum
  if (password.length >= 12) score += 1;   // Good length
  if (password.length >= 16) score += 0.5; // Excellent length
  
  // Character variety (critical for security)
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  // Variety scoring: more variety = stronger
  if (varietyCount === 4) score += 2;      // All character types
  else if (varietyCount === 3) score += 1.5; // Three types
  else if (varietyCount === 2) score += 0.5; // Two types
  // 1 type = 0 points (too weak)
  
  // Check for common weak patterns (penalize)
  const commonPatterns = [
    /(.)\1{2,}/,           // Repeated characters (aaa, 111)
    /(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
    /^(password|123456|qwerty|admin)/i, // Common passwords
  ];
  
  const hasWeakPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasWeakPattern) score -= 0.5;
  
  // Check for mixed case and numbers together (bonus)
  if (hasLower && hasUpper && hasNumber) score += 0.5;
  
  // Ensure minimum score is 0 and maximum is 4
  score = Math.max(0, Math.min(Math.round(score * 2) / 2, 4));
  
  // Round to nearest integer for display
  const finalScore = Math.round(score);

  const strengths: PasswordStrength[] = [
    { score: 0, label: "Very Weak", color: "bg-red-500" },
    { score: 1, label: "Weak", color: "bg-[#780606]" },
    { score: 2, label: "Fair", color: "bg-yellow-500" },
    { score: 3, label: "Good", color: "bg-blue-500" },
    { score: 4, label: "Strong", color: "bg-[#69773D]" },
  ];

  return strengths[finalScore] || strengths[0];
};

export function SignUpForm() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    kuEmail: "",
    password: "",
    confirmPassword: "",
    faculty: "",
    contact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    kuEmail: "",
    password: "",
    confirmPassword: "",
    faculty: "",
    contact: "",
  });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(formData.password),
    [formData.password]
  );

  const confirmPasswordStrength = useMemo(
    () => calculatePasswordStrength(formData.confirmPassword),
    [formData.confirmPassword]
  );

  // Email validation
  const isValidEmail = useMemo(() => {
    if (!formData.kuEmail) return null;
    return /^[^\s@]+@ku\.th$/.test(formData.kuEmail);
  }, [formData.kuEmail]);

  // Phone validation
  const isValidPhone = useMemo(() => {
    if (!formData.contact) return null;
    return /^\d{9,10}$/.test(formData.contact);
  }, [formData.contact]);

  const handleChange = <K extends keyof FormDataType>(
    field: K,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const { name, kuEmail, password, confirmPassword, faculty, contact } =
      formData;
    let valid = true;
    const newErrors: FormErrors = {
      name: "",
      kuEmail: "",
      password: "",
      confirmPassword: "",
      faculty: "",
      contact: "",
    };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!/^[^\s@]+@ku\.th$/.test(kuEmail)) {
      newErrors.kuEmail = "Email must be a valid @ku.th email address";
      valid = false;
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }
    if (!faculty.trim()) {
      newErrors.faculty = "Faculty is required";
      valid = false;
    }
    if (!contact.trim()) {
      newErrors.contact = "Contact info is required";
      valid = false;
    } else if (!/^\d{9,10}$/.test(contact)) {
      newErrors.contact = "Contact must be a valid phone number";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await signup({
        name: formData.name,
        kuEmail: formData.kuEmail,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        faculty: formData.faculty,
        contact: formData.contact,
      });
      toast.success("Sign up successful! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fields: (keyof FormDataType)[] = [
    "name",
    "kuEmail",
    "password",
    "confirmPassword",
    "faculty",
    "contact",
  ];

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 sm:p-8 p-6 transform transition-all duration-300 hover:shadow-xl">
      <div className="text-center mb-6">
        <h2 
          className="text-2xl font-semibold text-gray-700 mb-2 animate-fade-in" 
          style={{ color: aboutColors.oliveDark }}
        >
          Create Your Account
        </h2>
        <div className="w-16 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${aboutColors.oliveDark}, #a8c090)` }}></div>
      </div>
      <form onSubmit={handleSignUp} className="space-y-5 animate-slide-up">
        {fields.map((field) => (
          <div 
            key={field} 
            className="space-y-1"
          >
            <label 
              className="block text-gray-600 font-medium text-sm capitalize transition-colors duration-200" 
              style={{ color: aboutColors.oliveDark }}
            >
              {field === "kuEmail"
                ? "KU Email"
                : field === "confirmPassword"
                ? "Confirm Password"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <div className="relative">
              <input
                type={
                  field === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : field === "confirmPassword"
                    ? showConfirmPassword
                      ? "text"
                      : "password"
                    : "text"
                }
                placeholder={
                  field === "name"
                    ? "Enter your full name"
                    : field === "kuEmail"
                    ? "example@ku.th"
                    : field === "faculty"
                    ? "Faculty of Engineering"
                    : field === "contact"
                    ? "Phone number (9-10 digits)"
                    : "••••••••"
                }
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 ${
                  field === "password" || field === "confirmPassword" 
                    ? "pr-12" 
                    : field === "kuEmail" || field === "contact"
                    ? "pr-10"
                    : ""
                } border rounded-lg transition-all duration-200 ease-out focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none ${
                  focusedField === field 
                    ? "border-[#69773D] shadow-sm" 
                    : "border-gray-300 hover:border-gray-400"
                } ${
                  field === "kuEmail" && isValidEmail === true
                    ? "border-[#69773D]"
                    : field === "kuEmail" && isValidEmail === false && formData.kuEmail
                    ? "border-red-400"
                    : ""
                } ${
                  field === "contact" && isValidPhone === true
                    ? "border-[#69773D]"
                    : field === "contact" && isValidPhone === false && formData.contact
                    ? "border-red-400"
                    : ""
                } ${errors[field] ? "border-red-400" : ""}`}
                required
              />
              {field === "kuEmail" && formData.kuEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidEmail ? (
                    <svg className="w-5 h-5 text-[#69773D] animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
              {field === "contact" && formData.contact && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidPhone ? (
                    <svg className="w-5 h-5 text-[#69773D] animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 animate-fade-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
              {field === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200 active:scale-95"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}
              {field === "confirmPassword" && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200 active:scale-95"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}
              {focusedField === field && (
                <div 
                  className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300 ease-out"
                  style={{ 
                    background: `linear-gradient(90deg, ${aboutColors.oliveDark}, #a8c090)`,
                    width: "100%"
                  }}
                />
              )}
            </div>
            {field === "password" && formData.password && (
              <div className="mt-2 animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">Password Strength:</span>
                  <span className={`text-xs font-semibold transition-colors duration-300 ${passwordStrength.color.replace("bg-", "text-")}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${passwordStrength.color} shadow-sm`}
                    style={{ 
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      animation: "progressFill 0.5s ease-out"
                    }}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${formData.password.length >= 8 ? "bg-[#69773D] text-white" : "bg-gray-300 text-gray-600"}`}>
                      {formData.password.length >= 8 ? "✓" : ""}
                    </span>
                    <span className={formData.password.length >= 8 ? "text-[#69773D]" : "text-gray-500"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? "bg-[#69773D] text-white" : "bg-gray-300 text-gray-600"}`}>
                      {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? "✓" : ""}
                    </span>
                    <span className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? "text-[#69773D]" : "text-gray-500"}>
                      Upper and lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${/[0-9]/.test(formData.password) ? "bg-[#69773D] text-white" : "bg-gray-300 text-gray-600"}`}>
                      {/[0-9]/.test(formData.password) ? "✓" : ""}
                    </span>
                    <span className={/[0-9]/.test(formData.password) ? "text-[#69773D]" : "text-gray-500"}>
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full ${/[^a-zA-Z0-9]/.test(formData.password) ? "bg-[#69773D] text-white" : "bg-gray-300 text-gray-600"}`}>
                      {/[^a-zA-Z0-9]/.test(formData.password) ? "✓" : ""}
                    </span>
                    <span className={/[^a-zA-Z0-9]/.test(formData.password) ? "text-[#69773D]" : "text-gray-500"}>
                      At least one special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
            {field === "confirmPassword" && formData.confirmPassword && (
              <div className="mt-2 animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">Confirm Password Strength:</span>
                  <span className={`text-xs font-semibold transition-colors duration-300 ${confirmPasswordStrength.color.replace("bg-", "text-")}`}>
                    {confirmPasswordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${confirmPasswordStrength.color} shadow-sm`}
                    style={{ 
                      width: `${(confirmPasswordStrength.score / 4) * 100}%`,
                      animation: "progressFill 0.5s ease-out"
                    }}
                  />
                </div>
                {formData.password === formData.confirmPassword && formData.confirmPassword && (
                  <div className="mt-1 flex items-center text-[#69773D] text-xs animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </div>
                )}
              </div>
            )}
            {field === "kuEmail" && formData.kuEmail && isValidEmail === false && !errors.kuEmail && (
              <p className="text-red-500 text-xs mt-1 flex items-center animate-fade-in">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Email must end with @ku.th
              </p>
            )}
            {field === "contact" && formData.contact && isValidPhone === false && !errors.contact && (
              <p className="text-red-500 text-xs mt-1 flex items-center animate-fade-in">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Phone number must be 9-10 digits
              </p>
            )}
            {errors[field] && (
              <p className="text-[#780606] text-xs mt-1 flex items-center animate-fade-in">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors[field]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className={`w-full relative overflow-hidden ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#69773D] hover:bg-[#5a6630] active:scale-[0.98]"
          } text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 ease-out`}
        >
          <span className={`relative z-10 flex items-center justify-center ${loading ? "opacity-70" : ""}`}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing up...
              </>
            ) : (
              <>
                Sign up
                <svg className="ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#69773D] to-[#5a6630] opacity-0 hover:opacity-100 transition-opacity duration-200 ease-out"></div>
          )}
        </button>

        {apiError && (
          <div className="p-3 bg-[#780606]/10 rounded-lg text-[#780606] text-center text-sm mt-1 animate-fade-in">
            <p className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </p>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 animate-fade-in">
          When you click Submit, you agree to our{" "}
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-blue-500 hover:text-blue-600 hover:underline transition-colors duration-200 font-medium"
          >
            Privacy Terms
          </button>
        </div>

        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />

        <Link
          href="/login"
          className="mt-4 w-full bg-transparent py-3 rounded-lg flex justify-center items-center shadow-sm hover:shadow-md hover:bg-[#69773D]/10 transition-all duration-200 ease-out group"
          style={{ color: aboutColors.oliveDark, border: `1px solid ${aboutColors.oliveDark}` }}
        >
          <span>Already have an account?</span>
          <span className="ml-2 font-semibold group-hover:translate-x-0.5 transition-transform duration-200 ease-out">Login</span>
          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-0.5 transition-transform duration-200 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </form>
    </div>
  );
}
