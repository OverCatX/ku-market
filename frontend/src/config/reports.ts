import { API_BASE } from "./constants";
import { getAuthToken, clearAuthTokens } from "../lib/auth";
import { ReportSummary, ReportStatus } from "@/types/report";

export interface SubmitGeneralReportInput {
  category: string;
  details: string;
  contact?: string;
}

export interface SubmitItemReportInput {
  itemId: string;
  reason: string;
  details: string;
  contact?: string;
  title?: string;
  images?: File[];
}

export interface AdminReportFilters {
  status?: ReportStatus | "all";
  type?: "general" | "item" | "all";
}

const REPORT_ENDPOINT = `${API_BASE}/api/reports`;

function ensureToken(): string {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please login to continue");
  }
  return token;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthTokens();
      throw new Error("Please login to continue");
    }
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Request failed");
  }

  const data = await res.json().catch(() => ({}));
  return data as T;
}

export async function submitGeneralReport(
  payload: SubmitGeneralReportInput
): Promise<ReportSummary> {
  const token = ensureToken();

  if (!payload.category?.trim()) {
    throw new Error("Please select a category");
  }

  if (!payload.details?.trim()) {
    throw new Error("Please provide report details");
  }

  const res = await fetch(`${REPORT_ENDPOINT}/general`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category: payload.category.trim(),
      details: payload.details.trim(),
      contact: payload.contact?.trim() || undefined,
    }),
  });

  const data = await handleResponse<{ report: ReportSummary }>(res);
  return data.report;
}

export async function submitItemReport(
  payload: SubmitItemReportInput
): Promise<ReportSummary> {
  const token = ensureToken();

  if (!payload.itemId?.trim()) {
    throw new Error("Missing item ID for report");
  }

  if (!payload.reason?.trim()) {
    throw new Error("Please select a reason for the report");
  }

  if (!payload.details?.trim()) {
    throw new Error("Please provide report details");
  }

  const formData = new FormData();
  formData.append("itemId", payload.itemId.trim());
  formData.append("reason", payload.reason.trim());
  formData.append("details", payload.details.trim());
  if (payload.contact?.trim()) {
    formData.append("contact", payload.contact.trim());
  }
  if (payload.title?.trim()) {
    formData.append("title", payload.title.trim());
  }
  if (payload.images && payload.images.length) {
    payload.images.forEach((file) => {
      formData.append("images", file, file.name);
    });
  }

  const res = await fetch(`${REPORT_ENDPOINT}/item`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await handleResponse<{ report: ReportSummary }>(res);
  return data.report;
}

export async function getMyReports(
  page: number = 1,
  limit: number = 10
): Promise<{ reports: ReportSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const token = ensureToken();

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(`${REPORT_ENDPOINT}/my?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleResponse<{ 
    reports: ReportSummary[]; 
    pagination: { page: number; limit: number; total: number; totalPages: number } 
  }>(res);
  return data;
}

export async function getAdminReports(
  filters: AdminReportFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<{ reports: ReportSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const token = ensureToken();

  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.type && filters.type !== "all") {
    params.set("type", filters.type);
  }
  params.set("page", String(page));
  params.set("limit", String(limit));

  const query = params.toString();
  const res = await fetch(
    `${REPORT_ENDPOINT}/admin?${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await handleResponse<{ 
    reports: ReportSummary[]; 
    pagination: { page: number; limit: number; total: number; totalPages: number } 
  }>(res);
  return data;
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes?: string
): Promise<ReportSummary> {
  const token = ensureToken();

  if (!reportId) {
    throw new Error("Report ID is required");
  }

  const res = await fetch(`${REPORT_ENDPOINT}/admin/${reportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      adminNotes: adminNotes?.trim() || undefined,
    }),
  });

  const data = await handleResponse<{ report: ReportSummary }>(res);
  return data.report;
}
