"use client";

import Link from "next/link";
import { useState } from "react";
import { signup } from "@/config/auth";
import toast from "react-hot-toast";

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

export function SignUpForm() {
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kuEmail)) {
      newErrors.kuEmail = "Invalid KU Email address";
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
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 sm:p-8 p-6">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
        Create Your Account
      </h2>
      <form onSubmit={handleSignUp} className="space-y-5">
        {fields.map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-gray-600 font-medium text-sm capitalize">
              {field === "kuEmail"
                ? "KU Email"
                : field === "confirmPassword"
                ? "Confirm Password"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={
                field.toLowerCase().includes("password") ? "password" : "text"
              }
              placeholder={
                field === "name"
                  ? "Enter your full name"
                  : field === "kuEmail"
                  ? "example@ku.th"
                  : field === "faculty"
                  ? "Faculty of Engineering"
                  : field === "contact"
                  ? "Phone number"
                  : "••••••••"
              }
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69773D] focus:border-transparent focus:outline-none"
              required
            />
            {errors[field] && (
              <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#69773D] hover:bg-[#5a632d]"
          } text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-150`}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {apiError && (
          <p className="text-red-500 text-center text-sm mt-1">{apiError}</p>
        )}

        <div className="text-center text-sm text-gray-500">
          When you click Submit, you agree to our{" "}
          <Link href="/privacy" className="text-blue-500 hover:underline">
            Privacy Terms
          </Link>
        </div>

        <Link
          href="/login"
          className="mt-4 w-full border border-[#69773D] text-[#69773D] bg-transparent py-3 rounded-lg flex justify-center items-center shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-150"
        >
          Already have an account? Login
        </Link>
      </form>
    </div>
  );
}
