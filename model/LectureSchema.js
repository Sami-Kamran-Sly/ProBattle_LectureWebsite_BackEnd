import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
  pdfUrl: { type: String, required: false },
  mulPdfUrls: [{ type: String }],
  imageUrl: { type: String, required: false },
  videoUrl: { type: String, required: false },
  status: { type: String, required: true },
  institute: { type: String, required: true },
  topic: { type: String, required: true },
  level: { type: String, required: true },
});
const Lectures = mongoose.model("LecturesModels", lectureSchema);
export default Lectures;
