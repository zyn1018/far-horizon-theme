// Far Horizon: a film-trailer look. A dusty beige-to-peach sky, a curved steel-blue planet
// horizon textured like still water with a soft peach rim, a small family log of live readings,
// a man, a woman and their little girl walking the horizon, a little pixel pet pacing it, and film grain over everything.
//
// Like the bundled scenes, the root has viewBox 0 0 1600 1000 and slices to fill the window:
// the app sizes the drawing by its viewBox. The left sessions sidebar is usually open, so the
// pieces sit in the band from about x 340 to 560, which lands between the sidebar and the chat
// column on windows from about 1000 to 1600 points wide. Vertically a wide window crops up to
// about 90 units off the top and the bottom, so the pet and walkers stay above y 860.
// One SVG serves both modes: a prefers-color-scheme rule swaps dawn for dusk.
//
// Every class, keyframe and id starts with fh-, and the palette hangs on the scene's own group
// rather than :root, so nothing here can reach the app's own styles if the app draws the SVG inline.

const W = 1600
const H = 1000
const BAND = { from: 340, to: 560 }

// The horizon: one big circle, so its edge reads as a planet's curve; it peaks under the chat
// column, behind the prompt box, and falls away to the left.
const HZ = { cx: 860, r: 3200, top: 792 }
const HZ_CY = HZ.top + HZ.r
function arcY(x: number): number {
  return HZ_CY - Math.sqrt(HZ.r * HZ.r - (x - HZ.cx) * (x - HZ.cx))
}
function slopeAt(x: number): number {
  return (Math.atan2(arcY(x + 1) - arcY(x), 1) * 180) / Math.PI
}
// Where a figure stands, as an SVG attribute: it holds even where CSS animation never runs.
// No tilt here: a tilt on the base would turn every step of the walk with it.
function standAt(x: number): string {
  return `translate(${x} ${arcY(x).toFixed(1)})`
}
// A keyframe moving a figure that stands at `base` to stand at `x` instead, leaning with the slope there.
function moveTo(base: number, x: number): string {
  const dx = x - base
  const dy = arcY(x) - arcY(base)
  return `transform:translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${slopeAt(x).toFixed(2)}deg)`
}

// No SVG filters or blend modes anywhere: the app animates the scene under frosted glass, and a
// filter re-rendered every frame stalls it. Texture comes from dashes, gradients and a tiled dot pattern.

// The glow above the rim: one ring, `RIM` units deep, painted with a radial gradient that fades outward.
const RIM = 48
function rimGradient(): string {
  // [units above the rim, opacity]: strongest at the land, gone at the ring's outer edge.
  const fade: [number, number][] = [[0, 0.62], [13, 0.43], [24, 0.25], [37, 0.1], [RIM, 0]]
  const stops = fade
    .map(([d, o]) => `<stop offset="${((HZ.r + d) / (HZ.r + RIM)).toFixed(5)}" stop-color="var(--rimglow)" stop-opacity="${o}"/>`)
    .join('')
  return `<radialGradient id="fh-rimG" gradientUnits="userSpaceOnUse" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r + RIM}">${stops}</radialGradient>`
}

function horizon(): string {
  // Ripples: broken dashed lines along the curve, light and dark, like the surface of slow water.
  const dashes = ['70 18 28 12', '44 10 90 16', '120 22 36 9', '58 14 18 8 80 20']
  const lines = Array.from({ length: 24 }, (_, i) => {
    const d = 10 + i * 11 + (i % 3) * 2.5
    const o = (0.42 - i * 0.011).toFixed(3)
    return (
      `<circle class="${i % 2 ? 'fh-stria2' : 'fh-stria'}" style="opacity:${o};stroke-dasharray:${dashes[i % dashes.length]};` +
      `stroke-dashoffset:${(i * 37) % 200}" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r - d}"/>`
    )
  }).join('')
  return (
    `<circle class="fh-rim" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r + RIM / 2}"/>` +
    `<circle class="fh-land" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r}"/>` +
    // A fuzzy dotted edge where the land meets the glow.
    `<circle class="fh-fuzz" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r - 2}"/>` +
    `<circle class="fh-fuzz fh-fuzz2" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r - 5}"/>` +
    lines
  )
}

// The family crosses the whole window on foot, never fading: the leader starts just past the window's
// left edge and the loop ends as the pet, last in line, walks off the right edge. The sidebar is ignored.
const WALK_FROM = -20
const WALK_TO = W + 85
const WALK_SECONDS = 190
const WALK_SPEED = (WALK_TO - WALK_FROM) / WALK_SECONDS // viewBox units a second
// Without animation the walkers stand here, in view.
const WALK_BASE = BAND.from + 150

// Silhouettes: a man and a woman with packs and poles, and a little girl between them,
// drawn in points and scaled up into the viewBox.
const SIL = 1.7
// Each figure has two poses: 'a', legs spread with both feet down and the pole planted ahead, and 'b',
// the passing pose, where the body rides a little higher over the standing leg and the pole is passed.
// The feet and the pole's tip stay on the ground in both.
type Pose = 'a' | 'b'
function lift(up: number, inner: string): string {
  return up === 0 ? inner : `<g transform="translate(0 ${-up})">${inner}</g>`
}
function man(pose: Pose): string {
  const up = pose === 'a' ? 0 : 0.3
  const hip = -6 - up
  const stride = pose === 'a' ? `M0 ${hip}L-2.6 0M0 ${hip}L2.2 0` : `M0 ${hip}L-1 0M0 ${hip}L1.2 0`
  const armAndPole = pose === 'a' ? 'M1.2 -11L3.8 -5.6M3.8 -9L4.6 0' : 'M1.2 -11.3L3.8 -5.9M4 -9.3L3.4 0'
  return (
    lift(
      up,
      '<circle cx="0.3" cy="-14.2" r="1.7"/>' +
        '<path d="M-1.2 -12.4h2.6l.6 6.6h-3.6z"/>' + // body
        '<path d="M-1.4 -12.2h-1.8l-.5 4.6h2.1z"/>', // pack
    ) +
    `<path class="fh-limb" d="${stride}"/>` +
    `<path class="fh-limb" d="${armAndPole}"/>`
  )
}
// A woman hiker: a little smaller, shoulder-length hair that stirs a little in the wind,
// pack and pole like the man's.
function woman(pose: Pose): string {
  const up = pose === 'a' ? 0 : 0.3
  const hip = -5.6 - up
  const stride = pose === 'a' ? `M0 ${hip}L-2.4 0M0 ${hip}L2 0` : `M0 ${hip}L-.9 0M0 ${hip}L1.1 0`
  const armAndPole = pose === 'a' ? 'M1.1 -10.2L3.5 -5.2M3.5 -8.4L4.3 0' : 'M1.1 -10.5L3.5 -5.5M3.7 -8.7L3.1 0'
  return (
    lift(
      up,
      '<circle cx="0.3" cy="-13.3" r="1.6"/>' +
        '<g class="fh-hair" style="transform-origin:-.4px -14px">' +
        '<path d="M1.4 -14.5Q.2 -15.6 -1.5 -14.7Q-2.6 -13.8 -2.5 -12.3Q-2.6 -11.4 -3.1 -10.9Q-2.2 -11 -1.7 -11.5' +
        'Q-1.6 -11 -2 -10.5Q-1 -10.8 -.8 -12Q-.5 -13.2 .2 -13.8Z"/>' +
        '</g>' + // shoulder-length hair
        '<path d="M-1 -11.6h2.3l.7 6.2h-3.4z"/>' + // body
        '<path d="M-1.2 -11.4h-1.6l-.5 4.2h1.9z"/>', // pack
    ) +
    `<path class="fh-limb" d="${stride}"/>` +
    `<path class="fh-limb" d="${armAndPole}"/>`
  )
}

// A little girl in a dress, her hair in a bun at the back of her head, with a small walking pole:
// about two thirds a hiker's height.
function girl(pose: Pose): string {
  const up = pose === 'a' ? 0 : 0.2
  const hip = -3.8 - up
  const stride = pose === 'a' ? `M-.5 ${hip}L-1.5 0M.5 ${hip}L1.4 0` : `M-.3 ${hip}L-.5 0M.3 ${hip}L.5 0`
  const arm = pose === 'a' ? 'M.6 -7.6L2.6 -4.6' : 'M.6 -7.8L2.6 -4.8'
  const pole = pose === 'a' ? 'M2.6 -6L3.2 0' : 'M2.8 -6.2L2.4 0' // her own small walking pole
  return (
    lift(
      up,
      '<circle cx="0.2" cy="-10.1" r="1.45"/>' +
        '<circle cx="-1.45" cy="-10.7" r="0.9"/>' + // bun, at the back of her head
        '<path d="M-.8 -8.5h1.7l1.7 4.9h-5.1z"/>', // dress
    ) +
    `<path class="fh-limb" d="${stride}"/>` +
    `<path class="fh-limb" d="${arm}"/>` +
    `<path class="fh-limb fh-pole" d="${pole}"/>`
  )
}

// The group walks in line: each figure keeps a fixed distance (`gap`, in viewBox units)
// behind the leader, with its own keyframes so its feet stay on the curve the whole way.
type Walker = 'man' | 'girl' | 'woman' | 'pet'
const GAPS: Record<Walker, number> = { man: 0, girl: 19, woman: 38, pet: 61 }
// One step, spread then passing, carries a walker one stride forward, so each keeps its own beat:
// stride length over walking speed. Shorter legs step faster, and nobody's feet slide.
function stepSeconds(stridePoints: number): number {
  return +((stridePoints * SIL) / WALK_SPEED).toFixed(2)
}
const STEP: Record<Walker, number> = {
  man: stepSeconds(4.8),
  girl: stepSeconds(2.9),
  woman: stepSeconds(4.4),
  // The pet patters quicker than its stride strictly needs: small legs, hurrying to keep up.
  pet: 0.6,
}
// Where in its step each one starts (seconds), so the line never moves as one.
const PHASE: Record<Walker, number> = { man: 0, girl: 0.2, woman: 0.5, pet: 0.1 }
function walkerStyle(who: Walker): string {
  return `animation-name:fh-walk${GAPS[who]};--fh-step:${STEP[who]}s;--fh-phase:-${PHASE[who]}s`
}
function walker(who: Exclude<Walker, 'pet'>, body: (pose: Pose) => string): string {
  return (
    `<g transform="${standAt(WALK_BASE - GAPS[who])}">` +
    `<g class="fh-walker" style="${walkerStyle(who)}">` +
    `<g transform="scale(${SIL})">` +
    `<g class="fh-step-a">${body('a')}</g><g class="fh-step-b">${body('b')}</g>` +
    '</g></g></g>'
  )
}
function walkKeyframes(): string {
  return Object.values(GAPS)
    .map(gap => {
      const base = WALK_BASE - gap
      const from = WALK_FROM - gap
      const to = WALK_TO - gap
      // Many stops, so the straight runs between them stay on the curve.
      const stops = Array.from({ length: 25 }, (_, i) => i / 24).map(f => {
        const x = from + (to - from) * f
        return `${+(f * 100).toFixed(2)}%{${moveTo(base, x)}}`
      })
      return `@keyframes fh-walk${gap}{${stops.join('')}}`
    })
    .join('')
}

// Pixel cells at any size: [x, y, w?, h?] in cells of `u` units.
function cells(list: [number, number, number?, number?][], u: number, cls: string): string {
  return list
    .map(([x, y, w = 1, h = 1]) => `<rect class="${cls}" x="${+(x * u).toFixed(2)}" y="${+(y * u).toFixed(2)}" width="${+(w * u).toFixed(2)}" height="${+(h * u).toFixed(2)}"/>`)
    .join('')
}

// A four-point pixel spark, the scene's signature: a plus with a bright heart, about 7 cells across.
function spark(u: number, cls = 'fh-spark'): string {
  return cells([[3, 0, 1, 7], [0, 3, 7, 1], [2, 2, 3, 3]], u, cls) + cells([[3, 3]], u, 'fh-spark-core')
}

// The pet: a small terracotta pixel creature in a steel-blue scarf, walking with the group,
// a step behind the family, on the same path and pace, its legs on a quicker beat of their own.
const P = 1.8
const PET_W = 12 * P
const PET_H = 9 * P
function px(cells: [number, number, number?, number?][], cls: string): string {
  return cells
    .map(([x, y, w = 1, hgt = 1]) => `<rect class="${cls}" x="${x * P}" y="${y * P}" width="${w * P}" height="${hgt * P}"/>`)
    .join('')
}
function pet(): string {
  const body = px([[2, 0], [9, 0], [2, 1, 8, 1], [1, 2, 10, 4]], 'fh-pet-body')
  const shade = px([[1, 5, 10, 1]], 'fh-pet-shade')
  const eyes = `<g class="fh-blink">${px([[3, 3], [8, 3]], 'fh-pet-eye')}</g>`
  const cheeks = px([[2, 4], [9, 4]], 'fh-pet-cheek')
  const scarf = px([[1, 6, 10, 1], [8, 7, 2, 2]], 'fh-pet-scarf')
  const legsA = `<g class="fh-step-a">${px([[2, 7, 1, 2], [6, 7, 1, 2]], 'fh-pet-body')}</g>`
  const legsB = `<g class="fh-step-b">${px([[4, 7, 1, 2], [10, 7, 1, 1]], 'fh-pet-body')}</g>`
  return (
    `<g transform="${standAt(WALK_BASE - GAPS.pet)}"><g class="fh-walker" style="${walkerStyle('pet')}">` +
    `<g transform="translate(${-PET_W / 2} ${-PET_H})">` +
    `<ellipse class="fh-pet-floor" cx="${PET_W / 2}" cy="${PET_H}" rx="${PET_W / 2 - 1}" ry="1.2"/>` +
    `<g class="fh-bob">${body}${shade}${cheeks}${eyes}${scarf}</g>${legsA}${legsB}` +
    '</g></g></g>'
  )
}
function petKeyframes(): string {
  return (
    '@keyframes fh-bob{0%{transform:translateY(0)}50%{transform:translateY(-.6px)}}' +
    '@keyframes fh-blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.15)}}'
  )
}

// Pixel sparks twinkling in the sky: in the band, and high on the right.
const SPARKS: { x: number; y: number; u: number; d: number }[] = [
  { x: BAND.from + 10, y: 160, u: 2.6, d: 0 },
  { x: BAND.from + 150, y: 230, u: 2, d: 3.5 },
  { x: BAND.from + 190, y: 110, u: 3, d: 7 },
  { x: BAND.from + 60, y: 520, u: 2.2, d: 12 },
  { x: BAND.from + 175, y: 610, u: 1.8, d: 16 },
  { x: 1180, y: 120, u: 2.6, d: 5 },
  { x: 1330, y: 240, u: 2, d: 9 },
  { x: 1460, y: 140, u: 3, d: 14 },
  { x: 1260, y: 380, u: 1.8, d: 18 },
]
function skySparks(): string {
  return SPARKS.map(
    k =>
      `<g transform="translate(${k.x} ${k.y})"><g class="fh-sky-spark" style="transform-origin:${3.5 * k.u}px ${3.5 * k.u}px;animation-delay:-${k.d}s">${spark(k.u)}</g></g>`,
  ).join('')
}

// Faint vertical streaks falling through the band, like scratches on film. The same set is drawn once
// every `period` units and the whole sheet falls exactly one period per loop, so the loop has no seam.
const STREAKS = { period: 760, speed: 60 / 14 } // units, and units a second
const STREAK_SECONDS = Math.round(STREAKS.period / STREAKS.speed)
function streaks(): string {
  return Array.from({ length: 30 }, (_, i) => {
    const x = BAND.from + ((i * 37) % (BAND.to - BAND.from))
    const len = 90 + ((i * 53) % 200)
    const y = (i * 71) % STREAKS.period
    // Copies above and below the window, enough to cover it wherever the sheet is in its fall.
    return [-1, 0, 1, 2].map(k => `M${x} ${y + k * STREAKS.period}v${len}`).join('')
  }).join('')
}

// Film grain: one tile of small specks, dark and light, each jittered inside its own cell of a grid.
// That spreads them evenly, the way grain is, with no lattice for the eye to catch. Seeded, so every
// build draws the same tile.
const GRAIN = { w: 128, h: 112, cols: 15, rows: 14 }
function seeded(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function grain(): string {
  const rnd = seeded(0x46484f52)
  const cw = GRAIN.w / GRAIN.cols
  const ch = GRAIN.h / GRAIN.rows
  let dark = ''
  let light = ''
  for (let r = 0; r < GRAIN.rows; r++) {
    for (let c = 0; c < GRAIN.cols; c++) {
      const s = +(0.9 + rnd() * 0.6).toFixed(1)
      const x = (c * cw + rnd() * (cw - s)).toFixed(1)
      const y = (r * ch + rnd() * (ch - s)).toFixed(1)
      const d = `M${x} ${y}h${s}v${s}h-${s}z`
      if (rnd() < 0.57) {
        dark += d
      } else {
        light += d
      }
    }
  }
  return (
    `<pattern id="fh-grainP" width="${GRAIN.w}" height="${GRAIN.h}" patternUnits="userSpaceOnUse">` +
    `<path class="fh-speck" d="${dark}"/><path class="fh-speck2" d="${light}"/>` +
    '</pattern>'
  )
}

// The camp the family set out from: a pixel tent and a crackling fire on the left slope.
const CAMP_X = BAND.from + 26
function camp(): string {
  const u = 3
  const tentRows = Array.from({ length: 8 }, (_, r) => [5 - r, r + 1, 2 * r + 2, 1] as [number, number, number, number])
  const tentShade = Array.from({ length: 8 }, (_, r) => [6, r + 1, r + 1, 1] as [number, number, number, number])
  const tent =
    `<g transform="translate(${-6 * u} ${-9 * u})">` +
    cells(tentRows, u, 'fh-tent') + cells(tentShade, u, 'fh-tent-shade') +
    cells([[5, 6, 2, 3], [5.5, 5, 1, 1]], u, 'fh-tent-door') +
    cells([[6, -2, 0.4, 3]], u, 'fh-tent-pole') + cells([[6.4, -2, 2, 1], [6.4, -1, 1, 1]], u, 'fh-tent-flag') +
    '</g>'
  const flameA = cells([[1, 2, 3, 2], [2, 0, 1, 2], [0, 1, 1, 1]], 2.4, 'fh-flame') + cells([[2, 2, 1, 2]], 2.4, 'fh-flame-core')
  const flameB = cells([[1, 2, 3, 2], [1, 0, 1, 2], [3, 1, 1, 1]], 2.4, 'fh-flame') + cells([[2, 2, 1, 2]], 2.4, 'fh-flame-core')
  const fire =
    `<g transform="translate(${16 * u} ${-4 * u})">` +
    // The glow is a dome: cut off at the ground line (y 12 here, where the logs rest), never a full circle.
    '<clipPath id="fh-fireGround"><rect x="-40" y="-40" width="92" height="52"/></clipPath>' +
    '<circle class="fh-fire-glow" cx="6" cy="12" r="22" clip-path="url(#fh-fireGround)"/>' +
    `<g class="fh-flame-a">${flameA}</g><g class="fh-flame-b">${flameB}</g>` +
    cells([[0, 4, 5, 1], [0.5, 4.6, 4, 0.6]], 2.4, 'fh-firewood') +
    '</g>'
  return `<g transform="translate(${CAMP_X} ${arcY(CAMP_X).toFixed(1)}) rotate(${slopeAt(CAMP_X).toFixed(2)})">${tent}${fire}</g>`
}

// The family log: a small monospace HUD in the band that stays put. Its live bits: a status light per member, a step odometer that ticks
// once per stride of the leader's, a bond bar that fills, four pixel blips pulsing in turn, a blinking cursor.
// ch: one monospace character at 6px with .04em letter spacing.
const LOG = { x: BAND.from + 30, y: 300, line: 9, ch: 3.84 }
// Written as a cipher, so it reads as instrument data at a glance. The key, for whoever knows:
// 46 4D 4C 59 = "FMLY" in hex. α β γ δ = papa, mama, the little one, the pet; their hex is an
// initial (50 P, 4D M, 4C L; 3F, a question mark, for the pet) and the arrow their place in line.
// Σ.N = how many (three, plus one). Δs = steps. κ = the bond. h×4 = four hearts, drawn as pixel blips. ⌂.0 ∞ = home, always.
const LOG_ROWS: { label: string; value?: string; cls?: string }[] = [
  { label: '46 4D 4C 59 // 0E', cls: 'fh-log-head' },
  { label: 'Σ.N', value: '03+01' },
  { label: 'α.50', value: '→01' },
  { label: 'γ.4C', value: '→02' },
  { label: 'β.4D', value: '→03' },
  { label: 'δ.3F', value: '→04' },
  { label: 'Δs', value: '00' },
  { label: 'κ' },
  { label: 'h×4' },
  { label: '⌂.0', value: '∞' },
  { label: '>' },
]
function logRow(i: number, inner: string): string {
  return (
    '<g class="fh-log-row">' +
    `<g transform="translate(0 ${i * LOG.line})">${inner}</g></g>`
  )
}
function familyLog(): string {
  const col = (c: number) => +(c * LOG.ch).toFixed(2)
  const rows = LOG_ROWS.map((r, i) => {
    let extra = ''
    if (i >= 2 && i <= 5) {
      // A status light per member, each breathing on its own beat.
      const shape = i === 5 ? `<rect x="${col(15)}" y="-4.6" width="3.6" height="3.6"/>` : `<circle cx="${col(15) + 1.8}" cy="-2.8" r="1.9"/>`
      extra = `<g class="fh-led" style="animation-delay:-${(i * 0.9).toFixed(1)}s">${shape}</g>`
    }
    if (i === 6) {
      // Odometer: three rolling digits after "00"; units step with every stride of the leader's.
      extra = [0, 1, 2]
        .map(k => {
          const per = STEP.man * Math.pow(10, 2 - k) // seconds per step for this column
          const strip = Array.from({ length: 11 }, (_, n) => `<text x="0" y="${n * LOG.line}">${n % 10}</text>`).join('')
          return (
            `<svg x="${col(12 + k)}" y="-7" width="${LOG.ch + 0.4}" height="${LOG.line}" overflow="hidden">` +
            `<g class="fh-odo" style="animation-duration:${(per * 10).toFixed(1)}s"><g transform="translate(0 7)">${strip}</g></g></svg>`
          )
        })
        .join('')
    }
    if (i === 7) {
      extra =
        `<rect class="fh-bar-track" x="${col(10)}" y="-5" width="${col(10)}" height="3.4"/>` +
        `<rect class="fh-bar-fill" x="${col(10)}" y="-5" width="${col(10)}" height="3.4"/>` +
        `<text class="fh-log-dim" x="${col(21)}" y="0">1.00</text>`
    }
    if (i === 8) {
      // Four pixel diamonds, one per member, pulsing in turn like signal blips.
      const u = 1.25
      const heart = cells([[1, 0], [0, 1, 3, 1], [1, 2]], u, 'fh-heart-px')
      extra = [0, 1, 2, 3]
        .map(k => `<g transform="translate(${col(10) + k * 6.4} -4.4)"><g class="fh-heart" style="animation-delay:${(k * 0.18).toFixed(2)}s">${heart}</g></g>`)
        .join('')
    }
    if (i === 10) {
      extra = `<rect class="fh-cursor" x="${col(2)}" y="-5.6" width="3" height="6.4"/>`
    }
    // Label and value are separate texts at fixed columns, so symbols of any width stay aligned.
    const text =
      `<text class="${r.cls ?? ''}" x="0" y="0" xml:space="preserve">${r.label}</text>` +
      (r.value === undefined ? '' : `<text x="${col(10)}" y="0">${r.value}</text>`)
    return logRow(i, text + extra)
  }).join('')
  return `<g class="fh-family-log" transform="translate(${LOG.x} ${LOG.y})">${rows}</g>`
}

export function horizonScene(): string {
  const style =
    '.fh-scene{--sky0:#d8cab5;--sky1:#e2c6a6;--sky2:#ebb78b;--streak:#a39a86;' +
    '--land0:#6f9cc3;--land1:#4c7ca6;--land2:#3c6a94;--stria:#a9c8e2;--stria2:#2c5a84;--fuzz:#e6b08a;--rimglow:#f0ae7a;' +
    '--ink:#2f5f8c;--sil:#1d2127;--speck:rgba(60,40,20,.28);--speck2:rgba(255,250,240,.35);' +
    '--pet:#c96a45;--pet-shade:#a9532f;--eye:#2b2520;--cheek:#e39a7a;--scarf:#2f5f8c;--petfloor:rgba(20,40,70,.25);' +
    '--spark:#d4673f;--spark-core:#fff3df;' +
    '--tent:#c96a45;--tent-shade:#a9532f;--tent-door:#3b2a22;--flame:#ee8a3a;--flame-core:#ffd27a;--log:#5a3a26;--glow:#f6a65a}' +
    '@media (prefers-color-scheme: dark){.fh-scene{--sky0:#11141b;--sky1:#191b23;--sky2:#3b2b24;--streak:#3a4250;' +
    '--land0:#30577d;--land1:#1f3f60;--land2:#173352;--stria:#5f8db6;--stria2:#0f2440;--fuzz:#a8683f;--rimglow:#b8693a;' +
    '--ink:#8fb6dc;--sil:#07080b;--speck:rgba(0,0,0,.45);--speck2:rgba(255,240,220,.12);' +
    '--pet:#d0734c;--pet-shade:#a4532f;--eye:#14151c;--cheek:#e0937a;--scarf:#6f9cc3;--petfloor:rgba(0,0,0,.4);' +
    '--spark:#f0a07a;--spark-core:#fff1dc;' +
    '--tent:#b65f3e;--tent-shade:#8c4630;--tent-door:#14121a;--flame:#ff9a45;--flame-core:#ffe08a;--log:#3c2a20;--glow:#ff9a45}}' +
    '.fh-sky{fill:url(#fh-skyG)}' +
    `.fh-streaks{fill:none;stroke:var(--streak);stroke-width:1.6;opacity:.16;animation:fh-rain ${STREAK_SECONDS}s linear infinite}` +
    '.fh-land{fill:url(#fh-landG)}' +
    '.fh-stria{fill:none;stroke:var(--stria);stroke-width:1.8}.fh-stria2{fill:none;stroke:var(--stria2);stroke-width:2.2}' +
    '.fh-fuzz{fill:none;stroke:var(--fuzz);stroke-width:5;stroke-dasharray:1.5 2.5;opacity:.7}.fh-fuzz2{stroke-width:3;stroke-dasharray:1 4;opacity:.45}' +
    `.fh-rim{fill:none;stroke:url(#fh-rimG);stroke-width:${RIM}}` +
    '.fh-family-log{font:500 6px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;fill:var(--ink);white-space:pre}' +
    '.fh-log-head{opacity:.55}.fh-log-dim{opacity:.7}' +
    '.fh-log-row{opacity:.62}' +
    '.fh-led{fill:var(--ink);animation:fh-led 2.8s ease-in-out infinite alternate}' +
    '.fh-odo{animation:fh-odo 7s steps(10) infinite}' +
    '.fh-bar-track{fill:var(--ink);opacity:.18}' +
    '.fh-bar-fill{fill:var(--ink);opacity:.75;transform-box:fill-box;transform-origin:left;animation:fh-barFill 6s ease-out 1 both}' +
    '.fh-heart-px{fill:var(--spark)}.fh-heart{transform-box:fill-box;transform-origin:center;animation:fh-beat 1.6s ease-in-out infinite}' +
    '.fh-cursor{fill:var(--ink);animation:fh-cursor 1s steps(1) infinite}' +
    `.fh-walker{animation:${WALK_SECONDS}s linear infinite;fill:var(--sil)}` +
    '.fh-walker .fh-limb{fill:none;stroke:var(--sil);stroke-width:1.2;stroke-linecap:round}.fh-walker .fh-pole{stroke-width:1}' +
    '.fh-hair{animation:fh-hair 2.6s ease-in-out infinite alternate}' +
    '@keyframes fh-hair{from{transform:rotate(-2deg)}to{transform:rotate(3deg)}}' +
    // Each walker steps on its own beat and phase, set on its group as --fh-step and --fh-phase.
    '.fh-step-a{animation:fh-stepA var(--fh-step,.7s) steps(1) var(--fh-phase,0s) infinite}' +
    '.fh-step-b{animation:fh-stepB var(--fh-step,.7s) steps(1) var(--fh-phase,0s) infinite}' +
    '.fh-pet-body{fill:var(--pet)}.fh-pet-shade{fill:var(--pet-shade)}.fh-pet-eye{fill:var(--eye)}.fh-pet-cheek{fill:var(--cheek)}' +
    '.fh-pet-scarf{fill:var(--scarf)}.fh-pet-floor{fill:var(--petfloor)}' +
    '.fh-bob{animation:fh-bob var(--fh-step,.7s) steps(1) var(--fh-phase,0s) infinite}' +
    '.fh-blink{transform-box:fill-box;transform-origin:center;animation:fh-blink 5s infinite}' +
    '.fh-speck{fill:var(--speck)}.fh-speck2{fill:var(--speck2)}' +
    '.fh-spark{fill:var(--spark)}.fh-spark-core{fill:var(--spark-core)}' +
    // Sky sparks only breathe, slowly and softly, so they never pull the eye from the chat.
    '.fh-sky-spark{opacity:.5;animation:fh-glimmer 10s ease-in-out infinite alternate}' +
    '.fh-tent{fill:var(--tent)}.fh-tent-shade{fill:var(--tent-shade)}.fh-tent-door{fill:var(--tent-door)}' +
    '.fh-tent-pole{fill:var(--log)}.fh-tent-flag{fill:var(--spark)}' +
    '.fh-flame{fill:var(--flame)}.fh-flame-core{fill:var(--flame-core)}.fh-firewood{fill:var(--log)}' +
    '.fh-fire-glow{fill:var(--glow);opacity:.18;animation:fh-glow 1.2s steps(2) infinite}' +
    '.fh-flame-a{animation:fh-stepA .5s steps(1) infinite}.fh-flame-b{animation:fh-stepB .5s steps(1) infinite}' +
    '@keyframes fh-glimmer{from{opacity:.35}to{opacity:.7}}' +
    '@keyframes fh-glow{0%{opacity:.14}50%{opacity:.24}}' +
    '.fh-grain{opacity:.5}' +
    `@keyframes fh-rain{from{transform:translateY(${-STREAKS.period}px)}to{transform:translateY(0)}}` +
    '@keyframes fh-led{from{opacity:.25}to{opacity:.9}}' +
    `@keyframes fh-odo{from{transform:translateY(0)}to{transform:translateY(${-10 * LOG.line}px)}}` +
    '@keyframes fh-barFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}' +
    '@keyframes fh-beat{0%,60%,100%{transform:scale(.85);opacity:.7}10%{transform:scale(1.25);opacity:1}22%{transform:scale(.95)}32%{transform:scale(1.12)}}' +
    // The cursor: on for half a second, off for half.
    '@keyframes fh-cursor{0%{opacity:.8}50%{opacity:0}}' +
    walkKeyframes() +
    petKeyframes() +
    '@keyframes fh-stepA{0%{opacity:1}50%{opacity:0}}@keyframes fh-stepB{0%{opacity:0}50%{opacity:1}}' +
    // Still: everyone stands where they can be seen.
    '@media (prefers-reduced-motion: reduce){.fh-scene *{animation:none!important}.fh-step-b,.fh-flame-b{opacity:0}}'

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">` +
    `<style>${style}</style>` +
    // The palette lives on this group, and the gradients sit inside it so their stops can read it.
    '<g class="fh-scene">' +
    '<defs>' +
    '<linearGradient id="fh-skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky0)"/><stop offset=".62" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient>' +
    '<linearGradient id="fh-landG" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="var(--land0)"/><stop offset=".012" stop-color="var(--land1)"/><stop offset=".05" stop-color="var(--land2)"/><stop offset="1" stop-color="var(--land2)"/></linearGradient>' +
    rimGradient() +
    grain() +
    '</defs>' +
    `<rect class="fh-sky" width="${W}" height="${H}"/>` +
    `<path class="fh-streaks" d="${streaks()}"/>` +
    familyLog() +
    skySparks() +
    horizon() +
    camp() +
    // A family on one path: the man leads, the girl walks between, the woman follows, the pet trails.
    walker('man', man) +
    walker('girl', girl) +
    walker('woman', woman) +
    pet() +
    `<rect class="fh-grain" x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="url(#fh-grainP)"/>` +
    '</g>' +
    '</svg>'
  )
}
