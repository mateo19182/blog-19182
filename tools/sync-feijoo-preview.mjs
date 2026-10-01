#!/usr/bin/env node
// Copy the author's working draft into the public, unlisted blog preview.
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const source = path.resolve(root, "../inv/feijoo/blog/post/draft.md")
const dest = path.join(root, "content/writings/El reto de Feijoo (borrador).md")

const header = `---
title: El reto de Feijoo (borrador)
lang: es
unlisted: true
description: Borrador en curso sobre Feijoo, Trévoux y los retos de 1729 y 1733.
---

`

let body = await readFile(source, "utf8")
body = body.replace(/^<!--[\s\S]*?-->\s*/, "")
body = body.replace(/^TODO:\n(?:- .*\n)+\n*/, "")
body = body.replace(/<!--[\s\S]*?-->\n?/g, "")

const images = new Map([
  ["images/diffusion-gap.png", "/data/feijoo-diffusion-gap.png"],
  ["../documents/web/01_reto_tcu3_1729_ni_aun_quatro_lineas.jpg", "/data/feijoo-reto-1729.jpg"],
])
body = body.replace(/(!?)\[([^\]]+)\]\((<[^>]+>|[^)]+)\)/g, (match, image, label, rawTarget) => {
  const target = rawTarget.replace(/^<|>$/g, "")
  if (images.has(target)) return `${image}[${label}](${images.get(target)})`
  if (/^(https?:\/\/|mailto:|#|\/data\/)/.test(target)) return match
  throw new Error(`Local file link in draft: ${target}`)
})

body = body.split("\n").map((line) => line.trimEnd()).join("\n").trim()
await writeFile(dest, header + body + "\n")
console.log(`Synced ${source} -> ${dest}`)
