import { fetchFromTmdb } from "../services/tmdb.service.js";

const getTrendingTv = async (req, res) => {
  try {
    const url = "https://api.themoviedb.org/3/trending/tv/day?language=en-US";
    const data = await fetchFromTmdb(url);
    const randomTv = data.results[Math.floor(Math.random() * data.results?.length)];
    res.status(200).json({ success: true, content: randomTv });
  } catch (error) {
    console.log(`Error in getTrendingTv controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getTvTrailers = async (req, res) => {
  const tvId = req.params.id;
  try {
    const url = `https://api.themoviedb.org/3/tv/${tvId}/videos?language=en-US`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, trailers: data.results });
  } catch (error) {
    if (error.message.includes("404")) {
      return res.status(404).send(null);
    }
    console.log(`Error in getTvTrailers controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getTvDetails = async (req, res) => {
  const tvId = req.params.id;
  try {
    const url = `https://api.themoviedb.org/3/tv/${tvId}?language=en-US`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, content: data });
  } catch (error) {
    if (error.message.includes("404")) {
      res.status(404).send(null);
    }
    console.log(`Error in getTvTrailers controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getSimilarTvs = async (req, res) => {
  const tvId = req.params.id;
  try {
    const url = `https://api.themoviedb.org/3/tv/${tvId}/similar?language=en-US&page=1`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, similar: data.results });
  } catch (error) {
    console.log(`Error in getSimilarMovies controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getTvsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const url = `https://api.themoviedb.org/3/tv/${category}?language=en-US&page=1`;
    const data = await fetchFromTmdb(url);
    res.status(200).json({ success: true, content: data.results });
  } catch (error) {
    console.log(`Error in getMoviesByCategory controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

export {
  getTrendingTv,
  getTvTrailers,
  getTvDetails,
  getSimilarTvs,
  getTvsByCategory,
};
