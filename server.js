import express from "express";
import connectDBS from "./db/connected.js";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import lectureRoutes from "./routes/LectureRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
  })
);

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lecture", lectureRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDBS(process.env.MONGO_URL);
    console.log("Connected to MongoDB Successfully");
    app.listen(PORT, () => console.log("Server Connected to the Port", PORT));
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Force exit if DB connection fails
  }
};

start();

// import express from "express";
// import connectDBS from "./db/connected.js";
// import cors from "cors";
// import authRoutes from "./routes/authRoute.js";
// import lectureRoutes from "./routes/LectureRoutes.js";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";
// dotenv.config();
// const app = express();

// app.use(express.json());
// app.use(
//   cors({
//     credentials: true,
//   })
// );
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/lecture", lectureRoutes);

// app.get("/", (req, res) => {
//   res.send("Server is running...");
// });
// const PORT = process.env.PORT || 5000;

// const start = async () => {
//   try {
//     await connectDBS(process.env.MONGO_URL);
//     console.log("Connected to MongoDB Successfully");
//     app.listen(PORT, () => console.log("Server Connected to the Port", PORT));
//   } catch (error) {
//     console.error("Error connecting to the database:", error);
//     process.exit(1); // Force exit if DB connection fails
//   }
// };

// start();

// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const fs = require("fs");

// const app = express();
// const PORT = 3001;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure Multer for File Uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // Upload Endpoint
// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const filePath = req.file.path;

//     // Upload file to Cloudinary
//     const result = await cloudinary.uploader.upload(filePath, {
//       resource_type: "raw", // Use 'raw' for PDFs and non-image files
//     });

//     // Delete local file after upload
//     fs.unlinkSync(filePath);

//     res.json({ success: true, url: result.secure_url });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Start Server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
