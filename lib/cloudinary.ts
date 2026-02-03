// ==========================================
// Rwanda Technology Institute Management System
// Cloudinary Configuration
// ==========================================

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  original_filename: string;
}

export async function uploadPDF(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'raw',
          folder: `rwanda-christian-university/${folder}`,
          public_id: filename,
          format: 'pdf',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadResult);
          }
        }
      )
      .end(buffer);
  });
}

export async function deletePDF(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
}

export function getDownloadUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    flags: 'attachment',
  });
}

export default cloudinary;
