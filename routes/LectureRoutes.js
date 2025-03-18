import express from "express";
import multer from "multer";
const router = express.Router();
import { requireSignIn } from "../middleware/auth.js";

import {
  lectureCreateController,
  lectureDeleteController,
  lectureGetController,
  lectureGetSpecificController,
  lectureUpdateController,
  uploadImageController,
  uploadMultiplePDFController,
  uploadPDFController,
  uploadVideoController,
} from "../controller/LectureController.js";

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes with both `requireSignIn` and `multer` middleware
router
  .route("/uploadPDF")
  .post(requireSignIn, upload.single("pdf"), uploadPDFController);
router
  .route("/uploadMulPDF")
  .post(requireSignIn, upload.array("mulpdf", 10), uploadMultiplePDFController);

// router
//   .route("/uploadPDF")
//   .post(requireSignIn, upload.array("pdf", 10), uploadPDFController);

router
  .route("/uploadImage")
  .post(requireSignIn, upload.single("image"), uploadImageController);
router
  .route("/uploadVideo")
  .post(requireSignIn, upload.single("video"), uploadVideoController);

router.route("/create").post(requireSignIn, lectureCreateController);
router.route("/getAllLecture").get(requireSignIn, lectureGetController);
router
  .route("/getLecture/:id")
  .get(requireSignIn, lectureGetSpecificController);
router.put("/update/:id", requireSignIn, lectureUpdateController);

router.delete("/delete/:id", requireSignIn, lectureDeleteController);

export default router;
