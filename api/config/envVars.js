import dotenv from "dotenv";

dotenv.config();

export const ENV_VARS = {
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT || 8000,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development",
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    SECRET_CODE: process.env.SECRET_CODE,
    THE_STREAMING_URI: process.env.THE_STREAMING_URI,
}