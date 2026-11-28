"""Original background music for @peptidesnepal reels, made from scratch with numpy.

No samples and no third-party recordings, so there is nothing to license.
Every seed gives a different key, tempo, chord progression and groove.

    python3 music.py --seconds 24 --seed 7 --mood lofi --out music.wav

Moods:
  lofi     slow swung beat, warm electric-piano chords, bass, soft vinyl hiss
  bright   faster, major key, plucked arpeggios over a light beat
  ambient  no drums; soft pads and a slow arpeggio, for serious topics
  rock     116-138 BPM, distorted power-chord guitars (chug, gallop or open), bass, rock kit, fills, crashes
  hiphop   84-96 BPM boom-bap: swung 16th hats, punchy 808, clap+snare, minor-key keys and a bell hook
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
    if mood == "rock":
        return make_rock(seconds, seed)
    if mood == "hiphop":
        return make_hiphop(seconds, seed)
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


# ---------------------------------------------------------------------------
# Rock and hip-hop moods: minor keys, plain triads (no jazzy 7ths), real groove
# patterns, a repeating hook and fills, so they sound like a normal backing track.
# ---------------------------------------------------------------------------
MINOR = [0, 2, 3, 5, 7, 8, 10]

# Chord roots as semitones above the key's tonic (natural minor).
ROCK_PROGS = [[0, 8, 3, 10], [0, 10, 8, 10], [0, 5, 8, 7], [8, 10, 0, 0], [0, 3, 10, 8], [0, 0, 8, 10]]
HIPHOP_PROGS = [[0, 5], [0, 8], [0, 8, 5, 7], [0, 3, 8, 7], [0, 10, 8, 7], [5, 0]]


def finish(left, right, seconds, info, target_db=-15.5):
    st = np.stack([left, right], axis=1)[: int(seconds * SR)]
    st = np.tanh(st * 1.3) / np.tanh(1.3)
    rms = np.sqrt(np.mean(st ** 2)) + 1e-9
    st *= 10 ** (target_db / 20) / rms
    peak = np.max(np.abs(st))
    if peak > 0.9:
        st *= 0.9 / peak
    fi, fo = int(0.03 * SR), int(min(1.5, seconds / 4) * SR)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return st, info


def duck_at(duck, start, depth=0.55, length=0.18):
    s = int(start)
    d = int(length * SR)
    if s < len(duck):
        e = min(len(duck), s + d)
        duck[s:e] = np.minimum(duck[s:e], depth + (1 - depth) * np.linspace(0, 1, e - s))


def rock_kick(n):
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    click = hp(np.random.default_rng(1).standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.8 * body) + click


def rock_snare(n, rng):
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1500, 9000) * np.exp(-t / 0.16)
    body = (np.sin(2 * np.pi * 200 * t) + 0.5 * np.sin(2 * np.pi * 330 * t)) * np.exp(-t / 0.07)
    return np.tanh(1.5 * (0.7 * noise + 0.6 * body))


def crash(n, rng):
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 5000) * np.exp(-t / 0.9) * 0.5


def guitar(freqs, n, rng, mute=False, gain=9.0):
    """Distorted power-chord guitar: detuned saws -> drive -> cabinet-like filtering."""
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for d in (-0.003, 0.0025):
            ph = f * (1 + d + rng.uniform(-0.0005, 0.0005)) * t
            x += 2 * (ph % 1) - 1
    x = hp(x, 90)
    x = np.tanh(gain * x / len(freqs))
    x = lp(x, 3200 if mute else 4800, 4)
    x = x + 0.6 * bp(x, 500, 2000)  # mid push
    e = env(n, 0.003, 0.09 if mute else 2.5, 0.03)
    return x * e


def make_rock(seconds, seed):
    rng = np.random.default_rng(seed)
    bpm = rng.uniform(116, 138)
    beat = 60 / bpm
    bar = 4 * beat
    key = rng.choice(["E", "A", "D", "G", "C", "B"])
    tonic = 40 + (NOTE[key] - 4) % 12  # guitar range, E2..Eb3
    prog = ROCK_PROGS[rng.integers(len(ROCK_PROGS))]
    style = rng.integers(3)  # 0 = chug 8ths, 1 = gallop, 2 = open chords + chug

    n = int((seconds + 1.5) * SR)
    gl, gr, bs, drums, cym = (np.zeros(n) for _ in range(5))
    duck = np.ones(n)
    total_bars = int(np.ceil(seconds / bar)) + 1
    for b in range(total_bars):
        t0 = b * bar
        r = tonic + prog[b % len(prog)]
        if r > tonic + 7:
            r -= 12  # keep the chord low
        pc = [hz(r), hz(r + 7), hz(r + 12)]
        phrase_end = b % 4 == 3
        # guitar
        if style == 1:
            hits = [h for q in range(4) for h in (q, q + 0.5, q + 0.75)]
        else:
            hits = [i * 0.5 for i in range(8)]
        for i, h in enumerate(hits):
            if phrase_end and h >= 3:
                break
            open_hit = (h == 0) or (style == 2 and h in (0, 1.5, 2.5))
            dur = beat * (1.4 if open_hit else 0.45)
            for buf, jit in ((gl, 0.0), (gr, rng.uniform(0.004, 0.011))):
                add(buf, (0.5 if open_hit else 0.33) * guitar(pc, int(dur * SR), rng, mute=not open_hit),
                    (t0 + h * beat + jit) * SR)
            # bass doubles the root on every hit
            add(bs, 0.5 * bass(hz(r - 12), int(min(dur, beat * 0.5) * SR), 0.9), (t0 + h * beat) * SR)
        # drums: kick 1, 3 and the "and" of 3 (or 2), snare 2 and 4, 8th hats, crash every 4 bars
        kicks = [0, 2, 2.5] if rng.random() < 0.5 else [0, 1.5, 2]
        for kb in kicks:
            add(drums, 0.95 * rock_kick(int(0.4 * SR)), (t0 + kb * beat) * SR)
            duck_at(duck, (t0 + kb * beat) * SR, 0.7)
        for sb in ((1, 3) if not phrase_end else (1,)):
            add(drums, 0.75 * rock_snare(int(0.35 * SR), rng), (t0 + sb * beat) * SR)
        if phrase_end:  # snare fill on beats 3-4
            for k in range(8):
                add(drums, (0.35 + 0.06 * k) * rock_snare(int(0.2 * SR), rng), (t0 + (2 + k * 0.25) * beat) * SR)
        for e8 in range(8):
            if phrase_end and e8 >= 4:
                break
            add(cym, (0.2 if e8 % 2 == 0 else 0.13) * hat(int(0.06 * SR), rng), (t0 + e8 * 0.5 * beat) * SR)
        if b % 4 == 0:
            add(cym, crash(int(2.0 * SR), rng), t0 * SR)

    bs = lp(np.tanh(1.5 * bs), 900)
    left = 0.62 * gl * duck + 0.5 * bs + 0.62 * drums + 0.8 * cym
    right = 0.62 * gr * duck + 0.5 * bs + 0.62 * drums + 1.0 * cym
    info = {"bpm": round(float(bpm), 1), "key": f"{key} minor", "mood": "rock", "progression": prog,
            "pattern": ["chug", "gallop", "open+chug"][style]}
    return finish(left, right, seconds, info, -15.0)


def eight08(f, n, vel):
    t = np.arange(n) / SR
    fr = f * (1 + 0.9 * np.exp(-t / 0.025))  # pitch drop at the start = punch
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR)
    x = np.tanh(2.2 * x) * env(n, 0.002, 0.9, 0.06)
    return vel * x


def clap(n, rng):
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 6000)
    e = np.zeros(n)
    for off in (0.0, 0.011, 0.022):  # three quick bursts, like hands
        s = int(off * SR)
        e[s:] += np.exp(-(t[: n - s]) / (0.012 if off < 0.02 else 0.12))
    return noise * e * 0.6


def bp_snare(n, rng):
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1800, 8000) * np.exp(-t / 0.09)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.045)
    return 0.6 * noise + 0.55 * body


def keys_chord(freqs, n, rng):
    x = sum(epiano(f, n, 0.5, rng) for f in freqs) / len(freqs)
    return lp(x, 2600)


def bell(f, n):
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t + 1.2 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t / 0.3))
    return x * env(n, 0.003, 0.45)


def make_hiphop(seconds, seed):
    rng = np.random.default_rng(seed)
    bpm = rng.uniform(84, 96)
    beat = 60 / bpm
    bar = 4 * beat
    swing = rng.uniform(0.54, 0.6)  # 16th-note swing
    key = rng.choice(list(NOTE))
    tonic = 48 + NOTE[key]
    if tonic > 54:
        tonic -= 12
    prog = HIPHOP_PROGS[rng.integers(len(HIPHOP_PROGS))]
    bars_per_chord = 2 if len(prog) == 2 else 1
    # a 2-bar melodic hook from the minor pentatonic, fixed for the whole track
    pent = [0, 3, 5, 7, 10, 12, 15]
    hook = [(rng.integers(8) * 0.5, pent[rng.integers(len(pent))]) for _ in range(5)]
    hook = sorted(set(hook))
    kick_pat = [[0, 1.75, 2.5], [0, 0.75, 2.5, 2.75], [0, 1.5, 2.25]][rng.integers(3)]

    def sw(pos):  # swing the off-beat 16ths
        q = pos * 4
        return pos + ((swing - 0.5) * 0.5 if int(round(q)) % 2 == 1 and abs(q - round(q)) < 1e-6 else 0)

    n = int((seconds + 1.5) * SR)
    ks, mel, sub, drums, hats = (np.zeros(n) for _ in range(5))
    duck = np.ones(n)
    total_bars = int(np.ceil(seconds / bar)) + 1
    for b in range(total_bars):
        t0 = b * bar
        off = prog[(b // bars_per_chord) % len(prog)]
        r = tonic + off
        triad = [r + 12, r + 12 + (3 if (off in (0, 5, 7)) else 4), r + 19]
        if off == 7:
            triad[1] = r + 12 + 4  # major V, classic minor-key pull
        # keys: chord stabs on 1 and the swung "and" of 2
        for h, v in ((0, 1.0), (1.5, 0.7)):
            add(ks, v * keys_chord([hz(m) for m in triad], int(beat * 1.6 * SR), rng), (t0 + sw(h) * beat) * SR)
        # hook melody, every 2 bars (second bar answers an octave-free echo)
        if b % 2 == 0:
            for pos, semi in hook:
                add(mel, 0.22 * bell(hz(tonic + 24 + semi), int(beat * 1.2 * SR)), (t0 + sw(pos) * beat) * SR)
        # drums
        for kb in kick_pat:
            add(drums, 0.85 * kick(int(0.35 * SR)), (t0 + sw(kb) * beat) * SR)
            add(sub, eight08(hz(r - 12), int(beat * (1.4 if kb == 0 else 0.9) * SR), 0.75), (t0 + sw(kb) * beat) * SR)
            duck_at(duck, (t0 + sw(kb) * beat) * SR, 0.6, 0.2)
        for sb in (1, 3):
            add(drums, 0.55 * bp_snare(int(0.3 * SR), rng) + 0.0, (t0 + sb * beat) * SR)
            add(drums, 0.45 * clap(int(0.3 * SR), rng), (t0 + sb * beat + 0.004) * SR)
        for s16 in range(16):
            pos = sw(s16 * 0.25)
            if b % 4 == 3 and s16 in (14, 15):
                for k in range(3):  # hi-hat roll into the next phrase
                    add(hats, 0.12 * hat(int(0.04 * SR), rng), (t0 + (pos + k / 12) * beat) * SR)
                continue
            vel = (0.2, 0.08, 0.13, 0.08)[s16 % 4] * rng.uniform(0.8, 1.0)
            add(hats, vel * hat(int(0.05 * SR), rng), (t0 + pos * beat) * SR)
        if rng.random() < 0.5:
            add(hats, 0.1 * hp(rng.standard_normal(int(0.25 * SR)), 6000) * env(int(0.25 * SR), 0.002, 0.12),
                (t0 + 3.5 * beat) * SR)

    sub = lp(sub, 220)
    ks = ks * duck
    vinyl = lp(rng.standard_normal(n), 3500) * 0.004
    left = 0.5 * ks + 0.4 * mel + 0.75 * sub + 0.6 * drums + 0.85 * hats + vinyl
    right = 0.5 * np.roll(ks, int(0.008 * SR)) + 0.4 * mel + 0.75 * sub + 0.6 * drums + 1.05 * hats + vinyl
    info = {"bpm": round(float(bpm), 1), "key": f"{key} minor", "mood": "hiphop", "progression": prog}
    return finish(left, right, seconds, info, -15.0)


MOODS = list(PROGRESSIONS) + ["rock", "hiphop"]


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
    ap.add_argument("--mood", default="lofi", choices=MOODS)
    ap.add_argument("--out", default="music.wav")
    a = ap.parse_args()
    audio, meta = make(a.seconds, a.seed, a.mood)
    write_wav(a.out, audio)
    print(meta)
