import cloudinary from "cloudinary";
import Lectures from "../model/LectureSchema.js";
import mongoose from "mongoose";
// Function to upload an image to Cloudinary
const uploadImage = async (file) => {
  const base64Image = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.secure_url;
};

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

export const uploadMultiplePDFController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Upload all files and get their URLs
    const mulPdfUrls = await Promise.all(
      req.files.map(async (file) => {
        return await uploadFile(file, "raw"); // Assuming `uploadFile` handles file uploads
      })
    );

    res.status(200).json({ success: true, mulPdfUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF upload failed" });
  }
};

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
    const userId = req.user._id;

    const {
      pdfUrl,
      mulPdfUrls,
      imageUrl,
      videoUrl,
      status,
      institute,
      topic,
      level,
    } = req.body;

    // Optional: Check for duplicate lectures (same topic and institute for the user)
    const existingLecture = await Lectures.findOne({
      user: userId,
    });

    if (existingLecture) {
      return res.status(409).json({
        message:
          "Lecture with the same topic and institute already exists for this user",
      });
    }

    const lecture = new Lectures({
      user: userId, // Associate the lecture with the authenticated user
      pdfUrl,
      mulPdfUrls,
      imageUrl,
      videoUrl,
      status,
      institute,
      topic,
      level,
    });

    await lecture.save();

    res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({ error: "Lecture creation failed" });
  }
};
export const lectureGetController = async (req, res) => {
  try {
    // Fetch all lectures (no filtering by user)
    const lectures = await Lectures.find();

    // If no lectures are found, return an appropriate response
    if (!lectures || lectures.length === 0) {
      return res.status(404).json({ message: "No lectures found" });
    }

    // Return the list of lectures
    res.status(200).json({ success: true, lectures });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({ error: "Failed to retrieve lectures" });
  }
};

export const lectureGetSpecificController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lecture = await Lectures.findOne({ _id: id, user: userId });

    if (!lecture) {
      return res
        .status(404)
        .json({ message: "Lecture not found or access denied" });
    }

    res.status(200).json({ lecture }); // ✅ wrap lecture in an object
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const lectureUpdateController = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user's ID
    const lectureId = req.params.id; // Lecture ID from the URL

    // Find the lecture by ID
    const lecture = await Lectures.findById(lectureId);

    // Check if the lecture exists and if the logged-in user is the creator
    if (!lecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }
    if (lecture.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this lecture" });
    }

    // Update the lecture
    const updatedLecture = await Lectures.findByIdAndUpdate(
      lectureId,
      { $set: req.body }, // Update with the request body
      { new: true } // Return the updated lecture
    );

    res.status(200).json({ success: true, lecture: updatedLecture });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({ error: "Lecture update failed" });
  }
};
export const lectureDeleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lecture = await Lectures.findOneAndDelete({ _id: id, user: userId });

    if (!lecture) {
      return res
        .status(404)
        .json({ error: "Lecture not found or access denied" });
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

// export const lectureUpdateController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       pdfIVid,
//       user,
//       status,
//       institute,
//       topic,
//       level,
//       pdfUrl,
//       imageUrl,
//       videoUrl,
//     } = req.body;

//     const lecture = await Lectures.findOneAndUpdate(id);
//     if (!lecture) {
//       return res.status(404).json({ error: "Lecture not found" });
//     }

//     // Update only the fields provided in the request
//     lecture.pdfIVid = pdfIVid ?? lecture.pdfIVid;
//     lecture.user = user ?? lecture.user;
//     lecture.status = status ?? lecture.status;
//     lecture.institute = institute ?? lecture.institute;
//     lecture.topic = topic ?? lecture.topic;
//     lecture.level = level ?? lecture.level;
//     lecture.pdfUrl = pdfUrl ?? lecture.pdfUrl;
//     lecture.imageUrl = imageUrl ?? lecture.imageUrl;
//     lecture.videoUrl = videoUrl ?? lecture.videoUrl;

//     if (req.file) {
//       // Determine file type and upload accordingly
//       if (req.file.mimetype.startsWith("image/")) {
//         lecture.imageUrl = await uploadImage(req.file);
//       } else if (req.file.mimetype === "application/pdf") {
//         lecture.pdfUrl = await uploadFile(req.file, "raw");
//       } else if (req.file.mimetype.startsWith("video/")) {
//         lecture.videoUrl = await uploadFile(req.file, "video");
//       } else {
//         return res.status(400).json({ error: "Invalid file type" });
//       }
//     }

//     await lecture.save();
//     res.status(200).json({ success: true, lecture });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Lecture update failed" });
//   }
// };
