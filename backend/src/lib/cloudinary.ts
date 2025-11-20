import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer: Buffer, folder = "items", format?: string, mimeType?: string, fileName?: string) => {
  return new Promise<string>((resolve, reject) => {
    // Check if we need to convert HEIC/HEIF/AVIF to JPG for browser compatibility
    // Check both MIME type and file extension (some browsers don't set MIME type correctly for HEIC)
    const lowerMimeType = mimeType?.toLowerCase() || "";
    const lowerFileName = fileName?.toLowerCase() || "";
    const needsConversion = 
      lowerMimeType.includes("heic") || 
      lowerMimeType.includes("heif") || 
      lowerMimeType.includes("avif") ||
      lowerFileName.endsWith(".heic") ||
      lowerFileName.endsWith(".heif") ||
      lowerFileName.endsWith(".avif");
    
    const uploadOptions: {
      folder: string;
      resource_type: "image" | "auto" | "video" | "raw";
      format?: string;
      allowed_formats?: string[];
      eager?: Array<{ format: string }>;
    } = {
      folder,
      // Use "auto" to let Cloudinary detect format automatically (better for HEIC)
      resource_type: needsConversion ? "auto" : "image",
      // Allow various image formats including HEIC, HEIF, AVIF
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif", "avif"],
    };
    
    // Convert HEIC/HEIF/AVIF to JPG during upload
    // Browser cannot display HEIC/HEIF/AVIF directly
    if (format) {
      uploadOptions.format = format;
    } else if (needsConversion) {
      // For HEIC/HEIF/AVIF, use eager transformation to convert to JPG immediately
      // This ensures the image is converted and stored as JPG
      uploadOptions.eager = [{ format: "jpg" }];
      // Also set format to jpg to ensure conversion
      uploadOptions.format = "jpg";
    }
    
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        let imageUrl = result?.secure_url || "";
        
        // For HEIC/HEIF/AVIF files, use the eager transformation URL if available
        // or add transformation to force JPG format
        if (needsConversion) {
          // If eager transformation was used, result.eager should contain the JPG version
          if (result?.eager && result.eager.length > 0) {
            // Use the eager transformation URL (already converted to JPG)
            imageUrl = result.eager[0].secure_url || imageUrl;
          } else {
            // Fallback: Add transformation to URL to force JPG format
            // Cloudinary URL format: https://res.cloudinary.com/cloud/image/upload/v1234567890/folder/filename.jpg
            // We need to add transformation: /f_jpg/ before version or folder
            // Try multiple URL patterns to ensure transformation is added correctly
            if (!imageUrl.includes("/f_jpg") && !imageUrl.includes("/f_auto")) {
              // Pattern 1: URL with version number
              if (imageUrl.match(/\/upload\/v\d+\//)) {
                imageUrl = imageUrl.replace(
                  /(\/upload\/)(v\d+\/)/,
                  "$1f_jpg/$2"
                );
              } 
              // Pattern 2: URL without version number
              else if (imageUrl.match(/\/upload\//)) {
                imageUrl = imageUrl.replace(
                  /(\/upload\/)/,
                  "$1f_jpg/"
                );
              }
            }
            // Also ensure file extension is .jpg
            imageUrl = imageUrl.replace(/\.(heic|heif|avif)(\?|$)/i, ".jpg$2");
          }
        }
        
        resolve(imageUrl);
      }
    );
    stream.end(fileBuffer);
  });
};

export default cloudinary;