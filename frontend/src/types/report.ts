export type ReportType = "general" | "item";
export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";

export interface ReportSummary {
  id: string;
  type: ReportType;
  category?: string;
  itemId?: string;
  itemTitle?: string;
  reason?: string;
  details: string;
  contact?: string;
  attachments: string[];
  status: ReportStatus;
  adminNotes?: string;
  reviewedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}
