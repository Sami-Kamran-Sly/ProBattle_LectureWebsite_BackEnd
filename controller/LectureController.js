import cloudinary from "cloudinary";
import Lectures from "../model/LectureSchema.js";

// Function to upload an image to Cloudinary
const uploadImage = async (file) => {
  const base64Image = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.secure_url;
};

// const uploadFile = async (file, resourceType) => {
//   try {
//     console.log("File Buffer Length:", file.buffer.length);
//     console.log("File MIME Type:", file.mimetype);

//     if (resourceType === "raw") {
//       const base64File = Buffer.from(file.buffer).toString("base64");
//       const dataURI = `data:${file.mimetype};base64,${base64File}`;

//       // Correct options to make PDFs viewable in browser
//       const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
//         resource_type: "raw",
//         // Remove the flags: "attachment" parameter as it forces download
//         use_filename: true,
//         delivery_type: "upload",
//         access_mode: "public",
//       });

//       console.log("Cloudinary Upload Response:", uploadResponse);
//       return uploadResponse.secure_url;
//     } else if (resourceType === "video") {
//       // Video upload code remains the same
//       return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.v2.uploader.upload_stream(
//           { resource_type: "video" },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary Video Upload Error:", error);
//               return reject(error);
//             }
//             resolve(result.secure_url);
//           }
//         );
//         uploadStream.end(file.buffer);
//       });
//     }
//   } catch (error) {
//     console.error("Error Uploading File to Cloudinary:", error);
//     throw error;
//   }
// };

// Function to upload a file (PDF or Video) to Cloudinary Downloading the file explicitly
const uploadFile = async (file, resourceType) => {
  try {
    console.log("File Buffer Length:", file.buffer.length); // Check buffer length
    console.log("File MIME Type:", file.mimetype); // Check MIME type

    if (resourceType === "raw") {
      const base64File = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${base64File}`;

      const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
        resource_type: "raw",
      });

      console.log("Cloudinary Upload Response:", uploadResponse); // Log the response
      return uploadResponse.secure_url;
    } else if (resourceType === "video") {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { resource_type: "video" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Video Upload Error:", error);
              return reject(error);
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer); // Upload video as a binary stream
      });
    }
  } catch (error) {
    console.error("Error Uploading File to Cloudinary:", error);
    throw error;
  }
};

export const uploadImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = await uploadImage(req.file);
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image upload failed" });
  }
};

// Controller for PDF upload
export const uploadPDFController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfUrl = await uploadFile(req.file, "raw");
    res.status(200).json({ success: true, pdfUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF upload failed" });
  }
};

// export const uploadPDFController = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     // Upload all PDFs to Cloudinary
//     const uploadedFiles = await Promise.all(
//       req.files.map((file) => uploadFile(file, "raw"))
//     );

//     res.status(200).json({ success: true, pdfUrls: uploadedFiles });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "PDF upload failed" });
//   }
// };

// Controller for video upload
export const uploadVideoController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const videoUrl = await uploadFile(req.file, "video");
    res.status(200).json({ success: true, videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Video upload failed" });
  }
};

export const lectureCreateController = async (req, res) => {
  try {
    const {
      pdfIVid,
      user,
      status,
      institute,
      topic,
      level,
      pdfUrl,
      imageUrl,
      videoUrl,
    } = req.body;

    const lecture = new Lectures({
      pdfIVid,
      user,
      status,
      institute,
      topic,
      level,
      pdfUrl,
      imageUrl,
      videoUrl,
    });

    if (req.file) {
      // Determine file type and upload accordingly
      if (req.file.mimetype.startsWith("image/")) {
        lecture.imageUrl = await uploadImage(req.file);
      } else if (req.file.mimetype === "application/pdf") {
        lecture.pdfUrl = await uploadFile(req.file, "raw");
      } else if (req.file.mimetype.startsWith("video/")) {
        lecture.videoUrl = await uploadFile(req.file, "video");
      } else {
        return res.status(400).json({ error: "Invalid file type" });
      }
    }

    await lecture.save();
    res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lecture creation failed" });
  }
};

export const lectureGetController = async (req, res) => {
  try {
    const lecture = await Lectures.find({});

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json(lecture);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

export const lectureGetSpecificController = async (req, res) => {
  try {
    const { pdfIVid } = req.params; // Lecture ID from URL params

    // Find lecture where _id matches and belongs to the user
    const lecture = await Lectures.findOne({ pdfIVid: pdfIVid });

    if (!lecture) {
      return res
        .status(404)
        .json({ message: "Lecture not found or does not belong to this user" });
    }

    res.status(200).json(lecture);
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const lectureDeleteController = async (req, res) => {
  try {
    const { pdfIVid } = req.params;

    // If `pdfIVid` is a string and not an ObjectId, use findOneAndDelete
    const lecture = await Lectures.findOneAndDelete({ pdfIVid });

    if (!lecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lecture deletion failed" });
  }
};

// const uploadFile = async (file, resourceType) => {
//   if (resourceType === "raw") {
//     // ✅ For PDFs (Use Base64)
//     const base64File = Buffer.from(file.buffer).toString("base64");
//     const dataURI = `data:${file.mimetype};base64,${base64File}`;

//     const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
//       resource_type: "raw",
//     });

//     return uploadResponse.secure_url;
//   } else if (resourceType === "video") {
//     // ✅ For Videos (Use Binary Stream)
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.v2.uploader.upload_stream(
//         { resource_type: "video" },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result.secure_url);
//         }
//       );
//       uploadStream.end(file.buffer); // Upload video as a binary stream
//     });
//   }
// };

// for videos
// const uploadFile = (file, resourceType) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.v2.uploader.upload_stream(
//       { resource_type: resourceType },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result.secure_url);
//       }
//     );
//     uploadStream.end(file.buffer); // Fix: Use `.end(file.buffer)` instead of piping stream
//   });
// };

// const uploadFile = async (file, resourceType) => {
//   const base64File = Buffer.from(file.buffer).toString("base64");
//   const dataURI = `data:${file.mimetype};base64,${base64File}`;

//   const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
//     resource_type: resourceType,
//   });

//   return uploadResponse.secure_url;
// };

// Controller for image upload

// It only supports uploading one file at a time (either an image, PDF, or video).
// router
//   .route("/uploadPDF")
//   .post(requireSignIn, upload.single("pdf"), uploadPDFController);
// router
//   .route("/uploadImage")
//   .post(requireSignIn, upload.single("image"), uploadImageController);
// router
//   .route("/uploadVideo")
//   .post(requireSignIn, upload.single("video"), uploadVideoController);
