import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";

const DB_URL = ENV_VARS.DB_URL;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connection to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
