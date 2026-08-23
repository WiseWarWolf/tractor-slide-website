import { useEffect, useRef, useState } from "react";
import "./Media.css";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogv", ".mov", ".m4v"];

// A slide is a video if it says so, or if its file looks like one.
export function isVideo(slide) {
  if (slide.type) return slide.type === "video";
  const src = slide.src.toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => src.endsWith(extension));
}

// One slide's picture or clip. Falls back to a labelled placeholder when the
// file isn't there yet. Used by the carousel and the home page cards.
export default function Media({ slide, isActive = true, controls = true }) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);

  const video = isVideo(slide);

  // Swiping away from a playing clip should stop it, not leave it talking
  // from off screen.
  useEffect(() => {
    const element = videoRef.current;
    if (element && !isActive) element.pause();
  }, [isActive]);

  if (failed) {
    return (
      <div className="media-placeholder">
        <span className="emoji" role="img" aria-label="tractor">
          🚜
        </span>
        <span>{video ? "Video" : "Photo"} not added yet</span>
        <code>public{slide.src}</code>
      </div>
    );
  }

  if (video) {
    return (
      <video
        ref={videoRef}
        className="media"
        src={process.env.PUBLIC_URL + slide.src}
        poster={slide.poster ? process.env.PUBLIC_URL + slide.poster : undefined}
        aria-label={slide.alt}
        controls={controls}
        // Cards use it as a still, so they get a muted, control-less preview.
        muted={!controls}
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      className="media"
      src={process.env.PUBLIC_URL + slide.src}
      alt={slide.alt}
      draggable="false"
      onError={() => setFailed(true)}
    />
  );
}
