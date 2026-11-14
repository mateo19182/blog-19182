// Local autosave in IndexedDB: unsaved file texts and pasted images, keyed by
// repository path, so nothing is lost on reload before it is committed.
const open = () => new Promise((resolve, reject) => {
  const req = indexedDB.open("blog-editor", 2)
  req.onupgradeneeded = () => {
    if (req.result.objectStoreNames.contains("drafts")) req.result.deleteObjectStore("drafts")
    req.result.createObjectStore("drafts", { keyPath: "path" })
  }
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})
let db

async function tx(mode, fn) {
  db ??= await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction("drafts", mode)
    const req = fn(t.objectStore("drafts"))
    t.oncomplete = () => resolve(req?.result)
    t.onerror = () => reject(t.error)
  })
}

export const store = {
  all: () => tx("readonly", (s) => s.getAll()),
  put: (entry) => tx("readwrite", (s) => s.put({ ...entry, savedAt: Date.now() })),
  remove: (path) => tx("readwrite", (s) => s.delete(path)),
}
