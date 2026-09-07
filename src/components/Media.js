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
//
// A clip sits inert behind a play button until someone starts it. That's not
// only for looks: a <video controls> claims any touch that starts on it, so
// leaving the controls on would stop the page scrolling past the video.
export default function Media({ slide, isActive = true, controls = true }) {
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const videoRef = useRef(null);

  const video = isVideo(slide);

  // Swiping away from a playing clip stops it and puts it back behind its play
  // button, so scrolling over it is safe again next time round.
  useEffect(() => {
    if (isActive) return;
    const element = videoRef.current;
    if (element) element.pause();
    setStarted(false);
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
    function start() {
      setStarted(true);
      const element = videoRef.current;
      if (element && element.play) {
        const played = element.play();
        // Older browsers return nothing here; newer ones a promise that
        // rejects if playback is blocked, which is not worth throwing over.
        if (played && played.catch) played.catch(() => {});
      }
    }

    return (
      <div className="media-video">
        <video
          ref={videoRef}
          className="media"
          src={process.env.PUBLIC_URL + slide.src}
          poster={slide.poster ? process.env.PUBLIC_URL + slide.poster : undefined}
          aria-label={slide.alt}
          controls={controls && started}
          // Cards use a clip as a still, so they stay muted and silent.
          muted={!controls}
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
        {controls && !started && (
          <button
            type="button"
            className="media-play"
            onClick={start}
            aria-label={`Play video: ${slide.alt}`}
          >
            <span aria-hidden="true">▶</span>
          </button>
        )}
      </div>
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
