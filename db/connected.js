import mongoose from "mongoose";

const connectDBS = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

export default connectDBS;

// // connected.js
// import mongoose from "mongoose";

// const connectDBS = async (url) => {
//   return mongoose.connect(url, {
//       // useNewUrlParser: true,
//       // useCreateIndex: true,
//       // useFindAndModify: false,
//       // useUnifiedTopology: true,
//     });

// };

// export default connectDBS;
