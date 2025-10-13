import User from "../models/user.model.js";
import { fetchFromTmdb } from "../services/tmdb.service.js";

const searchPerson = async (req, res) => {
  const { query } = req.params;
  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query parameter is required" });
  }
  try {
    const url = `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=1`;
    const response = await fetchFromTmdb(url);
    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        searchHistory: {
          id: response.results[0].id,
          image: response.results[0].profile_path,
          title: response.results[0].name,
          searchType: "person",
          createdAt: new Date(),
        },
      },
    });

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log(`Error in searchPerson Controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const searchMovie = async (req, res) => {
  const { query } = req.params;
  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query parameter is required" });
  }
  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`;
    const response = await fetchFromTmdb(url);
    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        searchHistory: {
          id: response.results[0].id,
          image: response.results[0].poster_path,
          title: response.results[0].title,
          searchType: "movie",
          createdAt: new Date(),
        },
      },
    });

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log(`Error in searchMovie Controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const searchTv = async (req, res) => {
  const { query } = req.params;
  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query parameter is required" });
  }
  try {
    const url = `https://api.themoviedb.org/3/search/tv?query=${query}&include_adult=false&language=en-US&page=1`;
    const response = await fetchFromTmdb(url);
    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        searchHistory: {
          id: response.results[0].id,
          image: response.results[0].poster_path,
          title: response.results[0].name,
          searchType: "tv",
          createdAt: new Date(),
        },
      },
    });

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log(`Error in searchTv Controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    res.status(200).json({ success: true, content: req.user.searchHistory });
  } catch (error) {
    console.log(`Error in getSearchHistory Controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const removeItemFromSearchHistory = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "ID parameter is required" });
  }
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        searchHistory: { id: Number(id) },
      },
    });
    res.status(200).json({ success: true, message: "Item removed from search history" });
  } catch (error) {
    console.log(`Error in removeItemFromSearchHistory Controller: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  searchPerson,
  searchMovie,
  searchTv,
  getSearchHistory,
  removeItemFromSearchHistory,
};
