import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.js";

const unlockStream = (req, res) => {
  const { code, contentId, contentType } = req.body;

  if (!code || code !== ENV_VARS.SECRET_CODE) {
    return res.status(401).json({ success: false, message: "Invalid code" });
  }

  // Issue a signed, time-limited token — the actual streaming URL never leaves the server
  const streamToken = jwt.sign(
    { userId: req.user._id, contentId, contentType },
    ENV_VARS.JWT_SECRET,
    { expiresIn: "4h" }
  );

  res.status(200).json({ success: true, streamToken });
};

const serveStream = (req, res) => {
  const { t, s, e, src } = req.query;

  if (!t) return res.status(400).json({ success: false, message: "Missing stream token" });

  let payload;
  try {
    payload = jwt.verify(t, ENV_VARS.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired stream token" });
  }

  if (String(payload.userId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const { contentId, contentType } = payload;
  const source = src === "2" ? 2 : 1;
  const season = Math.max(1, parseInt(s) || 1);
  const episode = Math.max(1, parseInt(e) || 1);

  let targetUrl;

  if (source === 1) {
    // Original CDN — colour-branded embed
    if (contentType === "movie") {
      targetUrl = `https://${ENV_VARS.THE_STREAMING_URI}/embed/movie/${contentId}?color=e50914`;
    } else {
      targetUrl = `https://${ENV_VARS.THE_STREAMING_URI}/embed/tv/${contentId}/${season}/${episode}?color=e50914&episodeSelector=true`;
    }
  } else {
    // Server 2
    if (contentType === "movie") {
      targetUrl = `https://${ENV_VARS.STREAMING_URI_2}/movie/${contentId}?theme=e50914`;
    } else {
      targetUrl = `https://${ENV_VARS.STREAMING_URI_2}/tv/${contentId}/${season}/${episode}?theme=e50914`;
    }
  }

  res.redirect(302, targetUrl);
};

export { unlockStream, serveStream };
