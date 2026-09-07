import { useCallback, useEffect, useRef, useState } from "react";
import Media from "./Media";
import "./Carousel.css";

// How long to wait between wheel-triggered slide changes, so one flick of a
// trackpad doesn't fly through the whole show.
const WHEEL_COOLDOWN_MS = 500;
// How far a drag has to travel before it counts as a swipe.
const SWIPE_THRESHOLD_PX = 50;
// How far a gesture has to move before we decide which way it's going.
const AXIS_LOCK_PX = 10;
// Sideways wheel movement has to add up to this much before the show moves,
// and a gap this long starts the tally over. Wobble never accumulates; a
// deliberate swipe crosses the line almost at once.
const WHEEL_ADVANCE_PX = 60;
const WHEEL_GESTURE_GAP_MS = 200;
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

// A fresh object each time: the live one gets mutated once its axis is known.
const noDrag = () => ({ id: null, startX: 0, startY: 0, axis: null });

export default function Carousel({ slides }) {
  const [index, setIndex] = useState(0);
  // Live offset while a sideways drag is in progress, so the photos follow
  // the pointer.
  const [dragX, setDragX] = useState(0);
  const drag = useRef(noDrag());
  const lastWheelAt = useRef(0);
  const wheelTally = useRef({ total: 0, at: 0 });

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

  // Pointer events cover touch swipes, mouse drags and pen alike. Nothing is
  // captured up front: a gesture has to prove it's horizontal first, so
  // scrolling the page still belongs to the page.
  function onPointerDown(event) {
    // Never inherit anything from a gesture that came before.
    drag.current = noDrag();
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // A press on a playing video is aimed at its controls. An unplayed clip
    // sits inert behind its play button, so it swipes like a photo.
    const video = event.target.closest("video");
    if (video && video.controls) return;
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
    };
  }

  function onPointerMove(event) {
    const state = drag.current;
    if (state.id !== event.pointerId) return;

    const travelledX = event.clientX - state.startX;
    const travelledY = event.clientY - state.startY;

    if (state.axis === null) {
      // Too early to tell — let the gesture develop.
      if (Math.max(Math.abs(travelledX), Math.abs(travelledY)) < AXIS_LOCK_PX) return;

      if (Math.abs(travelledY) >= Math.abs(travelledX)) {
        // They're scrolling the page. Bow out for the rest of the gesture.
        drag.current = noDrag();
        return;
      }

      state.axis = "x";
      // Only now take the pointer, so a vertical scroll is never intercepted.
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setDragX(travelledX);
  }

  function onPointerEnd(event) {
    const state = drag.current;
    if (state.id !== event.pointerId) return;

    const travelled = event.clientX - state.startX;
    const wasHorizontal = state.axis === "x";
    drag.current = noDrag();
    setDragX(0);

    if (wasHorizontal && Math.abs(travelled) >= SWIPE_THRESHOLD_PX) {
      advance(travelled < 0 ? 1 : -1);
    }
  }

  function onWheel(event) {
    const now = Date.now();
    const tally = wheelTally.current;

    // Shift + wheel is unambiguous. Otherwise only sideways-dominant movement
    // counts, and plain vertical scrolling is left to the page.
    const sideways = event.shiftKey
      ? (Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY)
      : (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0);

    if (sideways === 0) {
      // A vertical frame forgets whatever sideways drift came before it, so
      // the jitter a trackpad emits mid-scroll can never add up to a swipe.
      tally.total = 0;
      return;
    }

    if (now - tally.at > WHEEL_GESTURE_GAP_MS) tally.total = 0;
    tally.at = now;
    tally.total += sideways;

    if (Math.abs(tally.total) < WHEEL_ADVANCE_PX) return;
    if (now - lastWheelAt.current < WHEEL_COOLDOWN_MS) return;

    lastWheelAt.current = now;
    tally.total = 0;
    advance(sideways > 0 ? 1 : -1);
  }

  if (count === 0) return null;

  const dragging = drag.current.axis === "x";

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
