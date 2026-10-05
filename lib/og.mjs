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

// Keep the card close to the site's paper-and-ink palette. The green mark is
// the same accent used by the site's dark theme and links.
const PAPER = "#e9e7e1"
const PANEL = "#0c0c0c"
const ACCENT = "#1a8c4a"
const FG = "#f5f5f5"
const MUTED = "#b0b0b0"

export async function makeOgImage(root, { title, subtitle }) {
  const f = await loadFonts(root)
  if (title === "El reto de Feijoo") return makeFeijooCard(root, f)
  const titleSize = title.length > 68 ? 52 : title.length > 24 ? 64 : 78
  const node = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        background: PAPER,
        padding: "30px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "1140px",
              height: "570px",
              position: "relative",
              background: PANEL,
              borderRadius: "16px",
              overflow: "hidden",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { position: "absolute", top: "54px", left: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "1024px" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", alignItems: "center", fontSize: 27, color: FG, fontFamily: "Geist" },
                        children: [
                          {
                            type: "div",
                            props: { style: { width: 20, height: 20, borderRadius: "50%", background: ACCENT, marginRight: 14 } },
                          },
                          "blog-19182",
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: { style: { display: "flex", fontSize: 22, color: MUTED, fontFamily: "Geist" }, children: "blog.m19182.dev" },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { position: "absolute", top: "205px", left: "58px", display: "flex", flexDirection: "column", width: "1024px" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", fontSize: 23, color: ACCENT, fontFamily: "Geist", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 },
                        children: subtitle || "Mateo's blog",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", fontSize: titleSize, fontFamily: "Geist", fontWeight: 700, color: FG, lineHeight: 1.08 },
                        children: title,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { position: "absolute", bottom: "46px", left: "58px", display: "flex", alignItems: "center", borderTop: `1px solid ${MUTED}`, paddingTop: 18, width: "1024px" },
                  children: [
                    { type: "div", props: { style: { display: "flex", flex: 1, fontSize: 20, color: MUTED, fontFamily: "Geist" }, children: "personal notes, projects, and things I keep thinking about" } },
                    { type: "div", props: { style: { display: "flex", width: 12, height: 12, borderRadius: "50%", background: ACCENT } } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }

  const svg = await satori(node, { width: 1200, height: 630, fonts: f })
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng()
  return png
}

// Use the original pages as the visual evidence in this article's share card.
async function makeFeijooCard(root, fonts) {
  const scans = await Promise.all(["C001_feijoo", "C001_trevoux"].map(async name =>
    "data:image/jpeg;base64," + (await readFile(`${root}/content/data/feijoo-results/${name}.jpg`)).toString("base64")
  ))
  const box = (style, children) => ({ type: "div", props: { style: { display: "flex", ...style }, children } })
  const node = box({ width: 1200, height: 630, background: "#eee9df", padding: "40px 48px", flexDirection: "column", fontFamily: "Geist", color: "#26231e" }, [
    box({ fontSize: 60, fontWeight: 700, marginBottom: 10 }, "El reto de Feijoo"),
    box({ fontSize: 27, marginBottom: 28, color: "#615b50" }, "Buscando traducciones ocultas con OCR e IA"),
    box({ gap: 24, flex: 1 }, scans.map((src, i) => box({ width: 540, flexDirection: "column" }, [
      box({ fontSize: 21, marginBottom: 10, color: "#615b50" }, i === 0 ? "Feijoo · 1728" : "Trévoux · 1716"),
      box({ height: 330, overflow: "hidden", background: "#fff", border: "1px solid #d5cdbf" }, [
        { type: "img", props: { src, width: 540, height: 330, style: { objectFit: "cover", objectPosition: "top" } } },
      ]),
    ]))),
    box({ fontSize: 19, color: "#615b50", marginTop: 16 }, "Mateo · blog.m19182.dev"),
  ])
  const svg = await satori(node, { width: 1200, height: 630, fonts })
  return new Resvg(svg).render().asPng()
}
