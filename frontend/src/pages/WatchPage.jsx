import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useContentStore } from "../store/content.js";
import Navbar from "../components/Navbar.jsx";
import WatchPageSkeleton from "../components/skeletons/WatchPageSkeleton.jsx";
import { formatReleaseDate } from "../utils/dateFunction.js";
import {
  ORIGINAL_IMG_BASE_URL,
  SMALL_IMG_BASE_URL,
} from "../utils/constants.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPlayer from "react-player";

const WatchPage = () => {
  const { id } = useParams();
  const [trailers, setTrailers] = useState([]);
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});
  const [similarContent, setSimilarContent] = useState([]);

  const { contentType } = useContentStore();

  //   Slider Functions!
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    sliderRef.current.scrollBy({
      left: sliderRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const getTrailers = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/trailers`);
        setTrailers(res.data.trailers);
      } catch (error) {
        if (error.message.includes("404")) {
          setTrailers([]);
        }
      }
    };

    getTrailers();
  }, [contentType, id]);

  useEffect(() => {
    const getSimilar = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/similar`);
        setSimilarContent(res.data.similar);
      } catch (error) {
        if (error.message.includes("404")) {
          setSimilarContent([]);
        }
      }
    };

    getSimilar();
  }, [contentType, id]);

  useEffect(() => {
    const getContentDetails = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
        setContent(res.data.content);
      } catch (error) {
        if (error.message.includes("404")) {
          setContent(null);
        }
      } finally {
        setLoading(false);
      }
    };

    getContentDetails();
  }, [contentType, id]);

  const handlePrev = () => {
    if (currentTrailerIndex > 0) {
      setCurrentTrailerIndex(currentTrailerIndex - 1);
    }
  };
  const handleNext = () => {
    if (currentTrailerIndex < trailers.length - 1) {
      setCurrentTrailerIndex(currentTrailerIndex + 1);
    }
  };

  if (loading)
    return (
      <div className="max-h-screen bg-black p-10">
        <WatchPageSkeleton />
      </div>
    );

  if (!content)
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Content Not Found
          </h2>
          <p className="text-lg md:text-xl mb-8">
            The movie or TV show you are looking for does not exist or has been
            removed.
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="mx-auto container px-4 py-8 h-full">
        {trailers.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <button
              className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 
                    px-4 rounded ${
                      currentTrailerIndex === 0
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
              disabled={currentTrailerIndex === 0}
              onClick={handlePrev}>
              <ChevronLeft size={24} />
            </button>
            <button
              className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 
                    px-4 rounded ${
                      currentTrailerIndex === trailers.length - 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
              disabled={currentTrailerIndex === trailers.length - 1}
              onClick={handleNext}>
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        <div className="aspect-video mb-8 p-2 sm:px-10 md:px-32">
          {trailers.length > 0 && (
            <ReactPlayer
              controls={true}
              width={"100%"}
              height={"70vh"}
              className="mx-auto overflow-hidden rounded-lg"
              src={`https://www.youtube.com/watch?v=${trailers[currentTrailerIndex]["key"]}`}
            />
          )}

          {trailers.length === 0 && (
            <h2 className="text-xl text-center mt-5">
              No Trailers available for{" "}
              <span className="font-bold text-red-600">
                {content?.title || content?.name}
              </span>
            </h2>
          )}
        </div>
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-20 
            max-w-6xl mx-auto">
          <div className="mb-4 md:mb-0">
            <h2 className="text-5xl font-bold text-balance">
              {content?.title || content?.name}
            </h2>
            <p className="mt-2 text-lg">
              {formatReleaseDate(
                content?.release_date || content?.first_air_date
              )}{" "}
              |{" "}
              {content?.adult ? (
                <span className="text-red-600">18+</span>
              ) : (
                <span className="text-green-600">PG-13</span>
              )}{" "}
            </p>
            <p className="mt-4 text-lg">{content?.overview}</p>
          </div>
          <img
            src={ORIGINAL_IMG_BASE_URL + content?.poster_path}
            alt="poster image"
            className="max-h-[600px] rounded-md"
          />
        </div>

        {similarContent.length > 0 && (
          <div className="mt-12 max-w-5xl mx-auto relative">
            <h3 className="mb-4 text-3xl font-bold">Similar Movies/TV Shows</h3>
            <div
              className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group"
              ref={sliderRef}>
              {similarContent.map((content) => {
                if (content.poster_path === null) return null;
                return (
                  <Link
                    key={content.id}
                    to={`/watch/${content.id}`}
                    className="w-52 flex-none">
                    <img
                      src={SMALL_IMG_BASE_URL + content.poster_path}
                      alt="Poster image"
                      className="w-full h-auto rounded-md"
                    />
                    <h4 className="mt-2 text-lg font-semibold">
                      {content.title || content.name}
                    </h4>
                  </Link>
                );
              })}

              <ChevronRight
                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8
					    opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer
					    bg-red-600 text-white rounded-full"
                onClick={scrollRight}
              />

              <ChevronLeft
                className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 opacity-0 
						group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 
						text-white rounded-full"
                onClick={scrollLeft}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
