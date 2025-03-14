import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
export const requireSignIn = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Missing token" });
    }

    // Verify the token with the provided secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};
