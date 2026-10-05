#!/usr/bin/env node
// Sync the author's working draft into the published Feijoo post.
import { copyFile, cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { existsSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const source = path.resolve(root, "../inv/feijoo/blog/post/draft.md")
const dest = path.join(root, "content/writings/El reto de Feijoo.md")

const header = `---
title: El reto de Feijoo
lang: es
date: 2026-10-05
aliases:
  - writings/El-reto-de-Feijoo-borrador
description: OCR, búsqueda entre idiomas y revisión de fuentes para comprobar los retos de Feijoo de 1729 y 1733.
---

`

await copyFile(path.resolve(root, "../inv/feijoo/blog/documents/scan_annotations.json"), path.join(root, "content/data/feijoo-scan-annotations.json"))

let body = await readFile(source, "utf8")
body = body.replace(/^<!--[\s\S]*?-->\s*/, "")
body = body.replace(/^TODO:\n(?:- .*\n)+\n*/, "")
body = body.replace(/<!--[\s\S]*?-->\n?/g, "")

const assets = new Map()
const localLinks = /(!?)\[([^\]]+)\]\((<[^>]+>|[^)]+)\)/g
for (const [, image, , rawTarget] of body.matchAll(localLinks)) {
  const target = rawTarget.replace(/^<|>$/g, "")
  if (/^(https?:\/\/|mailto:|#|\/data\/)/.test(target)) continue
  const file = path.resolve(path.dirname(source), target.split("#")[0])
  // Research notes stay in the working repository; retain their labels in the preview.
  if (!image && (/\.md(?:#|$)/.test(target) || target.endsWith("/"))) continue
  if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`Missing draft asset: ${target}`)
  const relative = path.relative(path.resolve(root, "../inv/feijoo"), file)
  if (relative.startsWith("..")) throw new Error(`Asset outside Feijoo: ${target}`)
  const publicTarget = `/data/feijoo-preview/${relative.split(path.sep).join("/")}`
  assets.set(target, { file, publicTarget })
}
for (const { file, publicTarget } of assets.values()) {
  const assetDest = path.join(root, "content", publicTarget)
  await mkdir(path.dirname(assetDest), { recursive: true })
  await copyFile(file, assetDest)
}
body = body.replace(localLinks, (match, image, label, rawTarget) => {
  const target = rawTarget.replace(/^<|>$/g, "")
  if (assets.has(target)) return `${image}[${label}](${assets.get(target).publicTarget})`
  if (/^(https?:\/\/|mailto:|#|\/data\/)/.test(target)) return match
  return label
})

const materialsSource = path.resolve(root, "../inv/feijoo/blog/materials/public")
if (existsSync(materialsSource)) {
  await cp(materialsSource, path.join(root, "content/data/feijoo-evidence"), { recursive: true })
}

const scanSource = path.resolve(root, "../inv/feijoo/blog/documents/results")
const scanDest = path.join(root, "content/data/feijoo-results")
const scanPattern = /\/data\/feijoo-results\/([A-Za-z0-9-]+_(?:feijoo|trevoux|fuente)\.jpg)/g
const scanNames = new Set([...body.matchAll(scanPattern)].map((match) => match[1]))
// Evidence case sheets reference their own crops, including cases the post does not show inline.
const materialsCases = path.join(materialsSource, "cases")
if (existsSync(materialsCases)) {
  for (const name of await readdir(materialsCases)) {
    const sheet = await readFile(path.join(materialsCases, name), "utf8")
    for (const match of sheet.matchAll(scanPattern)) scanNames.add(match[1])
  }
}
if (scanNames.size > 0) {
  await mkdir(scanDest, { recursive: true })
  for (const name of scanNames) await copyFile(path.join(scanSource, name), path.join(scanDest, name))
}

body = body.split("\n").map((line) => line.trimEnd()).join("\n").trim()
await writeFile(dest, header + body + "\n")
console.log(`Synced ${source} -> ${dest} (${assets.size} local assets, ${scanNames.size} document images)`)
