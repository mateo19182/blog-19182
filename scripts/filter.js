// Live filter for the link archive. Each list item is rendered as:
//   <a>Title</a> <code>Category</code> <em>YYYY-MM-DD</em>
// We filter on text + category and keep a live count.
;(function () {
  const search = document.getElementById("archive-search")
  const select = document.getElementById("archive-category")
  const count = document.getElementById("archive-count")
  if (!search || !select) return

  // The links are the first <ul> inside the article.
  const list = document.querySelector(".prose ul")
  if (!list) return
  const items = Array.from(list.children).filter((el) => el.tagName === "LI")

  // Build the per-item index and collect categories.
  const cats = new Set()
  const index = items.map((li) => {
    const code = li.querySelector("code")
    const cat = code ? code.textContent.trim() : ""
    if (cat) cats.add(cat)
    return { li, text: li.textContent.toLowerCase(), cat }
  })

  Array.from(cats)
    .sort()
    .forEach((c) => {
      const opt = document.createElement("option")
      opt.value = c
      opt.textContent = c
      select.appendChild(opt)
    })

  function apply() {
    const q = search.value.trim().toLowerCase()
    const cat = select.value
    let shown = 0
    for (const it of index) {
      const ok = (!q || it.text.includes(q)) && (!cat || it.cat === cat)
      it.li.classList.toggle("archive-hidden", !ok)
      if (ok) shown++
    }
    count.textContent = shown + " / " + index.length
  }

  search.addEventListener("input", apply)
  select.addEventListener("change", apply)
  apply()
})()
