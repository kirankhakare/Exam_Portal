import multer from "multer";

const storage = multer.memoryStorage(); // Store file in RAM

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error("Only Excel files allowed"), false);
    }
    cb(null, true);
  },
});

export default upload;
