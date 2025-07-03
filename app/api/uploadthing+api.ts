import type { FileRouter } from "uploadthing/server";
import { createRouteHandler, createUploadthing } from "uploadthing/server";

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    // This code RUNS ON YOUR SERVER after upload
    console.log("file url", file.ufsUrl);
    return { uploadedBy: file.ufsUrl };
  }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    logLevel: "Debug",
  },
});

export { handlers as GET, handlers as POST };
