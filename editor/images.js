// Pasted or dropped images, shrunk in the browser before they are committed.
// Posts get WebP (JPEG where the browser can't encode WebP) at most 2000 px
// wide; project thumbnails are cropped to 16:10 at 1280×800, as AGENTS.md asks.

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result).split(",")[1])
  r.onerror = () => reject(r.error)
  r.readAsDataURL(blob)
})

async function encode(canvas) {
  for (const [type, ext] of [["image/webp", "webp"], ["image/jpeg", "jpg"]]) {
    const blob = await new Promise((r) => canvas.toBlob(r, type, 0.85))
    if (blob?.type === type) return { blob, ext }
  }
  throw new Error("el navegador no pudo codificar la imagen")
}

// { base64, ext, type } for a File. GIFs and SVGs are kept as they are.
export async function processImage(file, { project = false } = {}) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name}: no es una imagen`)
  if (!project && /image\/(gif|svg\+xml)/.test(file.type)) {
    return { base64: await blobToBase64(file), ext: file.type === "image/gif" ? "gif" : "svg", type: file.type }
  }
  const bmp = await createImageBitmap(file)
  let sx = 0, sy = 0, sw = bmp.width, sh = bmp.height, w, h
  if (project) {
    if (sw / sh > 1.6) { sw = Math.round(sh * 1.6); sx = Math.round((bmp.width - sw) / 2) }
    else { sh = Math.round(sw / 1.6); sy = Math.round((bmp.height - sh) / 2) }
    w = 1280; h = 800
  } else {
    const scale = Math.min(1, 2000 / sw)
    w = Math.round(sw * scale); h = Math.round(sh * scale)
  }
  const canvas = Object.assign(document.createElement("canvas"), { width: w, height: h })
  const ctx = canvas.getContext("2d")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h)
  const { blob, ext } = await encode(canvas)
  return { base64: await blobToBase64(blob), ext, type: blob.type }
}

export const dataUrl = (img) => `data:${img.type};base64,${img.base64}`
