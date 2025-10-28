import { API_BASE } from "./api";

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
  token: string,
  documentType: DocumentType,
  file: File
): Promise<VerificationResponse> {
  try {
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

export async function getVerificationStatus(
  token: string
): Promise<VerificationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/verification/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok && res.status !== 404) {
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

