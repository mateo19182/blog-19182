import { FLAG_CHARGES } from './flag-charges.js';

// A field, a supporting shape, and a focal symbol share one palette and layout.
// Values are still ordinary editable layers, with no hidden template state.
const PALETTES = [
  ['#eee9da', '#192c3b', '#c9513c'],
  ['#193c39', '#f1e8cf', '#cfa746'],
  ['#862f39', '#f5ead5', '#202b3d'],
  ['#e2b34d', '#202b3d', '#f1e8d3'],
  ['#e6e5df', '#242424', '#96978f'],
  ['#232323', '#eeece2', '#a7a59c'],
  ['#394766', '#f0e3c4', '#c87358'],
  ['#513e58', '#f0e4d3', '#a9ba9b'],
  ['#e7d5c0', '#36666c', '#a34839'],
  ['#c85b42', '#f2e7cf', '#2d4341']
];
const pick = (items, rng) => items[Math.floor(rng() * items.length)];
const range = (min, max, rng) => min + rng() * (max - min);

export function composeRandomFlag(makeLayer, defaultLfos, rng = Math.random) {
  const [background, ink, accent] = pick(PALETTES, rng);
  const ratio = pick(['3:2', '3:2', '5:3', '2:1', '4:3', '1:1'], rng);
  const [a, b] = ratio.split(':').map(Number);
  const aspect = a / b;
  const layers = [];
  const add = (type, props) => {
    const layer = makeLayer(type, { color: ink, color2: background, ...props });
    layers.push(layer);
    return layer;
  };
  let focus = { x: .5, y: .5, w: .32, h: .58 };
  const layout = Math.floor(rng() * 9);
  switch (layout) {
    case 0: // A broad central stripe leaves a quiet field for the emblem.
      add('band', { w: 1.1, h: pick([.38, .46, .54], rng), color: accent });
      break;
    case 1:
      add('band', { x: .16, w: .32, h: 1.1 });
      focus = { x: .65, y: .5, w: .35, h: .62 };
      if (rng() < .45) add('band', { x: .96, w: .08, h: 1.1, color: accent });
      break;
    case 2:
      add('stripes', { w: 1.1, h: 1.1, count: pick([3, 5, 7], rng), color: accent });
      add('circle', { w: .53 / aspect, h: .53, color: background });
      focus.w = .32 / aspect;
      focus.h = .37;
      break;
    case 3:
      add('band', { x: .25, w: .5, h: 1.1 });
      focus = { x: .5, y: .5, w: .4, h: .62 };
      add('diamond', { w: .66, h: .84, color: accent });
      break;
    case 4:
      add('saltire', { w: 1.1, h: 1.1, detail: .15, color: accent });
      add('circle', { w: .72 / aspect, h: .72, color: background });
      focus.w = .42 / aspect;
      focus.h = .48;
      break;
    case 5:
      add('cross', { x: .32, w: 1.5, h: 1.1, detail: .12 });
      add('cross', { x: .32, w: 1.5, h: 1.1, detail: .045, color: accent });
      focus = { x: .74, y: .25, w: .22, h: .33 };
      break;
    case 6:
      add('triangle', { x: .19, w: .66, h: 1.42, rotation: 90, color: accent });
      focus = { x: .68, y: .5, w: .33, h: .58 };
      break;
    case 7:
      add(pick(['waves', 'dots', 'rays', 'checks'], rng), {
        w: 1.12, h: 1.12, count: pick([4, 6, 8, 12], rng), detail: .2,
        color: accent, opacity: .32, rotation: pick([0, 0, 45], rng)
      });
      break;
    case 8:
      add('band', { y: .83, w: 1.1, h: .34, color: accent });
      focus = { x: .5, y: .4, w: .4, h: .58 };
      break;
  }

  const image = rng() < .78;
  const charge = image ? pick(FLAG_CHARGES, rng) : null;
  const type = image ? 'image' : pick(['star', 'sun', 'crescent', 'diamond', 'circle', 'rays'], rng);
  const symbolAspect = charge?.ratio || 1;
  // Fit the artwork into its allotted space without stretching it.
  const w = Math.min(focus.w, focus.h * symbolAspect / aspect);
  const h = w * aspect / symbolAspect;
  const originalArtwork = image && (charge.category === 'Arms' || rng() < .3);
  if (originalArtwork) {
    add('circle', { ...focus, w: w * 1.25, h: h * 1.25, color: '#f1e8d3' });
  }
  const symbol = add(type, {
    ...focus, w, h, color: layout === 3 ? background : ink,
    emblem: charge?.id || 'albania', imageTint: !originalArtwork,
    count: type === 'star' ? pick([5, 6, 8], rng) : pick([8, 12, 16], rng),
    detail: type === 'star' ? range(.36, .48, rng) : .28,
    rotation: type === 'diamond' ? pick([0, 45], rng) : 0
  });

  // Occasionally replace the single emblem with a row of three.
  if (rng() < .16 && layout !== 5 && !originalArtwork) {
    layers.pop();
    const { id, ...repeated } = symbol;
    for (const x of [focus.x - .2, focus.x, focus.x + .2]) {
      add(type, { ...repeated, x, w: w * .48, h: h * .48 });
    }
  }

  // One treated layer keeps the rest legible. Most flags remain crisp.
  if (rng() < .48) {
    const treated = pick(layers, rng);
    const effect = pick(['dither', 'dither', 'warp', 'echo', 'blur'], rng);
    treated[effect] = range(.12, effect === 'dither' ? .48 : .22, rng);
    treated.ditherSize = range(.05, .4, rng);
    treated.ditherShape = pick(['circle', 'square', 'diamond', 'line'], rng);
  }
  // A smaller experimental branch loosens placement and introduces rotation.
  if (rng() < .18) {
    const focal = layers.at(-1);
    if (focal.type !== 'image') focal.rotation += pick([-30, -15, 15, 30, 90], rng);
    focal.x += range(-.07, .07, rng);
    focal.y += range(-.06, .06, rng);

  }

  const lfos = defaultLfos().map(lfo => ({
    ...lfo, wave: pick(['sine', 'triangle', 'square', 'step'], rng),
    rate: range(.08, .45, rng), phase: rng(), seed: Math.floor(rng() * 999999)
  }));
  const targets = layers.at(-1).type === 'image'
    ? ['dither', 'warp', 'echo', 'opacity']
    : ['rotation', 'dither', 'warp', 'echo', 'opacity'];
  const routes = [{ lfo: pick(lfos, rng).id, layerId: layers.at(-1).id,
    target: pick(targets, rng), depth: range(.12, .32, rng) }];
  return { version: 2, ratio, background, layers, lfos, routes };
}
