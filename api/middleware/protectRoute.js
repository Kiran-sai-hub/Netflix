import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.js";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || "";
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token Provided" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: No Permission" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(`Error in protectRoute middleware: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export default protectRoute;
