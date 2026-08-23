import { useCallback, useEffect, useRef, useState } from "react";
import Media from "./Media";
import "./Carousel.css";

// How long to wait between wheel-triggered slide changes, so one flick of a
// trackpad doesn't fly through the whole show.
const WHEEL_COOLDOWN_MS = 500;
// How far a drag has to travel before it counts as a swipe.
const SWIPE_THRESHOLD_PX = 50;
// Most dots to show at once. Past this the row becomes first … window … last.
const MAX_DOTS = 7;

// Which dots to draw: every index when there are few, otherwise the first and
// last plus a window around the current slide, with "…" standing in for the
// stretches left out.
function dotItems(count, index) {
  if (count <= MAX_DOTS) {
    return Array.from({ length: count }, (_, i) => i);
  }

  const inner = MAX_DOTS - 2; // slots between the first and last dot
  let start = index - Math.floor((inner - 1) / 2);
  let end = start + inner - 1;
  if (start < 1) {
    start = 1;
    end = inner;
  }
  if (end > count - 2) {
    end = count - 2;
    start = end - inner + 1;
  }

  const items = [0];
  if (start > 1) items.push("gap-left");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < count - 2) items.push("gap-right");
  items.push(count - 1);
  return items;
}

function Slide({ slide, isActive }) {
  return (
    <div className={`carousel-slide${isActive ? " is-active" : ""}`} aria-hidden={!isActive}>
      <div className="carousel-frame">
        <Media slide={slide} isActive={isActive} />
      </div>
    </div>
  );
}

export default function Carousel({ slides }) {
  const [index, setIndex] = useState(0);
  // Live offset while a drag is in progress, so the photos follow the pointer.
  const [dragX, setDragX] = useState(0);
  const drag = useRef({ active: false, startX: 0 });
  const lastWheelAt = useRef(0);

  const count = slides.length;

  const goTo = useCallback(
    (next) => setIndex(((next % count) + count) % count),
    [count]
  );
  // One place every gesture ends up: -1 goes back, 1 goes forward.
  const advance = useCallback((direction) => goTo(index + direction), [goTo, index]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "ArrowLeft") advance(-1);
      if (event.key === "ArrowRight") advance(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance]);

  // Pointer events cover touch swipes, mouse drags and pen alike.
  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // A press on a video is aimed at its controls, not at dragging the show.
    if (event.target.closest("video")) return;
    drag.current = { active: true, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!drag.current.active) return;
    setDragX(event.clientX - drag.current.startX);
  }

  function onPointerEnd(event) {
    if (!drag.current.active) return;
    const travelled = event.clientX - drag.current.startX;
    drag.current.active = false;
    setDragX(0);
    if (Math.abs(travelled) >= SWIPE_THRESHOLD_PX) advance(travelled < 0 ? 1 : -1);
  }

  function onWheel(event) {
    // Only react to sideways intent: a horizontal trackpad swipe, or
    // shift + wheel. Plain vertical scrolling still scrolls the page.
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
        ? event.deltaY
        : 0;
    if (Math.abs(delta) < 15) return;

    const now = Date.now();
    if (now - lastWheelAt.current < WHEEL_COOLDOWN_MS) return;
    lastWheelAt.current = now;

    advance(delta > 0 ? 1 : -1);
  }

  if (count === 0) return null;

  const dragging = drag.current.active;

  return (
    <div className="carousel">
      <div
        className={`carousel-viewport${dragging ? " is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onWheel={onWheel}
        aria-roledescription="carousel"
        aria-label="Clarence the tractor slide show"
      >
        <div
          className={`carousel-track${dragging ? " is-dragging" : ""}`}
          style={{
            transform: `translateX(calc(var(--peek) - ${index} * var(--slide-w) + ${dragX}px))`,
          }}
        >
          {slides.map((slide, i) => (
            <Slide key={slide.src} slide={slide} isActive={i === index} />
          ))}
        </div>
      </div>

      <p className="carousel-caption" aria-live="polite">
        {slides[index].caption}
      </p>

      <div className="carousel-controls">
        <button className="carousel-arrow" onClick={() => advance(-1)} aria-label="Previous photo">
          ◀
        </button>
        <div className="carousel-dots">
          {dotItems(count, index).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="carousel-dot-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                className={`carousel-dot${item === index ? " is-active" : ""}`}
                onClick={() => goTo(item)}
                aria-label={`Go to photo ${item + 1}`}
                aria-current={item === index}
              />
            )
          )}
        </div>
        <button className="carousel-arrow" onClick={() => advance(1)} aria-label="Next photo">
          ▶
        </button>
      </div>

      <p className="carousel-counter">
        {index + 1} / {count}
      </p>
      <p className="carousel-hint">Drag or swipe, use ← →, or shift + scroll</p>
    </div>
  );
}
