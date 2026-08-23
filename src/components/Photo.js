import { useState } from "react";
import "./Photo.css";

// A photo that degrades into a labelled placeholder when the file isn't in
// public/images/ yet. Used by the carousel and by the cards on the home page.
export default function Photo({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="photo-placeholder">
        <span className="emoji" role="img" aria-label="tractor">
          🚜
        </span>
        <span>Photo not added yet</span>
        <code>public{src}</code>
      </div>
    );
  }

  return (
    <img
      className="photo"
      src={process.env.PUBLIC_URL + src}
      alt={alt}
      draggable="false"
      onError={() => setFailed(true)}
    />
  );
}
