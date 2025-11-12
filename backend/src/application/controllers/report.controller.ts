import { Request, Response } from "express";
import mongoose from "mongoose";
import Report, { ReportStatus } from "../../data/models/Report";
import Item from "../../data/models/Item";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { uploadToCloudinary } from "../../lib/cloudinary";

const ALLOWED_STATUSES: ReportStatus[] = [
  "pending",
  "in_review",
  "resolved",
  "dismissed",
];

const serializeReport = (report: typeof Report.prototype & { _doc?: unknown }) => {
  const plain = report.toObject({ virtuals: false });
  return {
    id: String(plain._id),
    type: plain.type,
    category: plain.category,
    itemId: plain.item ? String(plain.item) : undefined,
    itemTitle: plain.itemTitle,
    reason: plain.reason,
    details: plain.details,
    contact: plain.contact,
    attachments: plain.attachments || [],
    status: plain.status,
    adminNotes: plain.adminNotes,
    reviewedBy: plain.reviewedBy ? String(plain.reviewedBy) : undefined,
    reviewedAt: plain.reviewedAt,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

export default class ReportController {
  submitGeneralReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { category, details, contact } = req.body as {
        category?: string;
        details?: string;
        contact?: string;
      };

      if (!category || !category.trim()) {
        return res
          .status(400)
          .json({ success: false, error: "Category is required" });
      }

      if (!details || !details.trim()) {
        return res
          .status(400)
          .json({ success: false, error: "Details are required" });
      }

      const report = new Report({
        user: new mongoose.Types.ObjectId(userId),
        type: "general",
        category: category.trim(),
        details: details.trim(),
        contact: contact?.trim() || undefined,
      });

      await report.save();

      return res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        report: serializeReport(report),
      });
    } catch (error) {
      console.error("Submit general report error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to submit report" });
    }
  };

  submitItemReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const body = req.body as Record<string, unknown>;

      const pickString = (value: unknown): string | undefined => {
        if (Array.isArray(value)) {
          return typeof value[0] === "string" ? value[0] : undefined;
        }
        return typeof value === "string" ? value : undefined;
      };

      const candidateItemId =
        pickString(body.itemId) ||
        pickString(body.item_id) ||
        pickString(body.item_ref) ||
        pickString(body.itemRef) ||
        pickString(body.item_id_ref);

      const reasonRaw = pickString(body.reason);
      const detailsRaw = pickString(body.details);
      const contactRaw = pickString(body.contact);
      const titleRaw = pickString(body.title);

      if (!candidateItemId) {
        return res
          .status(400)
          .json({ success: false, error: "Item ID is required" });
      }

      const normalizedItemId = candidateItemId.trim();

      if (!mongoose.Types.ObjectId.isValid(normalizedItemId)) {
        return res
          .status(400)
          .json({ success: false, error: "Please provide a valid item ID" });
      }

      if (!reasonRaw || !reasonRaw.trim()) {
        return res
          .status(400)
          .json({ success: false, error: "Reason is required" });
      }

      if (!detailsRaw || !detailsRaw.trim()) {
        return res
          .status(400)
          .json({ success: false, error: "Details are required" });
      }

      const item = await Item.findById(normalizedItemId);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      const files = Array.isArray(req.files)
        ? (req.files as Express.Multer.File[])
        : [];

      let attachments: string[] = [];
      if (files.length > 0) {
        attachments = await Promise.all(
          files.map((file) => uploadToCloudinary(file.buffer, "report-evidence"))
        );
      }

      const report = new Report({
        user: new mongoose.Types.ObjectId(userId),
        type: "item",
        item: item._id,
        itemTitle: titleRaw?.trim() || item.title,
        reason: reasonRaw.trim(),
        details: detailsRaw.trim(),
        contact: contactRaw?.trim() || undefined,
        attachments,
      });

      await report.save();

      return res.status(201).json({
        success: true,
        message: "Item report submitted successfully",
        report: serializeReport(report),
      });
    } catch (error) {
      console.error("Submit item report error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to submit item report" });
    }
  };

  getMyReports = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const reports = await Report.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        reports: reports.map((report) => ({
          id: String(report._id),
          type: report.type,
          category: report.category,
          itemId: report.item ? String(report.item) : undefined,
          itemTitle: report.itemTitle,
          reason: report.reason,
          details: report.details,
          contact: report.contact,
          attachments: report.attachments || [],
          status: report.status,
          adminNotes: report.adminNotes,
          reviewedAt: report.reviewedAt,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Get my reports error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to load reports" });
    }
  };

  getAdminReports = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { status, type } = req.query as { status?: string; type?: string };

      const filter: mongoose.FilterQuery<typeof Report> = {};

      if (status && ALLOWED_STATUSES.includes(status as ReportStatus)) {
        filter.status = status as ReportStatus;
      }

      if (type && ["general", "item"].includes(type)) {
        filter.type = type as "general" | "item";
      }

      const reports = await Report.find(filter)
        .sort({ createdAt: -1 })
        .populate("user", "name kuEmail")
        .lean();

      return res.json({
        success: true,
        reports: reports.map((report) => ({
          id: String(report._id),
          type: report.type,
          category: report.category,
          itemId: report.item ? String(report.item) : undefined,
          itemTitle: report.itemTitle,
          reason: report.reason,
          details: report.details,
          contact: report.contact,
          attachments: report.attachments || [],
          status: report.status,
          adminNotes: report.adminNotes,
          reviewedAt: report.reviewedAt,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
          user: report.user
            ? {
                id: String(
                  typeof report.user === "object" && "_id" in report.user
                    ? report.user._id
                    : report.user
                ),
                name:
                  typeof report.user === "object" && "name" in report.user
                    ? (report.user.name as string | undefined) || "User"
                    : undefined,
                email:
                  typeof report.user === "object" && "kuEmail" in report.user
                    ? (report.user.kuEmail as string | undefined)
                    : undefined,
              }
            : undefined,
        })),
      });
    } catch (error) {
      console.error("Get admin reports error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to load reports" });
    }
  };

  updateReportStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const adminId = (req as AuthenticatedRequest).user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { id } = req.params;
      const { status, adminNotes } = req.body as {
        status?: ReportStatus;
        adminNotes?: string;
      };

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid report ID" });
      }

      if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid status provided" });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ success: false, error: "Report not found" });
      }

      report.status = status;
      report.adminNotes = adminNotes?.trim() || undefined;

      if (status === "pending") {
        report.reviewedAt = undefined;
        report.reviewedBy = undefined;
      } else {
        report.reviewedAt = new Date();
        report.reviewedBy = new mongoose.Types.ObjectId(adminId);
      }

      await report.save();

      return res.json({
        success: true,
        report: serializeReport(report),
      });
    } catch (error) {
      console.error("Update report status error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update report" });
    }
  };
}
