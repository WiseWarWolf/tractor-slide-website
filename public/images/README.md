# Slide show media

Drop photos and video clips in this folder, then list them in the vehicle's
data file — `src/data/clarence.js`, or a new file beside it for a new machine.

- **Photos**: landscape looks best, since the frame is 3:2.
- **Videos**: `.mp4` (H.264) is the safe choice — every browser plays it.
  `.webm` works nearly everywhere too. `.mov` is unreliable outside Safari, so
  convert those to `.mp4` first. Give a video a `poster` image if you want a
  particular frame showing before it plays.

Until a file exists, that slide shows a striped placeholder naming the file
it's looking for.
