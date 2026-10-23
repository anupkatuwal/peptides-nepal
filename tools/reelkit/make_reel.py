"""Turn a reel spec (text cards in HTML/CSS) into a 1080x1920 MP4 with original music.

    python3 tools/reelkit/make_reel.py spec.json OUT_DIR

Writes OUT_DIR/reel.mp4, OUT_DIR/cover.jpg, OUT_DIR/sheet.jpg (all frames on one
image, for checking) and OUT_DIR/report.json. Exits non-zero if a check fails.

Spec (JSON):
{
  "css": "...",                 shared CSS for every card; relative url()s resolve from the spec's folder
  "cards": [{"html": "...", "hold": 0.8}, ...],
                                each card is one 1080x1920 screen. Elements with class "step"
                                appear one by one, in page order. "hold" = extra seconds on the
                                finished card (optional).
  "music": {"mood": "lofi" | "bright" | "ambient", "seed": 123},
  "transition": "slideleft"     ffmpeg xfade name used between cards (optional)
}
Built-in fonts: "Kit Display" (Bricolage Grotesque 800) and "Kit Sans" (DM Sans 400/700).
For other looks, npm install @fontsource/<font> next to the spec and use url(node_modules/...).
Keep text inside the safe area: nothing important in the top 220 px, the bottom 440 px or the
right 140 px, because Instagram draws its buttons and caption there. The base CSS gives every
card a .safe box with that padding.
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import music  # noqa: E402

W, H, FPS = 1080, 1920, 30
WORDS_PER_SEC = 4.2
FONT_DIR = Path(__file__).parent / "fonts"
FONT_CSS = "".join(
    f'@font-face {{ font-family: "{fam}"; src: url({(FONT_DIR / f).as_uri()}); font-weight: {wt}; }}\n'
    for fam, f, wt in (("Kit Display", "bricolage-grotesque-latin-800-normal.woff2", 800),
                       ("Kit Sans", "dm-sans-latin-400-normal.woff2", 400),
                       ("Kit Sans", "dm-sans-latin-700-normal.woff2", 700)))
BASE_CSS = FONT_CSS + """
html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; }
* { box-sizing: border-box; }
.card { position: relative; width: 1080px; height: 1920px; overflow: hidden; }
.safe { position: absolute; inset: 220px 140px 440px 80px; display: flex; flex-direction: column; justify-content: center; }
"""


def words(text):
    return len([w for w in text.split() if any(c.isalnum() for c in w)])


def render_states(spec, spec_dir, work):
    from playwright.sync_api import sync_playwright

    states = []  # (png_path, seconds, card_index)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for ci, card in enumerate(spec["cards"]):
            html = f"""<!doctype html><html><head><meta charset="utf-8">
<style>{BASE_CSS}</style><style>{spec.get('css', '')}</style>{spec.get('head', '')}</head>
<body><div class="card card-{ci + 1}">{card['html']}</div></body></html>"""
            f = spec_dir / f".card-{ci + 1}.html"
            f.write_text(html, encoding="utf-8")
            page.goto(f.as_uri())
            page.evaluate("document.fonts.ready")
            page.wait_for_timeout(250)
            info = page.evaluate("""() => {
                const steps = [...document.querySelectorAll('.step')];
                const all = document.body.innerText;
                const stepText = steps.map(s => s.innerText);
                return { all, stepText };
            }""")
            n = len(info["stepText"])
            step_words = [words(t) for t in info["stepText"]]
            base_words = max(0, words(info["all"]) - sum(step_words))
            for k in range(n + 1):
                page.evaluate("""k => document.querySelectorAll('.step').forEach((s, i) => {
                    s.style.visibility = i < k ? 'visible' : 'hidden'; })""", k)
                out = work / f"c{ci + 1:02d}-s{k:02d}.png"
                page.screenshot(path=str(out))
                if k == 0:
                    if n:  # a card that builds up: get to the first reveal quickly
                        secs = max(1.2 if ci == 0 else 0.45, 0.3 + base_words / WORDS_PER_SEC)
                    else:
                        secs = max(1.4 if ci == 0 else 0.9, 0.8 + base_words / WORDS_PER_SEC)
                else:
                    secs = 0.45 + step_words[k - 1] / WORDS_PER_SEC
                if k == n:
                    secs += float(card.get("hold", 0.5))
                states.append((out, round(min(secs, 5.0), 2), ci))
            f.unlink()
        browser.close()
    return states


def build_video(states, spec, work, out_dir):
    card_t = 0.32
    step_t = 0.18
    trans_name = spec.get("transition", "slideleft")
    durs = [s[1] for s in states]
    trans = []
    for i in range(len(states) - 1):
        trans.append(card_t if states[i + 1][2] != states[i][2] else step_t)
    trans.append(0.0)
    args = ["ffmpeg", "-y", "-loglevel", "error"]
    for (png, d, _), t in zip(states, trans):
        args += ["-loop", "1", "-framerate", str(FPS), "-t", f"{d + t:.3f}", "-i", str(png)]
    total = sum(durs)
    music_path = work / "music.wav"
    m = spec.get("music", {})
    audio, meta = music.make(total + 0.5, int(m.get("seed", 1)), m.get("mood", "lofi"))
    music.write_wav(str(music_path), audio)
    args += ["-i", str(music_path)]

    parts = []
    prev = "[0:v]"
    cur_len = durs[0] + trans[0]
    for i in range(1, len(states)):
        t = trans[i - 1]
        name = trans_name if states[i][2] != states[i - 1][2] else "fade"
        offset = cur_len - t
        label = f"[x{i}]"
        parts.append(f"{prev}[{i}:v]xfade=transition={name}:duration={t:.3f}:offset={offset:.3f}{label}")
        prev = label
        cur_len = offset + durs[i] + trans[i]
    vf = ";".join(parts) + (";" if parts else "") + f"{prev}format=yuv420p,fps={FPS}[v]"
    fade_out = min(1.2, total / 4)
    af = f"[{len(states)}:a]atrim=0:{total:.3f},afade=t=out:st={total - fade_out:.3f}:d={fade_out:.3f}[a]"
    out = out_dir / "reel.mp4"
    args += ["-filter_complex", vf + ";" + af, "-map", "[v]", "-map", "[a]",
             "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-profile:v", "high", "-pix_fmt", "yuv420p",
             "-r", str(FPS), "-g", str(FPS * 2), "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
             "-movflags", "+faststart", "-t", f"{total:.3f}", str(out)]
    subprocess.run(args, check=True)
    return out, total, meta


def contact_sheet(states, out_dir):
    from PIL import Image

    finals = {}
    for png, _, ci in states:
        finals[ci] = png  # last state of each card
    imgs = [Image.open(p).convert("RGB").resize((270, 480)) for p in finals.values()]
    cols = min(4, len(imgs))
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 280 + 10, rows * 490 + 10), (90, 90, 90))
    for i, im in enumerate(imgs):
        sheet.paste(im, (10 + (i % cols) * 280, 10 + (i // cols) * 490))
    sheet.save(out_dir / "sheet.jpg", quality=88)
    first = [p for p, _, ci in states if ci == 0][-1]
    Image.open(first).convert("RGB").save(out_dir / "cover.jpg", quality=92)


def check(out):
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(out)],
                                      capture_output=True, text=True, check=True).stdout)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    a = [s for s in probe["streams"] if s["codec_type"] == "audio"]
    vol = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(out), "-af", "volumedetect", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    mean = next((float(l.split(":")[1].split()[0]) for l in vol.splitlines() if "mean_volume" in l), -99.0)
    dur = float(probe["format"]["duration"])
    rep = {"width": v["width"], "height": v["height"], "duration": round(dur, 2), "video_codec": v["codec_name"],
           "has_audio": bool(a), "audio_codec": a[0]["codec_name"] if a else None, "mean_volume_db": mean,
           "size_mb": round(int(probe["format"]["size"]) / 1e6, 2)}
    problems = []
    if (v["width"], v["height"]) != (W, H):
        problems.append("wrong size")
    if not a:
        problems.append("no audio track")
    if mean < -35:
        problems.append(f"music too quiet ({mean} dB)")
    if not 5 <= dur <= 90:
        problems.append(f"duration {dur:.1f}s outside 5-90 s")
    rep["problems"] = problems
    return rep


def main():
    spec_path, out_dir = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    out_dir.mkdir(parents=True, exist_ok=True)
    work = out_dir / "_frames"
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir()
    states = render_states(spec, spec_path.parent, work)
    out, total, meta = build_video(states, spec, work, out_dir)
    contact_sheet(states, out_dir)
    rep = check(out)
    rep.update({"cards": len(spec["cards"]), "states": len(states), "music": meta,
                "timeline": [{"card": ci + 1, "seconds": d} for _, d, ci in states]})
    (out_dir / "report.json").write_text(json.dumps(rep, indent=2))
    if os.environ.get("KEEP_FRAMES") != "1":
        shutil.rmtree(work, ignore_errors=True)
    print(json.dumps(rep, indent=2))
    sys.exit(1 if rep["problems"] else 0)


if __name__ == "__main__":
    main()
