import multer from "multer";

// In-memory storage so file buffers can be streamed straight to Cloudinary.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (images / screenshots)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});
