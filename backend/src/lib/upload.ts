import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const allowed = (process.env.ALLOWED_IMAGE_MIME || "image/jpeg,image/png,image/webp")
  .split(",")
  .map(s => s.trim());
const maxSize = Number(process.env.MAX_IMAGE_MB || 8) * 1024 * 1024;


const storage = new CloudinaryStorage({
cloudinary,
  params: async (_req, file) => {
    if (!allowed.includes(file.mimetype)) {
      throw new Error("Unsupported file type");
    }
    return {
      folder: "ku-market/items",
      resource_type: "image",
      transformation: [{ fetch_format: "auto", quality: "auto" }],
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: maxSize, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG/PNG/WebP allowed"));
  },
});

export type UploadedImage = Express.Multer.File & { path: string };