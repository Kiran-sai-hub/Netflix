import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

// routes
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js"
import tvRoutes from "./routes/tv.routes.js";
import searchRoutes from "./routes/search.routes.js";

// config's
import { ENV_VARS } from "./config/envVars.js";
import connectDB from "./config/db.js";
import protectRoute from "./middleware/protectRoute.js";

const app = express();
const PORT = ENV_VARS.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);

if(ENV_VARS.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req,res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  })
}

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
