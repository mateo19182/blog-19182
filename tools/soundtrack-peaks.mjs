// Writes content/data/soundtrack/peaks.json: each file's duration and a coarse
// waveform, so players draw before any audio loads. Needs ffmpeg; the build doesn't.
import { execFileSync } from "node:child_process"
import { readdirSync, writeFileSync } from "node:fs"
import path from "node:path"

const DIR = path.join(import.meta.dirname, "..", "content", "data", "soundtrack")
const BARS = 96
const RATE = 4000

const out = {}
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".webm")).sort()) {
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(DIR, f), "-ac", "1", "-ar", String(RATE), "-f", "s16le", "-"], { maxBuffer: 1 << 30 })
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1)
  const per = samples.length / BARS
  const rms = Array.from({ length: BARS }, (_, i) => {
    let sum = 0
    const a = Math.floor(i * per), b = Math.floor((i + 1) * per)
    for (let j = a; j < b; j++) sum += samples[j] * samples[j]
    return Math.sqrt(sum / Math.max(1, b - a))
  })
  // Mastered music is loud throughout; stretching min..max keeps the shape visible.
  const min = Math.min(...rms), span = Math.max(...rms) - min || 1
  out[f] = {
    duration: Math.round(samples.length / RATE),
    peaks: rms.map((v) => Math.round((0.12 + (0.88 * (v - min)) / span) * 100) / 100),
  }
  console.log(f, out[f].duration + "s")
}
const lines = Object.entries(out).map(([f, v]) => `  ${JSON.stringify(f)}: ${JSON.stringify(v)}`)
writeFileSync(path.join(DIR, "peaks.json"), `{\n${lines.join(",\n")}\n}\n`)
