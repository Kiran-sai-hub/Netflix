import { ENV_VARS } from "../config/envVars.js";

const unlockStream = (req, res) => {
  const { code, contentId, contentType, season, episode } = req.body;

  if (!code || code !== ENV_VARS.SECRET_CODE) {
    return res.status(401).json({ success: false, message: "Invalid code" });
  }

  let streamUrl;
  if (contentType === "movie") {
    streamUrl = `https://${ENV_VARS.THE_STREAMING_URI}/embed/movie/${contentId}?color=e50914`;
  } else {
    const s = season || 1;
    const e = episode || 1;
    streamUrl = `https://${ENV_VARS.THE_STREAMING_URI}/embed/tv/${contentId}/${s}/${e}?color=e50914&episodeSelector=true`;
  }

  res.status(200).json({ success: true, streamUrl });
};

export { unlockStream };
