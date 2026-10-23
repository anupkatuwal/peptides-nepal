"""Original background music for @peptidesnepal reels, made from scratch with numpy.

No samples and no third-party recordings, so there is nothing to license.
Every seed gives a different key, tempo, chord progression and groove.

    python3 music.py --seconds 24 --seed 7 --mood lofi --out music.wav

Moods:
  lofi     slow swung beat, warm electric-piano chords, bass, soft vinyl hiss
  bright   faster, major key, plucked arpeggios over a light beat
  ambient  no drums; soft pads and a slow arpeggio, for serious topics
"""
import argparse
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
NOTE = {"C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
MAJOR = [0, 2, 4, 5, 7, 9, 11]

# Chord progressions as scale degrees (0 = I). Each chord is a diatonic 7th chord.
PROGRESSIONS = {
    "lofi": [[1, 4, 0, 5], [0, 5, 3, 4], [5, 3, 0, 4], [3, 2, 1, 4], [0, 2, 3, 3], [5, 1, 4, 0]],
    "bright": [[0, 4, 5, 3], [0, 3, 4, 4], [3, 4, 0, 5], [0, 5, 3, 4]],
    "ambient": [[0, 3], [5, 3], [0, 4, 5, 3], [3, 0]],
}


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "low", fs=SR, output="sos"), x)


def hp(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def env(n, attack, decay_tau, release=0.02):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(attack, 1e-4)) * np.exp(-t / decay_tau)
    r = int(release * SR)
    if 0 < r < n:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def chord_notes(root_midi, degree, octave_shift=0):
    """Diatonic 7th chord (root, 3rd, 5th, 7th) on a scale degree."""
    out = []
    for step in (0, 2, 4, 6):
        idx = degree + step
        out.append(root_midi + MAJOR[idx % 7] + 12 * (idx // 7) + 12 * octave_shift)
    return out


def epiano(f, n, vel, rng):
    t = np.arange(n) / SR
    detune = 1 + rng.uniform(-0.0015, 0.0015)
    x = np.sin(2 * np.pi * f * detune * t) + 0.28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.25)
    x += 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.08)  # tine
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return vel * x * trem * env(n, 0.006, 1.4)


def pluck(f, n, vel):
    t = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t)
    return vel * lp(x * env(n, 0.002, 0.22), 3500)


def pad(freqs, n):
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for d in (-0.004, 0.0, 0.004):
            ph = 2 * np.pi * f * (1 + d) * t
            x += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.33  # saw
    x = lp(x, 1400, 2)
    a, r = int(0.35 * SR), int(0.7 * SR)  # caller adds 0.7 s so chords cross-fade
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return x * e / max(1, len(freqs))


def bass(f, n, vel):
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)
    return vel * np.tanh(1.6 * x) * env(n, 0.01, 0.6, 0.05)


def kick(n):
    t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.28)


def snare(n, rng):
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-t / 0.11)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05)
    return 0.55 * noise + 0.45 * body


def hat(n, rng):
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / 0.025)


def add(buf, x, start):
    s = int(start)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(x))
    buf[s:e] += x[: e - s]


def make(seconds, seed=0, mood="lofi"):
    rng = np.random.default_rng(seed)
    mood = mood if mood in PROGRESSIONS else "lofi"
    bpm = {"lofi": rng.uniform(76, 90), "bright": rng.uniform(98, 112), "ambient": rng.uniform(64, 74)}[mood]
    beat = 60 / bpm
    bar = 4 * beat
    key = rng.choice(list(NOTE))
    root = 48 + NOTE[key]  # C3 region
    prog = PROGRESSIONS[mood][rng.integers(len(PROGRESSIONS[mood]))]
    bars_per_chord = 2 if mood == "ambient" else 1
    swing = rng.uniform(0.54, 0.6) if mood == "lofi" else 0.5

    n = int((seconds + 1.0) * SR)
    keys, pads, bs, drums, hats = (np.zeros(n) for _ in range(5))
    duck = np.ones(n)

    total_bars = int(np.ceil(seconds / bar)) + 1
    for b in range(total_bars):
        t0 = b * bar
        deg = prog[(b // bars_per_chord) % len(prog)]
        notes = chord_notes(root + 12, deg)
        freqs = [hz(m) for m in notes]
        # pad on every chord change
        if b % bars_per_chord == 0:
            add(pads, pad([hz(m) for m in chord_notes(root + 12, deg)[:3]], int((bar * bars_per_chord + 0.7) * SR)), t0 * SR)
        if mood == "lofi":
            for hit, vel in ((0.0, 0.5), (1.5 + (swing - 0.5), 0.28), (2.5 + (swing - 0.5), 0.22)):
                if hit > 0 and rng.random() < 0.35:
                    continue
                for i, f in enumerate(freqs):
                    add(keys, epiano(f, int(beat * 2.2 * SR), vel * (0.9 - 0.1 * i), rng), (t0 + hit * beat + i * 0.012) * SR)
        else:
            # arpeggio: bright = 8ths, ambient = quarters
            step = beat / 2 if mood == "bright" else beat
            order = [0, 1, 2, 3, 2, 1, 0, 2] if mood == "bright" else [0, 2, 1, 3]
            k = 0
            t = 0.0
            while t < bar - 1e-6:
                f = freqs[order[k % len(order)]] * 2
                v = 0.32 if mood == "bright" else 0.22
                x = pluck(f, int(step * 2.5 * SR), v) if mood == "bright" else epiano(f, int(beat * 3 * SR), v, rng)
                add(keys, x, (t0 + t) * SR)
                t += step
                k += 1
        # bass
        if mood != "ambient":
            rootf = hz(notes[0] - 24)
            add(bs, bass(rootf, int(beat * 1.6 * SR), 0.55), t0 * SR)
            add(bs, bass(rootf * (1.5 if rng.random() < 0.5 else 1.0), int(beat * 1.2 * SR), 0.42), (t0 + 2 * beat) * SR)
        else:
            add(bs, bass(hz(notes[0] - 24), int(bar * SR), 0.35), t0 * SR)
        # drums
        if mood != "ambient":
            kicks = [0, 2] + ([2.5 + (swing - 0.5)] if rng.random() < 0.4 else [])
            for kb in kicks:
                add(drums, 0.9 * kick(int(0.45 * SR)), (t0 + kb * beat) * SR)
                s = int((t0 + kb * beat) * SR)
                d = int(0.22 * SR)
                if s < n:
                    e = min(n, s + d)
                    duck[s:e] = np.minimum(duck[s:e], 0.6 + 0.4 * np.linspace(0, 1, e - s))
            for sb in (1, 3):
                add(drums, 0.5 * snare(int(0.3 * SR), rng), (t0 + sb * beat) * SR)
            for e8 in range(8):
                off = (e8 // 2) + (0 if e8 % 2 == 0 else swing)
                add(hats, (0.18 if e8 % 2 == 0 else 0.11) * rng.uniform(0.7, 1.0) * hat(int(0.08 * SR), rng), (t0 + off * beat) * SR)

    music = 0.55 * keys * duck + 0.5 * pads * duck + 0.5 * bs + 0.55 * drums
    if mood == "lofi":
        music = lp(music, 7500)
        hiss = lp(rng.standard_normal(n), 3000) * 0.006
        crackle = (rng.random(n) < 0.00025) * rng.uniform(-0.25, 0.25, n)
        music = music + hiss + lp(crackle, 5000)

    # stereo: hats a little right, pad delayed on the right for width
    left = music + 0.9 * hats
    right = music + 1.1 * hats + np.roll(0.08 * pads, int(0.012 * SR))
    st = np.stack([left, right], axis=1)[: int(seconds * SR)]

    # soft limiter + loudness target (about -15 dBFS RMS), fades
    st = np.tanh(st * 1.2) / np.tanh(1.2)
    rms = np.sqrt(np.mean(st ** 2)) + 1e-9
    st *= 10 ** (-16 / 20) / rms
    peak = np.max(np.abs(st))
    if peak > 0.89:
        st *= 0.89 / peak
    fi, fo = int(0.25 * SR), int(min(1.5, seconds / 4) * SR)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    info = {"bpm": round(float(bpm), 1), "key": str(key), "mood": mood, "progression": [int(d) for d in prog]}
    return st, info


def write_wav(path, st):
    data = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seconds", type=float, required=True)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--mood", default="lofi", choices=list(PROGRESSIONS))
    ap.add_argument("--out", default="music.wav")
    a = ap.parse_args()
    audio, meta = make(a.seconds, a.seed, a.mood)
    write_wav(a.out, audio)
    print(meta)
