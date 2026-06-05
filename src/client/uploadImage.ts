"use client";

import { upload } from "@vercel/blob/client";

export async function uploadImage(file: File) {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/changelog/_admin/upload",
  });

  return {
    url: blob.url,
    originalFilename: file.name,
  };
}
