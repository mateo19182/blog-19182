// WebGL background — a slow domain-warped flow-noise field, tinted to the
// active theme and reactive to the cursor. Minimal but alive, and tuned to
// stay smooth on low-end devices (reduced resolution, capped 30fps, few
// octaves). Falls back to the flat background color if WebGL is unavailable.
;(function () {
  const canvas = document.getElementById("bg-canvas")
  if (!canvas) return
  const gl = canvas.getContext("webgl", { antialias: false, depth: false, alpha: false, powerPreference: "low-power" })
  if (!gl) return

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches

  const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`

  const FRAG = `
  precision highp float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;   // normalized, y-up
  uniform vec3 u_bg;
  uniform vec3 u_accent;
  uniform float u_dark;

  float hash(vec2 p){ p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0)), c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){            // 4 octaves — cheap enough for weak GPUs
    float v = 0.0, amp = 0.5;
    for(int i = 0; i < 4; i++){ v += amp * noise(p); p = p * 2.03 + 1.7; amp *= 0.5; }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * aspect, uv.y) * 2.6;
    float t = u_time * 0.025;

    // cursor influence: a soft lens that pushes the field outward + shimmers
    vec2 m = vec2(u_mouse.x * aspect, u_mouse.y) * 2.6;
    vec2 toM = p - m;
    float md = length(toM);
    float infl = exp(-md * 1.8);
    p += normalize(toM + 1e-4) * infl * 0.55;
    t += infl * 0.7;

    // single domain warp -> organic marbling
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    float n = fbm(p + 3.5 * q + t * 0.2);

    // faint contour banding for interest
    float bands = 0.5 + 0.5 * sin(n * 14.0 + t * 2.0);
    float shade = mix(n, bands, 0.2);

    float amp = mix(0.13, 0.21, u_dark);            // contrast of the field
    vec3 col = u_bg + (shade - 0.5) * amp;

    // accent pooled in the warp + a gentle glow under the cursor
    float pool = smoothstep(0.5, 0.95, q.x);
    col = mix(col, u_accent, pool * (u_dark > 0.5 ? 0.22 : 0.08));
    col += u_accent * infl * (u_dark > 0.5 ? 0.07 : 0.035);

    gl_FragColor = vec4(col, 1.0);
  }`

  function compile(type, src) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "a")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U = (n) => gl.getUniformLocation(prog, n)
  const uRes = U("u_res"), uTime = U("u_time"), uMouse = U("u_mouse")
  const uBg = U("u_bg"), uAccent = U("u_accent"), uDark = U("u_dark")

  function hexToRgb(h) {
    h = (h || "").trim().replace("#", "")
    if (h.length === 3) h = h.split("").map((c) => c + c).join("")
    const n = parseInt(h || "000000", 16)
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
  }
  function readTheme() {
    const cs = getComputedStyle(document.documentElement)
    const bg = hexToRgb(cs.getPropertyValue("--light"))
    const accent = hexToRgb(cs.getPropertyValue("--secondary"))
    gl.uniform3f(uBg, bg[0], bg[1], bg[2])
    gl.uniform3f(uAccent, accent[0], accent[1], accent[2])
    gl.uniform1f(uDark, document.documentElement.getAttribute("data-theme") === "dark" ? 1 : 0)
  }

  // Render at a modest resolution — soft noise upscales invisibly, and this is
  // the biggest lever for keeping weak GPUs/phones smooth.
  const QUALITY = Math.min(window.devicePixelRatio || 1, 1.5) * (innerWidth < 700 ? 0.6 : 0.8)
  function resize() {
    const w = Math.max(1, Math.floor(innerWidth * QUALITY))
    const h = Math.max(1, Math.floor(innerHeight * QUALITY))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }
  }

  // smoothed cursor
  let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5
  addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX / innerWidth
      ty = 1 - e.clientY / innerHeight
    },
    { passive: true },
  )

  readTheme()
  resize()
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  addEventListener("resize", resize)

  let running = true
  let last = 0
  const FRAME = 1000 / 30 // cap at 30fps
  function frame(ms) {
    if (!running) return
    requestAnimationFrame(frame)
    if (ms - last < FRAME) return
    last = ms
    resize()
    mx += (tx - mx) * 0.06
    my += (ty - my) * 0.06
    gl.uniform2f(uMouse, mx, my)
    gl.uniform1f(uTime, ms * 0.001)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden && !reduceMotion
    if (running) requestAnimationFrame(frame)
  })

  if (reduceMotion) {
    // one static frame, no loop
    resize()
    gl.uniform2f(uMouse, 0.5, 0.5)
    gl.uniform1f(uTime, 12.0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  } else {
    requestAnimationFrame(frame)
  }
})()
