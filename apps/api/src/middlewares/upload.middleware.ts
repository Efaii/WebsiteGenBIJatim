import multer from "multer";
import path from "path";

export const uploadCanonicalNewsCover = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(path.extname(file.originalname).toLowerCase())
    )
      return cb(null, true);
    cb(new Error("Only JPEG, PNG, or WebP covers are allowed."));
  },
});

/**
 * Unggahan media konten Beranda (gambar apa pun; video mp4/webm).
 *
 * Tidak ada filter tipe di sini: layanan (`home-media.service`) yang memberi
 * pesan khusus per slot (gambar dikonversi WebP; video dibatasi mp4/webm dan
 * 2 MB). Batas ukuran di sini lebar (50 MB) supaya pesan dari layanan yang
 * dipakai untuk berkas yang wajar.
 */
export const uploadHomeMediaFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
