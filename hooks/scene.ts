// Far Horizon: a film-trailer look. A dusty beige-to-peach sky, a curved steel-blue planet
// horizon textured like slow water with a soft peach rim, a self-typing family log,
// a man, a woman and their little girl walking the horizon, a little pixel pet pacing it, and film grain over everything.
//
// Like the bundled scenes, the root has viewBox 0 0 1600 1000 and slices to fill the window:
// the app sizes the drawing by its viewBox. The left sessions sidebar is usually open, so the
// pieces sit in the band from about x 340 to 560, which lands between the sidebar and the chat
// column on windows from about 1000 to 1600 points wide. Vertically a wide window crops up to
// about 90 units off the top and the bottom, so the pet and walkers stay above y 860.
// One SVG serves both modes: a prefers-color-scheme rule swaps dawn for dusk.

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
// filter re-rendered every frame stalls it. Texture comes from dashes, layered strokes and a tiled dot pattern.

function horizon(): string {
  // Ripples: broken dashed lines along the curve, light and dark, some drifting slowly like water.
  const dashes = ['70 18 28 12', '44 10 90 16', '120 22 36 9', '58 14 18 8 80 20']
  const lines = Array.from({ length: 24 }, (_, i) => {
    const d = 10 + i * 11 + (i % 3) * 2.5
    const o = (0.42 - i * 0.011).toFixed(3)
    return (
      `<circle class="${i % 2 ? 'stria2' : 'stria'}" style="opacity:${o};stroke-dasharray:${dashes[i % dashes.length]};` +
      `stroke-dashoffset:${(i * 37) % 200}" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r - d}"/>`
    )
  }).join('')
  // A soft glow above the rim from stacked translucent strokes, and a fuzzy dotted edge.
  const glow = [44, 30, 18, 9]
    .map((w, i) => `<circle class="rimglow" style="stroke-width:${w};opacity:${(0.1 + i * 0.07).toFixed(2)}" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r + w / 2}"/>`)
    .join('')
  return (
    glow +
    `<circle class="land" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r}"/>` +
    `<circle class="fuzz" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r - 2}"/>` +
    `<circle class="fuzz fuzz2" cx="${HZ.cx}" cy="${HZ_CY}" r="${HZ.r - 5}"/>` +
    lines
  )
}

// Silhouettes: a man and a woman with packs and poles, and a little girl between them,
// drawn in points and scaled up into the viewBox.
const SIL = 1.7
function man(legs: 'a' | 'b'): string {
  const stride = legs === 'a' ? 'M0 -6L-2.6 0M0 -6L2.2 0' : 'M0 -6L-1 0M0 -6L1.2 0'
  return (
    '<circle cx="0.3" cy="-14.2" r="1.7"/>' +
    '<path d="M-1.2 -12.4h2.6l.6 6.6h-3.6z"/>' +
    '<path d="M-1.4 -12.2h-1.8l-.5 4.6h2.1z"/>' +
    `<path class="limb" d="${stride}"/>` +
    '<path class="limb" d="M1.2 -11L3.8 -5.6M3.8 -9L4.6 0"/>'
  )
}
// A woman hiker: a little smaller, shoulder-length hair that stirs a little in the wind,
// pack and pole like the man's.
function woman(legs: 'a' | 'b'): string {
  const stride = legs === 'a' ? 'M0 -5.6L-2.4 0M0 -5.6L2 0' : 'M0 -5.6L-.9 0M0 -5.6L1.1 0'
  return (
    '<circle cx="0.3" cy="-13.3" r="1.6"/>' +
    '<g class="hair" style="transform-origin:-.4px -14px">' +
    '<path d="M1.4 -14.5Q.2 -15.6 -1.5 -14.7Q-2.6 -13.8 -2.5 -12.3Q-2.6 -11.4 -3.1 -10.9Q-2.2 -11 -1.7 -11.5' +
    'Q-1.6 -11 -2 -10.5Q-1 -10.8 -.8 -12Q-.5 -13.2 .2 -13.8Z"/>' +
    '</g>' + // shoulder-length hair
    '<path d="M-1 -11.6h2.3l.7 6.2h-3.4z"/>' + // body
    '<path d="M-1.2 -11.4h-1.6l-.5 4.2h1.9z"/>' + // pack
    `<path class="limb" d="${stride}"/>` +
    '<path class="limb" d="M1.1 -10.2L3.5 -5.2M3.5 -8.4L4.3 0"/>'
  )
}

// A little girl in a dress, her hair in a bun at the back of her head, with a small walking pole:
// about two thirds a hiker's height.
function girl(legs: 'a' | 'b'): string {
  const stride = legs === 'a' ? 'M-.5 -3.8L-1.5 0M.5 -3.8L1.4 0' : 'M-.3 -3.8L-.5 0M.3 -3.8L.5 0'
  return (
    '<circle cx="0.2" cy="-10.1" r="1.45"/>' +
    '<circle cx="-1.45" cy="-10.7" r="0.9"/>' + // bun, at the back of her head
    '<path d="M-.8 -8.5h1.7l1.7 4.9h-5.1z"/>' + // dress
    `<path class="limb" d="${stride}"/>` +
    '<path class="limb" d="M.6 -7.6L2.6 -4.6"/>' + // arm
    '<path class="limb pole" d="M2.6 -6L3.2 0"/>' // her own small walking pole
  )
}

// The group walks in lockstep: each figure keeps a fixed distance (`gap`, in viewBox units)
// behind the leader, with its own keyframes so its feet stay on the curve the whole way.
const GAPS = { man: 0, girl: 19, woman: 38, pet: 61 }
function walker(gap: number, body: (l: 'a' | 'b') => string): string {
  return (
    `<g transform="${standAt(WALK_BASE - gap)}">` +
    `<g class="walker" style="animation-name:walk${gap}">` +
    `<g transform="scale(${SIL})">` +
    `<g class="step-a">${body('a')}</g><g class="step-b">${body('b')}</g>` +
    '</g></g></g>'
  )
}
// The family crosses the whole window on foot, never fading: the leader starts just past the window's
// left edge and the loop ends as the pet, last in line, walks off the right edge. The sidebar is ignored.
const WALK_FROM = -20
const WALK_TO = W + 85
const WALK_SECONDS = 190
// Without animation the walkers stand here, in view.
const WALK_BASE = BAND.from + 150
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
      return `@keyframes walk${gap}{${stops.join('')}}`
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
function spark(u: number, cls = 'spark'): string {
  return cells([[3, 0, 1, 7], [0, 3, 7, 1], [2, 2, 3, 3]], u, cls) + cells([[3, 3]], u, 'spark-core')
}

// The pet: a small terracotta pixel creature in a steel-blue scarf, walking with the group,
// a step behind the family, on the same path and pace, legs in step with theirs.
const P = 1.8
const PET_W = 12 * P
const PET_H = 9 * P
function px(cells: [number, number, number?, number?][], cls: string): string {
  return cells
    .map(([x, y, w = 1, hgt = 1]) => `<rect class="${cls}" x="${x * P}" y="${y * P}" width="${w * P}" height="${hgt * P}"/>`)
    .join('')
}
function pet(): string {
  const body = px([[2, 0], [9, 0], [2, 1, 8, 1], [1, 2, 10, 4]], 'pet-body')
  const shade = px([[1, 5, 10, 1]], 'pet-shade')
  const eyes = `<g class="blink">${px([[3, 3], [8, 3]], 'pet-eye')}</g>`
  const cheeks = px([[2, 4], [9, 4]], 'pet-cheek')
  const scarf = px([[1, 6, 10, 1], [8, 7, 2, 2]], 'pet-scarf')
  const legsA = `<g class="step-a">${px([[2, 7, 1, 2], [6, 7, 1, 2]], 'pet-body')}</g>`
  const legsB = `<g class="step-b">${px([[4, 7, 1, 2], [10, 7, 1, 1]], 'pet-body')}</g>`
  return (
    `<g transform="${standAt(WALK_BASE - GAPS.pet)}"><g class="walker" style="animation-name:walk${GAPS.pet}">` +
    `<g transform="translate(${-PET_W / 2} ${-PET_H})">` +
    `<ellipse class="pet-floor" cx="${PET_W / 2}" cy="${PET_H}" rx="${PET_W / 2 - 1}" ry="1.2"/>` +
    `<g class="bob">${body}${shade}${cheeks}${eyes}${scarf}</g>${legsA}${legsB}` +
    '</g></g></g>'
  )
}
function petKeyframes(): string {
  return (
    '@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-.6px)}}' +
    '@keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.15)}}'
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
      `<g transform="translate(${k.x} ${k.y})"><g class="sky-spark" style="transform-origin:${3.5 * k.u}px ${3.5 * k.u}px;animation-delay:-${k.d}s">${spark(k.u)}</g></g>`,
  ).join('')
}

// The camp the family set out from: a pixel tent and a crackling fire on the left slope.
const CAMP_X = BAND.from + 26
function camp(): string {
  const u = 3
  const tentRows = Array.from({ length: 8 }, (_, r) => [5 - r, r + 1, 2 * r + 2, 1] as [number, number, number, number])
  const tentShade = Array.from({ length: 8 }, (_, r) => [6, r + 1, r + 1, 1] as [number, number, number, number])
  const tent =
    `<g transform="translate(${-6 * u} ${-9 * u})">` +
    cells(tentRows, u, 'tent') + cells(tentShade, u, 'tent-shade') +
    cells([[5, 6, 2, 3], [5.5, 5, 1, 1]], u, 'tent-door') +
    cells([[6, -2, 0.4, 3]], u, 'tent-pole') + cells([[6.4, -2, 2, 1], [6.4, -1, 1, 1]], u, 'tent-flag') +
    '</g>'
  const flameA = cells([[1, 2, 3, 2], [2, 0, 1, 2], [0, 1, 1, 1]], 2.4, 'flame') + cells([[2, 2, 1, 2]], 2.4, 'flame-core')
  const flameB = cells([[1, 2, 3, 2], [1, 0, 1, 2], [3, 1, 1, 1]], 2.4, 'flame') + cells([[2, 2, 1, 2]], 2.4, 'flame-core')
  const fire =
    `<g transform="translate(${16 * u} ${-4 * u})">` +
    // The glow is a dome: cut off at the ground line (y 12 here, where the logs rest), never a full circle.
    '<clipPath id="fireGround"><rect x="-40" y="-40" width="92" height="52"/></clipPath>' +
    '<circle class="fire-glow" cx="6" cy="12" r="22" clip-path="url(#fireGround)"/>' +
    `<g class="flame-a">${flameA}</g><g class="flame-b">${flameB}</g>` +
    cells([[0, 4, 5, 1], [0.5, 4.6, 4, 0.6]], 2.4, 'log') +
    '</g>'
  return `<g transform="translate(${CAMP_X} ${arcY(CAMP_X).toFixed(1)}) rotate(${slopeAt(CAMP_X).toFixed(2)})">${tent}${fire}</g>`
}

// The family log: a small monospace HUD in the band that appears line by line, holds,
// fades, and appears again. Its live bits: a status light per member, a step odometer that ticks
// once per stride (0.7 s, the walkers' own step), a bond bar that fills, four hearts beating in turn.
// ch: one monospace character at 6px with .04em letter spacing.
const LOG = { x: BAND.from + 30, y: 300, line: 9, ch: 3.84, cycle: 26 }
// Written as a cipher, so it reads as instrument data at a glance. The key, for whoever knows:
// 46 4D 4C 59 = "FMLY" in hex. α β γ δ = papa, mama, the little one, the pet; their hex is an
// initial (50 P, 4D M, 4C L; 3F, a question mark, for the pet) and the arrow their place in line.
// Σ.N = how many (three, plus one). Δs = steps. κ = the bond. h×4 = four hearts. ⌂.0 ∞ = home, always.
const LOG_ROWS: { label: string; value?: string; cls?: string }[] = [
  { label: '46 4D 4C 59 // 0E', cls: 'log-head' },
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
    `<g class="log-row" style="animation-delay:${(i * 0.32).toFixed(2)}s">` +
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
      extra = `<g class="led" style="animation-delay:-${(i * 0.9).toFixed(1)}s">${shape}</g>`
    }
    if (i === 6) {
      // Odometer: three rolling digits after "00"; units step every stride.
      extra = [0, 1, 2]
        .map(k => {
          const per = 0.7 * Math.pow(10, 2 - k) // seconds per step for this column
          const strip = Array.from({ length: 11 }, (_, n) => `<text x="0" y="${n * LOG.line}">${n % 10}</text>`).join('')
          return (
            `<svg x="${col(12 + k)}" y="-7" width="${LOG.ch + 0.4}" height="${LOG.line}" overflow="hidden">` +
            `<g class="odo" style="animation-duration:${(per * 10).toFixed(1)}s"><g transform="translate(0 7)">${strip}</g></g></svg>`
          )
        })
        .join('')
    }
    if (i === 7) {
      extra =
        `<rect class="bar-track" x="${col(10)}" y="-5" width="${col(10)}" height="3.4"/>` +
        `<rect class="bar-fill" x="${col(10)}" y="-5" width="${col(10)}" height="3.4"/>` +
        `<text class="log-dim" x="${col(21)}" y="0">1.00</text>`
    }
    if (i === 8) {
      // Four pixel hearts, one per member, beating in turn: a 5 x 4 grid of cells.
      const u = 0.95
      const heart = cells([[1, 0], [3, 0], [0, 1, 5, 1], [1, 2, 3, 1], [2, 3]], u, 'heart-px')
      extra = [0, 1, 2, 3]
        .map(k => `<g transform="translate(${col(10) + k * 6.4} -4.6)"><g class="heart" style="animation-delay:${(k * 0.18).toFixed(2)}s">${heart}</g></g>`)
        .join('')
    }
    if (i === 10) {
      extra = `<rect class="cursor" x="${col(2)}" y="-5.6" width="3" height="6.4"/>`
    }
    // Label and value are separate texts at fixed columns, so symbols of any width stay aligned.
    const text =
      `<text class="${r.cls ?? ''}" x="0" y="0" xml:space="preserve">${r.label}</text>` +
      (r.value === undefined ? '' : `<text x="${col(10)}" y="0">${r.value}</text>`)
    return logRow(i, text + extra)
  }).join('')
  return `<g class="family-log" transform="translate(${LOG.x} ${LOG.y})">${rows}</g>`
}

export function horizonScene(): string {
  const style =
    ':root{--sky0:#d8cab5;--sky1:#e2c6a6;--sky2:#ebb78b;--streak:#a39a86;' +
    '--land0:#6f9cc3;--land1:#4c7ca6;--land2:#3c6a94;--stria:#a9c8e2;--stria2:#2c5a84;--fuzz:#e6b08a;--rimglow:#f0ae7a;' +
    '--ink:#2f5f8c;--sil:#1d2127;--speck:rgba(60,40,20,.28);--speck2:rgba(255,250,240,.35);' +
    '--pet:#c96a45;--pet-shade:#a9532f;--eye:#2b2520;--cheek:#e39a7a;--scarf:#2f5f8c;--petfloor:rgba(20,40,70,.25);' +
    '--spark:#d4673f;--spark-core:#fff3df;' +
    '--tent:#c96a45;--tent-shade:#a9532f;--tent-door:#3b2a22;--flame:#ee8a3a;--flame-core:#ffd27a;--log:#5a3a26;--glow:#f6a65a}' +
    '@media (prefers-color-scheme: dark){:root{--sky0:#11141b;--sky1:#191b23;--sky2:#3b2b24;--streak:#3a4250;' +
    '--land0:#30577d;--land1:#1f3f60;--land2:#173352;--stria:#5f8db6;--stria2:#0f2440;--fuzz:#a8683f;--rimglow:#b8693a;' +
    '--ink:#8fb6dc;--sil:#07080b;--speck:rgba(0,0,0,.45);--speck2:rgba(255,240,220,.12);' +
    '--pet:#d0734c;--pet-shade:#a4532f;--eye:#14151c;--cheek:#e0937a;--scarf:#6f9cc3;--petfloor:rgba(0,0,0,.4);' +
    '--spark:#f0a07a;--spark-core:#fff1dc;' +
    '--tent:#b65f3e;--tent-shade:#8c4630;--tent-door:#14121a;--flame:#ff9a45;--flame-core:#ffe08a;--log:#3c2a20;--glow:#ff9a45}}' +
    '.sky{fill:url(#skyG)}' +
    '.streaks{stroke:var(--streak);stroke-width:1.6;opacity:.16;animation:rain 14s linear infinite}' +
    '.land{fill:url(#landG)}' +
    '.stria{fill:none;stroke:var(--stria);stroke-width:1.8}.stria2{fill:none;stroke:var(--stria2);stroke-width:2.2}' +
    '.fuzz{fill:none;stroke:var(--fuzz);stroke-width:5;stroke-dasharray:1.5 2.5;opacity:.7}.fuzz2{stroke-width:3;stroke-dasharray:1 4;opacity:.45}' +
    '.rimglow{fill:none;stroke:var(--rimglow)}' +
    '.family-log{font:500 6px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;fill:var(--ink);white-space:pre}' +
    '.log-head{opacity:.55}.log-dim{opacity:.7}' +
    `.log-row{opacity:.62;animation:logType ${LOG.cycle}s ease-out infinite}` +
    '.led{fill:var(--ink);animation:led 2.8s ease-in-out infinite alternate}' +
    '.odo{animation:odo 7s steps(10) infinite}' +
    '.bar-track{fill:var(--ink);opacity:.18}' +
    `.bar-fill{fill:var(--ink);opacity:.75;transform-box:fill-box;transform-origin:left;animation:barFill ${LOG.cycle}s ease-out infinite}` +
    '.heart-px{fill:var(--spark)}.heart{transform-box:fill-box;transform-origin:center;animation:beat 1.6s ease-in-out infinite}' +
    '.cursor{fill:var(--ink);animation:blink 1s steps(1) infinite}' +
    `.walker{animation:${WALK_SECONDS}s linear infinite;fill:var(--sil)}` +
    '.walker .limb{fill:none;stroke:var(--sil);stroke-width:1.2;stroke-linecap:round}.walker .pole{stroke-width:1}' +
    '.hair{animation:hair 2.6s ease-in-out infinite alternate}' +
    '@keyframes hair{from{transform:rotate(-2deg)}to{transform:rotate(3deg)}}' +
    '.step-a{animation:stepA .7s steps(1) infinite}.step-b{animation:stepB .7s steps(1) infinite}' +
    '.pet-body{fill:var(--pet)}.pet-shade{fill:var(--pet-shade)}.pet-eye{fill:var(--eye)}.pet-cheek{fill:var(--cheek)}' +
    '.pet-scarf{fill:var(--scarf)}.pet-floor{fill:var(--petfloor)}' +
    '.bob{animation:bob .7s steps(1) infinite}' +
    '.blink{transform-box:fill-box;transform-origin:center;animation:blink 5s infinite}' +
    '.speck{fill:var(--speck)}.speck2{fill:var(--speck2)}' +
    '.spark{fill:var(--spark)}.spark-core{fill:var(--spark-core)}' +
    // Sky sparks only breathe, slowly and softly, so they never pull the eye from the chat.
    '.sky-spark{opacity:.5;animation:glimmer 10s ease-in-out infinite alternate}' +
    '.tent{fill:var(--tent)}.tent-shade{fill:var(--tent-shade)}.tent-door{fill:var(--tent-door)}' +
    '.tent-pole{fill:var(--log)}.tent-flag{fill:var(--spark)}' +
    '.flame{fill:var(--flame)}.flame-core{fill:var(--flame-core)}.log{fill:var(--log)}' +
    '.fire-glow{fill:var(--glow);opacity:.18;animation:glow 1.2s steps(2) infinite}' +
    '.flame-a{animation:stepA .5s steps(1) infinite}.flame-b{animation:stepB .5s steps(1) infinite}' +
    '@keyframes glimmer{from{opacity:.35}to{opacity:.7}}' +
    '@keyframes glow{0%{opacity:.14}50%{opacity:.24}}' +
    '.grain{opacity:.5}' +
    '@keyframes rain{from{transform:translateY(-60px)}to{transform:translateY(0)}}' +
    // Each row fades in after the one above, holds, then fades for the next pass. (Opacity only: cheap to repaint.)
    '@keyframes logType{0%{opacity:0}4%,90%{opacity:.62}96%,100%{opacity:0}}' +
    '@keyframes led{from{opacity:.25}to{opacity:.9}}' +
    `@keyframes odo{from{transform:translateY(0)}to{transform:translateY(${-10 * LOG.line}px)}}` +
    '@keyframes barFill{0%,8%{transform:scaleX(0)}30%,100%{transform:scaleX(1)}}' +
    '@keyframes beat{0%,60%,100%{transform:scale(.85);opacity:.7}10%{transform:scale(1.25);opacity:1}22%{transform:scale(.95)}32%{transform:scale(1.12)}}' +
    '@keyframes blink{0%{opacity:.8}50%{opacity:0}}' +
    walkKeyframes() +
    petKeyframes() +
    '@keyframes stepA{0%{opacity:1}50%{opacity:0}}@keyframes stepB{0%{opacity:0}50%{opacity:1}}' +
    // Still: everyone stands where they can be seen.
    '@media (prefers-reduced-motion: reduce){*{animation:none!important}.step-b,.flame-b{opacity:0}}'

  const streaks = Array.from({ length: 30 }, (_, i) => {
    const x = BAND.from + ((i * 37) % (BAND.to - BAND.from))
    const len = 90 + ((i * 53) % 200)
    const y = (i * 71) % 700
    return `M${x} ${y}v${len}`
  }).join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">` +
    `<style>${style}</style>` +
    '<defs>' +
    '<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky0)"/><stop offset=".62" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient>' +
    '<linearGradient id="landG" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="var(--land0)"/><stop offset=".012" stop-color="var(--land1)"/><stop offset=".05" stop-color="var(--land2)"/><stop offset="1" stop-color="var(--land2)"/></linearGradient>' +
    // Film grain: a small tile of scattered specks, dark and light.
    '<pattern id="grainP" width="23" height="19" patternUnits="userSpaceOnUse">' +
    '<rect class="speck" x="2" y="3" width="1.4" height="1.4"/><rect class="speck" x="14" y="11" width="1.2" height="1.2"/>' +
    '<rect class="speck" x="9" y="16" width="1" height="1"/><rect class="speck" x="19" y="5" width="1" height="1"/>' +
    '<rect class="speck2" x="6" y="9" width="1.2" height="1.2"/><rect class="speck2" x="17" y="15" width="1" height="1"/>' +
    '<rect class="speck2" x="11" y="2" width="1" height="1"/>' +
    '</pattern>' +
    '</defs>' +
    `<rect class="sky" width="${W}" height="${H}"/>` +
    `<g clip-path="url(#streakClip)"><clipPath id="streakClip"><rect x="${BAND.from}" y="0" width="${BAND.to - BAND.from}" height="${H}"/></clipPath><path class="streaks" d="${streaks}"/></g>` +
    familyLog() +
    skySparks() +
    horizon() +
    camp() +
    // A family on one path: the man leads, the girl walks between, the woman follows, the pet trails.
    walker(GAPS.man, man) +
    walker(GAPS.girl, girl) +
    walker(GAPS.woman, woman) +
    pet() +
    `<rect class="grain" x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="url(#grainP)"/>` +
    '</svg>'
  )
}
