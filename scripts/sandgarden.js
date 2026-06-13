// Footer easter egg: a falling-sand automaton on a 200x150 canvas (5px cells).
// Click/drag to drop sand; it settles left/right. Fill the whole grid to win.
;(function () {
  const canvas = document.getElementById("sand-canvas")
  if (!canvas || canvas.dataset.init) return
  canvas.dataset.init = "1"

  const ctx = canvas.getContext("2d")
  const CELL = 5
  const COLS = canvas.width / CELL // 40
  const ROWS = canvas.height / CELL // 30
  const TOTAL = COLS * ROWS

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--secondary").trim() || "#1a8c4a"

  let grid = new Uint8Array(COLS * ROWS) // 0 empty, 1 sand
  let filled = 0
  let won = false
  let drawing = false
  let confetti = []

  const idx = (x, y) => y * COLS + x

  function addSand(cx, cy) {
    if (won) return
    for (let dx = -1; dx <= 1; dx++) {
      const x = cx + dx
      if (x < 0 || x >= COLS || cy < 0 || cy >= ROWS) continue
      if (!grid[idx(x, cy)]) {
        grid[idx(x, cy)] = 1
        filled++
      }
    }
  }

  function step() {
    // bottom-up so sand falls one cell per tick
    for (let y = ROWS - 2; y >= 0; y--) {
      for (let x = 0; x < COLS; x++) {
        if (!grid[idx(x, y)]) continue
        if (!grid[idx(x, y + 1)]) {
          grid[idx(x, y + 1)] = 1
          grid[idx(x, y)] = 0
        } else {
          const left = x > 0 && !grid[idx(x - 1, y + 1)] && !grid[idx(x - 1, y)]
          const right = x < COLS - 1 && !grid[idx(x + 1, y + 1)] && !grid[idx(x + 1, y)]
          if (left && right) {
            const dir = Math.random() < 0.5 ? -1 : 1
            grid[idx(x + dir, y + 1)] = 1
            grid[idx(x, y)] = 0
          } else if (left) {
            grid[idx(x - 1, y + 1)] = 1
            grid[idx(x, y)] = 0
          } else if (right) {
            grid[idx(x + 1, y + 1)] = 1
            grid[idx(x, y)] = 0
          }
        }
      }
    }
    if (!won && filled >= TOTAL) triggerWin()
  }

  function triggerWin() {
    won = true
    for (let i = 0; i < 80; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        vy: 1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 1.5,
        c: ["#1a8c4a", "#fff236", "#f5f5f5", "#4ade80"][Math.floor(Math.random() * 4)],
        s: 2 + Math.random() * 3,
      })
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = accent
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[idx(x, y)]) ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
      }
    }
    if (won) drawWin()
  }

  function drawWin() {
    ctx.fillStyle = "rgba(12,12,12,0.6)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    confetti.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      ctx.fillStyle = p.c
      ctx.fillRect(p.x, p.y, p.s, p.s)
    })
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 12
    ctx.fillStyle = "#4ade80"
    ctx.font = "bold 22px monospace"
    ctx.textAlign = "center"
    ctx.fillText("gj", canvas.width / 2, canvas.height / 2 - 6)
    ctx.font = "bold 13px monospace"
    ctx.fillStyle = "#f5f5f5"
    ctx.fillText("YOU WIN", canvas.width / 2, canvas.height / 2 + 16)
    ctx.restore()
  }

  function pointerPos(e) {
    const r = canvas.getBoundingClientRect()
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left
    const py = (e.touches ? e.touches[0].clientY : e.clientY) - r.top
    return [Math.floor((px / r.width) * COLS), Math.floor((py / r.height) * ROWS)]
  }

  function onDown(e) {
    drawing = true
    const [x, y] = pointerPos(e)
    addSand(x, y)
    e.preventDefault()
  }
  function onMove(e) {
    if (!drawing) return
    const [x, y] = pointerPos(e)
    addSand(x, y)
    e.preventDefault()
  }
  function onUp() {
    drawing = false
  }

  canvas.addEventListener("mousedown", onDown)
  canvas.addEventListener("mousemove", onMove)
  window.addEventListener("mouseup", onUp)
  canvas.addEventListener("touchstart", onDown, { passive: false })
  canvas.addEventListener("touchmove", onMove, { passive: false })
  window.addEventListener("touchend", onUp)

  const clearBtn = document.getElementById("sand-clear")
  if (clearBtn)
    clearBtn.addEventListener("click", function () {
      grid = new Uint8Array(COLS * ROWS)
      filled = 0
      won = false
      confetti = []
    })

  function loop() {
    step()
    draw()
    requestAnimationFrame(loop)
  }
  loop()
})()
