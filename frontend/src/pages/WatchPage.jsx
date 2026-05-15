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
import { ChevronLeft, ChevronRight, X, Lock, Unlock, Play } from "lucide-react";
import ReactPlayer from "react-player";

const WatchPage = () => {
  const { id } = useParams();
  const [trailers, setTrailers] = useState([]);
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});
  const [similarContent, setSimilarContent] = useState([]);

  // ── Secret stream state ──────────────────────────────────────────────────────
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [streamUnlocked, setStreamUnlocked] = useState(false);
  const [streamToken, setStreamToken] = useState("");
  // TV controls
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [tvReady, setTvReady] = useState(false);
  // ────────────────────────────────────────────────────────────────────────────

  const { contentType } = useContentStore();
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const getTrailers = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/trailers`);
        setTrailers(res.data.trailers);
      } catch (error) {
        if (error.message.includes("404")) setTrailers([]);
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
        if (error.message.includes("404")) setSimilarContent([]);
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
        if (error.message.includes("404")) setContent(null);
      } finally {
        setLoading(false);
      }
    };
    getContentDetails();
  }, [contentType, id]);

  // Reset stream when navigating to a new title
  useEffect(() => {
    setStreamUnlocked(false);
    setStreamToken("");
    setCodeInput("");
    setCodeError("");
    setTvReady(false);
    setSeason(1);
    setEpisode(1);
  }, [id]);

  const handlePrev = () => {
    if (currentTrailerIndex > 0) setCurrentTrailerIndex(currentTrailerIndex - 1);
  };
  const handleNext = () => {
    if (currentTrailerIndex < trailers.length - 1) setCurrentTrailerIndex(currentTrailerIndex + 1);
  };

  // ── Secret handlers ──────────────────────────────────────────────────────────
  const openSecretDialog = () => {
    if (streamUnlocked) return; // already unlocked, don't re-open
    setSecretDialogOpen(true);
    setCodeInput("");
    setCodeError("");
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/stream/unlock", {
        code: codeInput,
        contentId: id,
        contentType,
      });
      setStreamToken(res.data.streamToken);
      setCodeError("");
      setSecretDialogOpen(false);
      setStreamUnlocked(true);
      if (contentType === "tv") setTvReady(false);
    } catch {
      setCodeError("Wrong code. Try again.");
      setCodeInput("");
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

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
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Content Not Found</h2>
          <p className="text-lg md:text-xl mb-8">
            The movie or TV show you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );

  const isAdult = content?.adult;

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      {/* ── Secret Code Dialog ─────────────────────────────────────────────── */}
      {secretDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setSecretDialogOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="bg-red-600/20 rounded-full p-3">
                <Lock size={28} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Secret Access</h2>
              <p className="text-zinc-400 text-sm text-center">
                Enter your 10-digit code to unlock streaming.
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={10}
                value={codeInput}
                onChange={(e) => {
                  setCodeError("");
                  setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 10));
                }}
                placeholder="• • • • • • • • • •"
                className="w-full text-center tracking-[0.4em] bg-zinc-800 border border-zinc-600
                  rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none
                  focus:border-red-500 transition-colors text-lg"
                autoFocus
              />
              {codeError && (
                <p className="text-red-400 text-xs text-center">{codeError}</p>
              )}
              <button
                type="submit"
                disabled={codeInput.length !== 10}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40
                  disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg
                  transition-colors flex items-center justify-center gap-2"
              >
                <Unlock size={16} />
                Unlock
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────────── */}

      <div className="mx-auto container px-4 py-8 h-full">

        {/* Trailer navigation */}
        {trailers.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <button
              className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded
                ${currentTrailerIndex === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              disabled={currentTrailerIndex === 0}
              onClick={handlePrev}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded
                ${currentTrailerIndex === trailers.length - 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              disabled={currentTrailerIndex === trailers.length - 1}
              onClick={handleNext}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Trailer / no-trailer */}
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

        {/* Info row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-20 max-w-6xl mx-auto">
          <div className="mb-4 md:mb-0">
            <h2 className="text-5xl font-bold text-balance">
              {content?.title || content?.name}
            </h2>
            <p className="mt-2 text-lg flex items-center gap-2 flex-wrap">
              {formatReleaseDate(content?.release_date || content?.first_air_date)}
              {" | "}
              {/* ── Hidden trigger: click the rating badge ── */}
              <span
                onClick={openSecretDialog}
                title={streamUnlocked ? "Stream unlocked!" : undefined}
                className={`
                  cursor-pointer select-none font-semibold transition-all duration-200
                  ${isAdult ? "text-red-600" : "text-green-600"}
                  ${streamUnlocked
                    ? "underline decoration-dotted"
                    : "hover:opacity-70"}
                `}
              >
                {isAdult ? "18+" : "PG-13"}
                {streamUnlocked && (
                  <Unlock size={14} className="inline ml-1 mb-0.5 opacity-70" />
                )}
              </span>
            </p>
            <p className="mt-4 text-lg">{content?.overview}</p>
          </div>
          <img
            src={ORIGINAL_IMG_BASE_URL + content?.poster_path}
            alt="poster image"
            className="max-h-[600px] rounded-md"
          />
        </div>

        {/* ── Secret Stream Panel ────────────────────────────────────────────── */}
        {streamUnlocked && (
          <div className="mt-10 max-w-6xl mx-auto">
            <div className="border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-900">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Unlock size={15} className="text-red-500" />
                  Secret Stream - {content?.title || content?.name}
                </div>
                <button
                  onClick={() => {
                    setStreamUnlocked(false);
                    setStreamToken("");
                    setTvReady(false);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} className="cursor-pointer"/>
                </button>
              </div>

              {/* TV season/episode picker */}
              {contentType === "tv" && !tvReady && (
                <div className="flex flex-col items-center justify-center gap-5 py-10 px-6">
                  <p className="text-zinc-300 text-sm">Choose season &amp; episode to start streaming</p>
                  <div className="flex gap-4 flex-wrap justify-center">
                    <label className="flex flex-col items-center gap-1 text-xs text-zinc-400">
                      Season
                      <input
                        type="number"
                        min={1}
                        value={season}
                        onChange={(e) => setSeason(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center bg-zinc-800 border border-zinc-600 rounded-lg
                          px-2 py-1.5 text-white focus:outline-none focus:border-red-500"
                      />
                    </label>
                    <label className="flex flex-col items-center gap-1 text-xs text-zinc-400">
                      Episode
                      <input
                        type="number"
                        min={1}
                        value={episode}
                        onChange={(e) => setEpisode(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center bg-zinc-800 border border-zinc-600 rounded-lg
                          px-2 py-1.5 text-white focus:outline-none focus:border-red-500"
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => setTvReady(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold
                      px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Play size={16} fill="white" />
                    Start Streaming
                  </button>
                </div>
              )}

              {/* Iframe */}
              {streamToken && (contentType === "movie" || tvReady) && (
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={`/api/v1/stream/embed?t=${streamToken}${contentType === "tv" ? `&s=${season}&e=${episode}` : ""}`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    title="Secret Stream"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {/* ──────────────────────────────────────────────────────────────────── */}

        {/* Similar content */}
        {similarContent.length > 0 && (
          <div className="mt-12 max-w-5xl mx-auto relative">
            <h3 className="mb-4 text-3xl font-bold">Similar Movies/TV Shows</h3>
            <div
              className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group"
              ref={sliderRef}
            >
              {similarContent.map((item) => {
                if (item.poster_path === null) return null;
                return (
                  <Link
                    key={item.id}
                    to={`/watch/${item.id}`}
                    className="w-52 flex-none"
                  >
                    <img
                      src={SMALL_IMG_BASE_URL + item.poster_path}
                      alt="Poster image"
                      className="w-full h-auto rounded-md"
                    />
                    <h4 className="mt-2 text-lg font-semibold">
                      {item.title || item.name}
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
