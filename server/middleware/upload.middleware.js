import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Strip codec parameters (e.g. "audio/webm;codecs=opus" → "audio/webm")
  const mime = file.mimetype.split(";")[0].trim().toLowerCase();

  const allowedDocTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-rar-compressed",
  ];

  const allowed =
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime.startsWith("audio/") ||
    allowedDocTypes.includes(mime);

  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${mime}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export default upload;
