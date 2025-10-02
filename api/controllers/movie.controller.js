import { fetchFromTmdb } from "../services/tmdb.service.js";

const getTrendingMovie = async (req, res) => {
  try {
    const url =
      "https://api.themoviedb.org/3/trending/movie/day?language=en-US";
    const data = await fetchFromTmdb(url);
    const randomMovie =
      data.results[Math.floor(Math.random() * data.results?.length)];
    res.status(200).json({ success: true, content: randomMovie });
  } catch (error) {
    console.log(`Error in getTrendingMovie controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getMovieTrailers = async (req, res) => {
  const movieId = req.params.id;
  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, trailers: data.results });
  } catch (error) {
    if (error.message.includes("404")) {
      return res.status(404).send(null);
    }
    console.log(`Error in getMovieTrailers controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, content: data });
  } catch (error) {
    if (error.message.includes("404")) {
      res.status(404).send(null);
    }
    console.log(`Error in getMovieTrailers controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getSimilarMovies = async (req, res) => {
  const movieId = req.params.id;
  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/similar?language=en-US&page=1`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, similar: data.results });
  } catch (error) {
    console.log(`Error in getSimilarMovies controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getMoviesByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const url = `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, content: data.results });
  } catch (error) {
    console.log(`Error in getMoviesByCategory controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

export {
  getTrendingMovie,
  getMovieTrailers,
  getMovieDetails,
  getSimilarMovies,
  getMoviesByCategory,
};
