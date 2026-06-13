// WebGL background — a slow domain-warped flow-noise field, tinted to the
// active theme. Minimal but alive: low-contrast so text stays readable.
// Falls back to the plain background color if WebGL is unavailable.
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
  float fbm(vec2 p){
    float v = 0.0, amp = 0.5;
    for(int i = 0; i < 5; i++){ v += amp * noise(p); p = p * 2.02 + 1.7; amp *= 0.5; }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 2.6;
    float t = u_time * 0.025;

    // domain warping for organic flow
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2)), fbm(p + 3.5 * q + vec2(8.3, 2.8) + t * 0.5));
    float n = fbm(p + 3.5 * r);

    // faint contour banding adds interest without busyness
    float bands = 0.5 + 0.5 * sin(n * 18.0 + t * 2.0);
    float shade = mix(n, bands, 0.22);

    float amp = mix(0.11, 0.17, u_dark);          // light/dark contrast of the field
    vec3 col = u_bg + (shade - 0.5) * amp;

    // accent pooled in the warp valleys (stronger in dark mode)
    float pool = smoothstep(0.55, 0.95, r.x);
    col = mix(col, u_accent, pool * (u_dark > 0.5 ? 0.20 : 0.06));

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

  const uRes = gl.getUniformLocation(prog, "u_res")
  const uTime = gl.getUniformLocation(prog, "u_time")
  const uBg = gl.getUniformLocation(prog, "u_bg")
  const uAccent = gl.getUniformLocation(prog, "u_accent")
  const uDark = gl.getUniformLocation(prog, "u_dark")

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
    const dark = document.documentElement.getAttribute("data-theme") === "dark" ? 1 : 0
    gl.uniform3f(uBg, bg[0], bg[1], bg[2])
    gl.uniform3f(uAccent, accent[0], accent[1], accent[2])
    gl.uniform1f(uDark, dark)
  }

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5)
  function resize() {
    const w = Math.floor(innerWidth * DPR)
    const h = Math.floor(innerHeight * DPR)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }
  }

  readTheme()
  resize()
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  addEventListener("resize", resize)

  let running = true
  function frame(ms) {
    if (!running) return
    resize()
    gl.uniform1f(uTime, ms * 0.001)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!reduceMotion) requestAnimationFrame(frame)
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false
    else if (!reduceMotion) {
      running = true
      requestAnimationFrame(frame)
    }
  })
  requestAnimationFrame(frame)
})()
