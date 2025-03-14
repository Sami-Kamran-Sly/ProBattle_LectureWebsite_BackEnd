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

export default async (req, res) => {
  await start();
  return app(req, res);
};
