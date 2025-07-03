import type { UploadRouter } from "@/app/api/uploadthing+api";
import { generateReactNativeHelpers } from "@uploadthing/expo";

export const { useImageUploader } = generateReactNativeHelpers<UploadRouter>({
  url: process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:8081",
});
