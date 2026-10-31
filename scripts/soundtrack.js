// The post's soundtrack: play/pause, and a waveform you can click, drag or arrow through.
;(() => {
  const fig = document.querySelector('.soundtrack')
  if (!fig) return
  const audio = fig.querySelector('audio')
  const button = fig.querySelector('.st-play')
  const wave = fig.querySelector('.st-wave')
  const now = fig.querySelector('.st-now')
  const total = Number(wave.getAttribute('aria-valuemax'))
  const es = () => document.documentElement.lang === 'es'
  const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const duration = () => (Number.isFinite(audio.duration) ? audio.duration : total)

  // Nothing loads until play (preload="none"), so a seek before that is kept here.
  let pending = 0
  const loaded = () => audio.readyState > 0
  const pos = () => (loaded() ? audio.currentTime : pending)
  audio.addEventListener('loadedmetadata', () => { if (pending) audio.currentTime = pending })

  function draw() {
    const t = pos()
    wave.style.setProperty('--p', `${(t / duration()) * 100}%`)
    now.textContent = clock(t)
    wave.setAttribute('aria-valuenow', Math.floor(t))
    wave.setAttribute('aria-valuetext', `${clock(t)} / ${clock(duration())}`)
  }

  let frame = 0
  function tick() {
    draw()
    frame = audio.paused ? 0 : requestAnimationFrame(tick)
  }

  function state() {
    const playing = !audio.paused
    fig.classList.toggle('st-playing', playing)
    button.setAttribute('aria-label', playing ? (es() ? 'Pausar' : 'Pause') : es() ? 'Reproducir' : 'Play')
    if (playing && !frame) frame = requestAnimationFrame(tick)
  }

  const seek = (t) => {
    t = Math.min(Math.max(0, t), duration() - 0.1)
    if (loaded()) audio.currentTime = t
    else pending = t
    draw()
  }
  const at = (e) => {
    const box = wave.getBoundingClientRect()
    return Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)) * duration()
  }

  button.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()))
  audio.addEventListener('play', state)
  audio.addEventListener('pause', state)
  audio.addEventListener('waiting', () => fig.classList.add('st-loading'))
  audio.addEventListener('playing', () => fig.classList.remove('st-loading'))
  audio.addEventListener('ended', () => { audio.currentTime = pending = 0; draw() })
  audio.addEventListener('timeupdate', () => { if (audio.paused) draw() })

  wave.addEventListener('pointerdown', (e) => {
    wave.setPointerCapture(e.pointerId)
    seek(at(e))
    const move = (m) => seek(at(m))
    wave.addEventListener('pointermove', move)
    wave.addEventListener('pointerup', () => wave.removeEventListener('pointermove', move), { once: true })
  })
  wave.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 30, PageDown: -30 }[e.key]
    if (step) seek(pos() + step)
    else if (e.key === 'Home') seek(0)
    else if (e.key === 'End') seek(duration())
    else if (e.key === ' ' || e.key === 'Enter') audio.paused ? audio.play() : audio.pause()
    else return
    e.preventDefault()
  })
})()
