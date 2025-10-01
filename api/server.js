import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { ENV_VARS } from "./config/envVars.js";

const app = express();
const PORT = ENV_VARS.PORT;

app.use("/api/v1/auth", authRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Failed to connect DB: ${err}`);
    process.exit(1);
  });
