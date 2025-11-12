import { API_BASE } from "./constants";
import { getAuthToken, clearAuthTokens } from "../lib/auth";

export type DocumentType = "student_id" | "citizen_id";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface VerificationData {
  id: string;
  documentType: DocumentType;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface VerificationResponse {
  success: boolean;
  verification?: VerificationData;
  message?: string;
  error?: string;
}

export async function submitVerification(
  documentType: DocumentType,
  file: File
): Promise<VerificationResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to submit verification");
    
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("document", file);

    const res = await fetch(`${API_BASE}/api/verification/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthTokens();
        throw new Error("Please login to submit verification");
      }
      throw new Error(json.error || "Verification submission failed");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

export async function getVerificationStatus(): Promise<VerificationResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to view verification status");
    
    const res = await fetch(`${API_BASE}/api/verification/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok && res.status !== 404) {
      if (res.status === 401) {
        clearAuthTokens();
        throw new Error("Please login to view verification status");
      }
      throw new Error(json.error || "Failed to get verification status");
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Something went wrong");
    }
  }
}

