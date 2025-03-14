import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  id: { type: String, required: true },
  pdfUrl: { type: String, required: false }, // PDF URL
  imageUrl: { type: String, required: false }, // Image URL
  videoUrl: { type: String, required: false }, // Video URL
  // url: { type: String, required: true },
  status: { type: String, required: true },
  institute: { type: String, required: true },
  topic: { type: String, required: true },
  level: { type: String, required: true },
  user: { type: String, required: true },
});

const Lectures = mongoose.model("LecturesModels", lectureSchema);
export default Lectures;
