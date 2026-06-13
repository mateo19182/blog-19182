// Per-page OpenGraph image generation via satori (SVG) + resvg (PNG).
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { readFile } from "node:fs/promises"

let fonts = null

async function loadFonts(root) {
  if (fonts) return fonts
  const [bold, regular] = await Promise.all([
    readFile(`${root}/og-fonts/Geist-Bold.ttf`),
    readFile(`${root}/og-fonts/Geist-Regular.ttf`),
  ])
  fonts = [
    { name: "Geist", data: bold, weight: 700, style: "normal" },
    { name: "Geist", data: regular, weight: 400, style: "normal" },
  ]
  return fonts
}

// Dark-green + black palette for the OG card (matches dark mode).
const BG = "#0c0c0c"
const ACCENT = "#1a8c4a"
const FG = "#f5f5f5"
const MUTED = "#b0b0b0"

export async function makeOgImage(root, { title, subtitle }) {
  const f = await loadFonts(root)
  const node = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: "72px",
        borderLeft: `16px solid ${ACCENT}`,
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 28, color: ACCENT, fontFamily: "Geist", letterSpacing: "0.05em" },
            children: "blog-19182",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: title.length > 48 ? 64 : 80,
              fontFamily: "Geist", fontWeight: 700,
              color: FG,
              lineHeight: 1.1,
            },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 30, color: MUTED, fontFamily: "Geist" },
            children: subtitle || "blog.m19182.dev",
          },
        },
      ],
    },
  }

  const svg = await satori(node, { width: 1200, height: 630, fonts: f })
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng()
  return png
}
