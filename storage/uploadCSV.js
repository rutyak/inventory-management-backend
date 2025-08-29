// backend/uploadCSV.js
const path = require("path");
const multer = require("multer");

const uploadCSV = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") cb(null, true);
    else cb(new Error("Only CSV files allowed!"), false);
  },
});

module.exports = uploadCSV;
