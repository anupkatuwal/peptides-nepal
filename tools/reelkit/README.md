# Reel kit

Makes @peptidesnepal reels: text cards in HTML/CSS become a 1080x1920 MP4 with
original background music (generated in `music.py`, no samples, nothing to license).

```
pip install --break-system-packages playwright numpy scipy pillow   # only if missing
python3 tools/reelkit/make_reel.py path/to/spec.json OUT_DIR
```

Output in `OUT_DIR`: `reel.mp4`, `cover.jpg`, `sheet.jpg` (every finished card on one
image, for a visual check) and `report.json`. The script exits with an error if the video
has no audio, the music is too quiet, or the size or length is wrong.

See `examples/example-spec.json` for the spec format, and the docstring in `make_reel.py`.

- Built-in fonts: "Kit Display" (Bricolage Grotesque 800) and "Kit Sans" (DM Sans).
- Elements with class `step` appear one at a time.
- Keep text inside `.safe` (Instagram covers the top 220 px, the bottom 440 px and the right 140 px).
- Music moods: `lofi`, `bright`, `ambient`. Change `seed` every reel so no two sound the same.

Published reels are hosted on the education site: copy `reel.mp4` and `cover.jpg` to
`edu/static/r/<YYYY-MM-DD-slug>/`, push to main, and they are served at
`https://learnpeptides.anup-katuwal.com.np/r/<YYYY-MM-DD-slug>/reel.mp4`.
