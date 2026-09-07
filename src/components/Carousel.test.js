import { act, render, screen } from "@testing-library/react";
import Carousel from "./Carousel";

const slides = [
  { src: "/images/a.jpg", alt: "a", caption: "Slide A" },
  { src: "/images/b.jpg", alt: "b", caption: "Slide B" },
  { src: "/images/c.jpg", alt: "c", caption: "Slide C" },
];

// jsdom has no PointerEvent, and React reports null for every coordinate on a
// plain fireEvent.pointer* call. A MouseEvent named as a pointer event does
// carry real clientX/clientY, which is what these gestures are about.
function pointer(element, type, { x, y, id = 1 }) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
  });
  event.pointerId = id;
  event.pointerType = "touch";
  act(() => element.dispatchEvent(event));
}

function wheel(element, { deltaX, deltaY, shiftKey = false }) {
  const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaX, deltaY, shiftKey });
  act(() => element.dispatchEvent(event));
}

function setup() {
  render(<Carousel slides={slides} />);
  const viewport = document.querySelector(".carousel-viewport");
  viewport.setPointerCapture = () => {}; // not implemented in jsdom
  return { viewport };
}

// The carousel only wears this class once it has taken over a gesture, so it
// stands in for "the photos are being dragged". (jsdom can't parse the calc()
// transform itself, so the class is what there is to assert on.)
const isDragging = (viewport) => viewport.classList.contains("is-dragging");

test("scrolling the page vertically does not drag the slides", () => {
  const { viewport } = setup();

  pointer(viewport, "pointerdown", { x: 200, y: 200 });
  // A vertical scroll with the sideways wobble a real thumb produces.
  pointer(viewport, "pointermove", { x: 206, y: 260 });
  expect(isDragging(viewport)).toBe(false);
  pointer(viewport, "pointermove", { x: 214, y: 340 });
  expect(isDragging(viewport)).toBe(false);
  pointer(viewport, "pointerup", { x: 214, y: 340 });

  expect(screen.getByText("Slide A")).toBeInTheDocument();
});

test("a gesture that starts vertical stays ignored even if it turns sideways", () => {
  const { viewport } = setup();

  pointer(viewport, "pointerdown", { x: 200, y: 200 });
  pointer(viewport, "pointermove", { x: 202, y: 260 }); // commits to vertical
  pointer(viewport, "pointermove", { x: 60, y: 265 }); // now swings far sideways
  expect(isDragging(viewport)).toBe(false);
  pointer(viewport, "pointerup", { x: 60, y: 265 });

  expect(screen.getByText("Slide A")).toBeInTheDocument();
});

test("a sideways swipe takes over the gesture and advances", () => {
  const { viewport } = setup();

  pointer(viewport, "pointerdown", { x: 300, y: 200 });
  pointer(viewport, "pointermove", { x: 280, y: 203 });
  expect(isDragging(viewport)).toBe(true);
  pointer(viewport, "pointermove", { x: 200, y: 205 });
  pointer(viewport, "pointerup", { x: 200, y: 205 });

  expect(screen.getByText("Slide B")).toBeInTheDocument();
  expect(isDragging(viewport)).toBe(false); // released back to the slide
});

test("a short sideways nudge snaps back instead of advancing", () => {
  const { viewport } = setup();

  pointer(viewport, "pointerdown", { x: 300, y: 200 });
  pointer(viewport, "pointermove", { x: 280, y: 200 });
  pointer(viewport, "pointerup", { x: 280, y: 200 });

  expect(screen.getByText("Slide A")).toBeInTheDocument();
});

test("a cancelled gesture leaves nothing stuck in drag state", () => {
  const { viewport } = setup();

  pointer(viewport, "pointerdown", { x: 300, y: 200 });
  pointer(viewport, "pointermove", { x: 280, y: 203 });
  pointer(viewport, "pointercancel", { x: 280, y: 203 });

  expect(isDragging(viewport)).toBe(false);
});

test("a stray move from another finger is ignored", () => {
  const { viewport } = setup();

  pointer(viewport, "pointerdown", { x: 300, y: 200, id: 1 });
  pointer(viewport, "pointermove", { x: 100, y: 200, id: 2 });

  expect(isDragging(viewport)).toBe(false);
});

test("a vertical wheel scroll with trackpad jitter does not change slide", () => {
  const { viewport } = setup();

  // The shape that caused the bug: frames where the sideways noise briefly
  // exceeds the vertical movement, in among ordinary vertical scrolling.
  wheel(viewport, { deltaX: 18, deltaY: 12 });
  wheel(viewport, { deltaX: 4, deltaY: 40 });
  wheel(viewport, { deltaX: 20, deltaY: 14 });
  wheel(viewport, { deltaX: 2, deltaY: 55 });
  wheel(viewport, { deltaX: 16, deltaY: 9 });

  expect(screen.getByText("Slide A")).toBeInTheDocument();
});

test("sideways wobble that never settles on a direction is ignored", () => {
  const { viewport } = setup();

  wheel(viewport, { deltaX: 18, deltaY: 2 });
  wheel(viewport, { deltaX: -16, deltaY: 3 });
  wheel(viewport, { deltaX: 15, deltaY: 1 });
  wheel(viewport, { deltaX: -17, deltaY: 2 });

  expect(screen.getByText("Slide A")).toBeInTheDocument();
});

test("a clearly sideways wheel gesture does change slide", () => {
  const { viewport } = setup();

  wheel(viewport, { deltaX: 60, deltaY: 5 });

  expect(screen.getByText("Slide B")).toBeInTheDocument();
});

test("a gentle sideways swipe adds up and still advances", () => {
  const { viewport } = setup();

  wheel(viewport, { deltaX: 22, deltaY: 3 });
  wheel(viewport, { deltaX: 21, deltaY: 2 });
  wheel(viewport, { deltaX: 20, deltaY: 4 });

  expect(screen.getByText("Slide B")).toBeInTheDocument();
});

test("shift plus wheel still works as a deliberate sideways gesture", () => {
  const { viewport } = setup();

  wheel(viewport, { deltaX: 0, deltaY: 60, shiftKey: true });

  expect(screen.getByText("Slide B")).toBeInTheDocument();
});

describe("video slides", () => {
  const withVideo = [
    { src: "/images/clip.mp4", alt: "a clip", caption: "The Clip" },
    { src: "/images/b.jpg", alt: "b", caption: "Slide B" },
  ];

  function setupVideo() {
    render(<Carousel slides={withVideo} />);
    const viewport = document.querySelector(".carousel-viewport");
    viewport.setPointerCapture = () => {};
    return { viewport, video: document.querySelector("video") };
  }

  test("a clip sits inert behind a play button, so it can't swallow a scroll", () => {
    const { video } = setupVideo();

    expect(video).toBeInTheDocument();
    expect(video.controls).toBe(false);
    expect(screen.getByRole("button", { name: /play video/i })).toBeInTheDocument();
  });

  test("swiping from an unplayed clip works like swiping a photo", () => {
    const { viewport, video } = setupVideo();

    pointer(video, "pointerdown", { x: 300, y: 200 });
    pointer(video, "pointermove", { x: 280, y: 203 });
    expect(isDragging(viewport)).toBe(true);
    pointer(video, "pointermove", { x: 200, y: 205 });
    pointer(video, "pointerup", { x: 200, y: 205 });

    expect(screen.getByText("Slide B")).toBeInTheDocument();
  });

  test("scrolling vertically from a clip does not drag the show", () => {
    const { viewport, video } = setupVideo();

    pointer(video, "pointerdown", { x: 200, y: 200 });
    pointer(video, "pointermove", { x: 206, y: 260 });
    pointer(video, "pointermove", { x: 214, y: 340 });
    expect(isDragging(viewport)).toBe(false);
    pointer(video, "pointerup", { x: 214, y: 340 });

    expect(screen.getByText("The Clip")).toBeInTheDocument();
  });

  test("once playing, the controls take the gesture instead of the carousel", () => {
    const { viewport, video } = setupVideo();
    video.play = () => Promise.resolve(); // jsdom has no playback

    act(() => screen.getByRole("button", { name: /play video/i }).click());
    expect(video.controls).toBe(true);

    // A drag across the timeline must not swipe the show out from under it.
    pointer(video, "pointerdown", { x: 300, y: 200 });
    pointer(video, "pointermove", { x: 200, y: 205 });
    expect(isDragging(viewport)).toBe(false);
    pointer(video, "pointerup", { x: 200, y: 205 });

    expect(screen.getByText("The Clip")).toBeInTheDocument();
  });
});

test("every slide in the real data carries alt text for screen readers", () => {
  // eslint-disable-next-line global-require
  const slides = require("../data/clarence").default;
  expect(slides.filter((slide) => !slide.alt)).toEqual([]);
});
