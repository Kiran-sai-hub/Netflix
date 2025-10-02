import express from "express";

// routes
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js"
import tvRoutes from "./routes/tv.routes.js";

// config's
import { ENV_VARS } from "./config/envVars.js";
import connectDB from "./config/db.js";

const app = express();
const PORT = ENV_VARS.PORT;

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", movieRoutes);
app.use("/api/v1/tv", tvRoutes);

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
