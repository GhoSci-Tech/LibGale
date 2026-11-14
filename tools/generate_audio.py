"""Generate LibGale's original ambient loops and SFX.

All output is original, CC0-style material generated from code. The game
itself only loads the resulting WAV files; no runtime synthesis is required.

Run from the project root:
    python tools/generate_audio.py
"""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "audio"
SR = 22050
TAU = math.tau


def clamp(x: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return lo if x < lo else hi if x > hi else x


def env(t: float, attack: float, decay: float, sustain: float = 0.0, release: float = 0.0, dur: float = 0.0) -> float:
    if t < attack:
        return t / max(attack, 1e-6)
    if t < attack + decay:
        return 1.0 - (1.0 - sustain) * ((t - attack) / max(decay, 1e-6))
    if dur and t > dur - release:
        return max(0.0, sustain * (dur - t) / max(release, 1e-6))
    return sustain


def sine(freq: float, t: float, phase: float = 0.0) -> float:
    return math.sin(TAU * freq * t + phase)


def tri(freq: float, t: float) -> float:
    x = (t * freq) % 1.0
    return 4 * abs(x - 0.5) - 1


def saw(freq: float, t: float) -> float:
    return 2.0 * ((t * freq) % 1.0) - 1.0


def noise() -> float:
    return random.uniform(-1.0, 1.0)


class OnePole:
    def __init__(self, cutoff: float):
        self.a = math.exp(-TAU * cutoff / SR)
        self.y = 0.0

    def run(self, x: float) -> float:
        self.y = (1 - self.a) * x + self.a * self.y
        return self.y


class Delay:
    def __init__(self, seconds: float, feedback: float = 0.25, mix: float = 0.18):
        self.buf = [0.0] * int(seconds * SR)
        self.i = 0
        self.feedback = feedback
        self.mix = mix

    def run(self, x: float) -> float:
        y = self.buf[self.i]
        self.buf[self.i] = x + y * self.feedback
        self.i = (self.i + 1) % len(self.buf)
        return x * (1 - self.mix) + y * self.mix


def write_wav(name: str, samples: list[float], sr: int = SR) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    peak = max(0.0001, max(abs(s) for s in samples))
    norm = 0.82 / peak
    data = bytearray()
    for s in samples:
        v = int(clamp(s * norm) * 32767)
        data += struct.pack("<h", v)
    path = OUT / name
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(bytes(data))
    print(f"[audio] {name} ({len(samples) / sr:.1f}s)")


def make_hub() -> None:
    dur = 24.0
    n = int(dur * SR)
    rng = random.Random(11)
    low = OnePole(180)
    pad = OnePole(900)
    dly = Delay(0.46, feedback=0.18, mix=0.22)
    out = []
    for i in range(n):
        t = i / SR
        lfo = 0.55 + 0.45 * math.sin(TAU * t / 12.0)
        drone = 0.20 * sine(55, t) + 0.13 * sine(82.41, t) + 0.08 * sine(110, t)
        drone += 0.04 * tri(55, t)
        drone *= lfo
        chord = 0.035 * sine(164.81, t) + 0.03 * sine(196.0, t) + 0.025 * sine(220.0, t)
        chord *= 0.6 + 0.4 * math.sin(TAU * t / 8.0)
        air = pad.run(rng.uniform(-1, 1)) * 0.018
        # distant clock tick every 2 seconds
        tick = 0.0
        phase = t % 2.0
        if phase < 0.02:
            tick = 0.16 * (1 - phase / 0.02)
        # page rustle every 7.3s
        rustle = 0.0
        phase = t % 7.3
        if phase < 0.35:
            rustle = 0.08 * math.exp(-phase * 9) * rng.uniform(-1, 1)
        s = low.run(drone + chord) + air + tick + rustle
        out.append(dly.run(s))
    # gentle loop fades
    fade = int(0.08 * SR)
    for i in range(fade):
        out[i] *= i / fade
        out[-1 - i] *= i / fade
    write_wav("ambient_hub.wav", out)


def make_ashen() -> None:
    dur = 20.0
    n = int(dur * SR)
    rng = random.Random(22)
    lp = OnePole(400)
    out = []
    for i in range(n):
        t = i / SR
        pulse = 0.5 + 0.5 * math.sin(TAU * t / 2.0)
        low = 0.18 * sine(55, t) + 0.11 * sine(82.41, t) + 0.06 * saw(110, t)
        low *= 0.55 + 0.45 * pulse
        pad = 0.03 * sine(220, t) + 0.02 * sine(261.63, t)
        crackle = 0.0
        if rng.random() < 0.0008:
            crackle = rng.uniform(-0.5, 0.5)
        crackle = lp.run(crackle) * 1.8
        wind = lp.run(rng.uniform(-1, 1)) * 0.03
        s = low + pad + crackle + wind
        out.append(s)
    fade = int(0.1 * SR)
    for i in range(fade):
        out[i] *= i / fade
        out[-1 - i] *= i / fade
    write_wav("ambient_ashen.wav", out)


def make_poem() -> None:
    dur = 20.0
    n = int(dur * SR)
    rng = random.Random(33)
    lp = OnePole(1400)
    out = []
    notes = [440.0, 523.25, 659.25, 783.99, 659.25, 523.25]
    for i in range(n):
        t = i / SR
        pad = 0.025 * sine(110, t) + 0.018 * sine(164.81, t) + 0.014 * sine(220, t)
        # music box every 0.5 s
        step = int(t / 0.5)
        local = t - step * 0.5
        note = notes[step % len(notes)]
        bell = 0.0
        if local < 1.2:
            bell = 0.10 * math.exp(-local * 4.2) * (sine(note, local) + 0.4 * sine(note * 2, local))
        whisper = lp.run(rng.uniform(-1, 1)) * 0.012
        s = pad + bell + whisper
        out.append(s)
    fade = int(0.1 * SR)
    for i in range(fade):
        out[i] *= i / fade
        out[-1 - i] *= i / fade
    write_wav("ambient_poem.wav", out)


def make_last() -> None:
    dur = 20.0
    n = int(dur * SR)
    rng = random.Random(44)
    lp = OnePole(260)
    out = []
    for i in range(n):
        t = i / SR
        beat = 0.0
        phase = t % 1.6
        if phase < 0.16:
            beat = 0.22 * math.exp(-phase * 18)
        low = 0.20 * sine(43.65, t) + 0.12 * sine(65.41, t) + 0.08 * saw(87.31, t)
        low *= 0.65 + 0.35 * math.sin(TAU * t / 5.0)
        page = 0.0
        phase = t % 5.0
        if phase < 0.3:
            page = 0.05 * math.exp(-phase * 10) * rng.uniform(-1, 1)
        s = low + beat + page + lp.run(rng.uniform(-1, 1)) * 0.02
        out.append(s)
    fade = int(0.1 * SR)
    for i in range(fade):
        out[i] *= i / fade
        out[-1 - i] *= i / fade
    write_wav("ambient_last.wav", out)


def tone(dur: float, freq: float, amp: float = 0.5, kind: str = "sine", attack: float = 0.01, release: float = 0.1) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        e = env(t, attack, 0.03, 0.7, release, dur)
        if kind == "sine":
            v = sine(freq, t)
        elif kind == "tri":
            v = tri(freq, t)
        elif kind == "saw":
            v = saw(freq, t)
        else:
            v = noise()
        out.append(v * amp * e)
    return out


def mix(*tracks: list[float]) -> list[float]:
    n = max(len(t) for t in tracks)
    out = [0.0] * n
    for track in tracks:
        for i, s in enumerate(track):
            out[i] += s
    return out


def make_sfx() -> None:
    # page turn
    rng = random.Random(101)
    dur = 0.45
    n = int(dur * SR)
    lp = OnePole(2600)
    out = []
    for i in range(n):
        t = i / SR
        e = math.exp(-t * 7) * (1 - math.exp(-t * 90))
        out.append(lp.run(rng.uniform(-1, 1)) * e * 0.7)
    write_wav("page.wav", out)

    # quill scratch
    rng = random.Random(102)
    dur = 0.35
    n = int(dur * SR)
    hp = OnePole(1800)
    out = []
    for i in range(n):
        t = i / SR
        e = math.exp(-t * 10) * (1 - math.exp(-t * 80))
        out.append((rng.uniform(-1, 1) - hp.run(rng.uniform(-1, 1))) * e * 0.5)
    write_wav("quill.wav", out)

    # hit
    rng = random.Random(103)
    out = tone(0.36, 92, 0.8, "sine", 0.005, 0.3)
    for i in range(len(out)):
        t = i / SR
        out[i] += rng.uniform(-1, 1) * math.exp(-t * 22) * 0.3
    write_wav("hit.wav", out)

    # heal
    out = mix(
        tone(0.7, 523.25, 0.25, "sine", 0.02, 0.5),
        tone(0.9, 659.25, 0.20, "sine", 0.08, 0.6),
        tone(1.1, 783.99, 0.16, "sine", 0.16, 0.7),
    )
    write_wav("heal.wav", out)

    # seal
    parts = [tone(1.8, f, 0.22, "sine", 0.02 + i * 0.18, 1.0) for i, f in enumerate([261.63, 329.63, 392.0, 523.25, 659.25])]
    out = mix(*parts)
    write_wav("seal.wav", out)

    # rage
    rng = random.Random(104)
    dur = 1.1
    n = int(dur * SR)
    lp = OnePole(120)
    out = []
    for i in range(n):
        t = i / SR
        e = math.exp(-t * 1.3) * (1 - math.exp(-t * 40))
        growl = saw(55 + 6 * math.sin(TAU * t * 7), t) * 0.4
        out.append(lp.run(growl + rng.uniform(-1, 1) * 0.2) * e)
    write_wav("rage.wav", out)

    # phase whoosh
    rng = random.Random(105)
    dur = 0.28
    n = int(dur * SR)
    lp = OnePole(900)
    out = []
    for i in range(n):
        t = i / SR
        e = math.sin(math.pi * t / dur) ** 2
        out.append(lp.run(rng.uniform(-1, 1)) * e * 0.7)
    write_wav("phase.wav", out)

    # door
    rng = random.Random(106)
    dur = 1.2
    n = int(dur * SR)
    lp = OnePole(500)
    out = []
    for i in range(n):
        t = i / SR
        e = math.exp(-t * 2.4)
        creak = saw(70 + 30 * math.sin(TAU * t * 3), t) * 0.12
        out.append(lp.run(creak + rng.uniform(-1, 1) * 0.05) * e)
    out2 = tone(0.4, 65, 0.5, "sine", 0.005, 0.3)
    for i, s in enumerate(out2):
        out[i] += s
    write_wav("door.wav", out)

    # game over
    parts = []
    for i, f in enumerate([392.0, 329.63, 261.63, 196.0]):
        parts.append(tone(2.2, f, 0.18, "sine", 0.05 + i * 0.35, 1.4))
    write_wav("gameover.wav", mix(*parts))

    # whisper
    rng = random.Random(107)
    dur = 1.4
    n = int(dur * SR)
    bp = OnePole(1200)
    out = []
    for i in range(n):
        t = i / SR
        e = math.sin(math.pi * t / dur) ** 1.5
        out.append(bp.run(rng.uniform(-1, 1)) * e * 0.35)
    write_wav("whisper.wav", out)

    # mote pickup
    out = mix(tone(0.35, 880, 0.25, "sine", 0.01, 0.3), tone(0.5, 1318.5, 0.12, "sine", 0.05, 0.4))
    write_wav("mote.wav", out)

    # breath: a slow filtered exhale, like a sleeper behind a stopped clock
    rng = random.Random(108)
    dur = 1.6
    n = int(dur * SR)
    lp = OnePole(640)
    hp = OnePole(120)
    out = []
    smear = 0.0
    for i in range(n):
        t = i / SR
        # long swell in, soft fall away
        e = math.sin(math.pi * min(1.0, t / dur * 1.15)) ** 1.2
        raw = rng.uniform(-1, 1)
        smear = smear * 0.86 + raw * 0.14
        body = lp.run(smear) - hp.run(smear) * 0.7
        out.append(body * e * 0.55)
    write_wav("breath.wav", out)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_hub()
    make_ashen()
    make_poem()
    make_last()
    make_sfx()


if __name__ == "__main__":
    main()
