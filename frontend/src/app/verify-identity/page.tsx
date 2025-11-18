"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/config/profile";
import {
  submitVerification,
  getVerificationStatus,
  DocumentType,
  VerificationData,
} from "@/config/verification";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShieldCheck,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationData | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("student_id");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authentication");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Check if user is already verified
        const userData = await getProfile();
        if (userData.isVerified) {
          setIsVerified(true);
          toast.error("You are already verified");
          setTimeout(() => {
            router.replace("/profile");
          }, 2000);
          return;
        }

        // Get verification status
        try {
          const statusResponse = await getVerificationStatus();
          if (statusResponse.verification) {
            setVerificationStatus(statusResponse.verification);
          }
        } catch {
          // No verification found, that's okay
          console.log("No existing verification found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        localStorage.removeItem("authentication");
        localStorage.removeItem("cart_backup");
        router.replace("/login");
        setTimeout(() => window.location.reload(), 100);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload image files only (JPG, PNG, WEBP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size is too large (max 5MB)");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a document file");
      return;
    }

    const token = localStorage.getItem("authentication");
    if (!token) {
      router.replace("/login");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitVerification(
        documentType,
        selectedFile
      );
      if (response.success) {
        toast.success(
          "Verification request submitted successfully! Please wait for admin approval"
        );
        setVerificationStatus(response.verification!);
        setSelectedFile(null);
        setPreview("");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already have a pending")) {
          toast.error("You already have a pending verification request");
        } else if (error.message.includes("already verified")) {
          toast.error("You are already verified");
          setTimeout(() => {
            router.replace("/profile");
          }, 2000);
        } else {
          toast.error(error.message || "Failed to submit verification request");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-4 h-4 mr-2" />
            Pending Approval
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#780606] text-[#780606] border border-[#780606]">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F2E5' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F6F2E5' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Already Verified
          </h2>
          <p className="text-gray-600">
            Your identity has been verified. Redirecting to profile...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F6F2E5' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Profile</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Identity Verification</h1>
            </div>
            <p className="text-blue-100">
              Verify your identity to build trust and unlock special features
            </p>
          </div>

          <div className="p-8">
            {/* Current Status */}
            {verificationStatus && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Verification Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(verificationStatus.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Document Type:</span>
                    <span className="font-medium text-gray-800">
                      {verificationStatus.documentType === "student_id"
                        ? "Student ID"
                        : "Citizen ID"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(
                        verificationStatus.submittedAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {verificationStatus.rejectionReason && (
                    <div className="mt-3 p-4 bg-[#780606] rounded-lg border border-[#780606]">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#780606] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-[#780606] mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-[#780606] text-sm">
                            {verificationStatus.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="mb-8 p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Upload a clear photo of your Student ID or Citizen ID
                    </li>
                    <li>
                      File must be an image (JPG, PNG, WEBP) and not exceed 5MB
                    </li>
                    <li>
                      Documents will be reviewed by admin within 1-3 business
                      days
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Only show form if no pending verification */}
            {(!verificationStatus ||
              verificationStatus.status === "rejected") && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Document Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Document Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDocumentType("student_id")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        documentType === "student_id"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            documentType === "student_id"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FileText
                            className={`w-6 h-6 ${
                              documentType === "student_id"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">
                            Student ID
                          </p>
                          <p className="text-xs text-gray-500">
                            KU Student Card
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocumentType("citizen_id")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        documentType === "citizen_id"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            documentType === "citizen_id"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FileText
                            className={`w-6 h-6 ${
                              documentType === "citizen_id"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">
                            Citizen ID
                          </p>
                          <p className="text-xs text-gray-500">
                            National ID Card
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Document
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      {preview ? (
                        <div className="relative w-full h-full p-4">
                          <Image
                            src={preview}
                            alt="Preview"
                            width={800}
                            height={600}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload file
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, WEBP (max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview("");
                        }}
                        className="text-[#780606] hover:text-[#780606] text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Submit Verification Request</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {verificationStatus && verificationStatus.status === "pending" && (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Your Request is Pending Approval
                </h3>
                <p className="text-gray-600">
                  Admin is reviewing your documents. Please wait for
                  notification from us.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
