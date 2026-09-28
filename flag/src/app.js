import { TYPES, RATIOS, DITHER_SHAPES, COLOR_MODES, initialDocument, normalizeDocument, makeLayer, varyLayer, randomDocument, encodeDocument, decodeDocument } from './model.js';
import { dimensions, svgMarkup } from './render.js';

const $ = selector => document.querySelector(selector);
const refs = {
  surround: $('#flagSurround'), stageCenter: $('.stage-center'), layerList: $('#layerList'),
  inspector: $('#inspector'), addMenu: $('#addMenu'),
  ratio: $('#ratioSelect'), background: $('#backgroundColor'),
  ratioLabel: $('#ratioLabel'), layerCount: $('#layerCount'), toast: $('#toast'),
  dialog: $('#exportDialog'), undo: $('#undoBtn'), redo: $('#redoBtn'),
  panel: $('.control-panel'), pagePrev: $('#prevLayerPage'), pageNext: $('#nextLayerPage'), pageLabel: $('#layerPageLabel')
};

function loadDocument() {
  const fromLink = new URLSearchParams(location.hash.slice(1)).get('d');
  if (fromLink) {
    const decoded = decodeDocument(fromLink);
    if (decoded) return decoded;
  }
  try {
    const stored = normalizeDocument(JSON.parse(localStorage.getItem('flag-lab-document')));
    if (stored) return stored;
  } catch { /* A blocked or empty local store is fine. */ }
  return initialDocument();
}

let doc = loadDocument();
let selectedId = doc.layers.at(-1)?.id ?? null;
let history = [JSON.stringify(doc)];
let historyIndex = 0;
let toastTimeout;
let drag = null;
let knobDrag = null;
let lastKnobTap = null;
let layerPage = 0;
const PAGE_SIZE = 5;

const selectedLayer = () => doc.layers.find(layer => layer.id === selectedId);
const typeInfo = type => TYPES.find(item => item.id === type);
const label = type => typeInfo(type)?.label || type;
const icon = type => typeInfo(type)?.icon || '□';
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function toast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => refs.toast.classList.remove('visible'), 2600);
}

function commit() {
  const snapshot = JSON.stringify(doc);
  if (snapshot === history[historyIndex]) return;
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot);
  if (history.length > 100) history.shift();
  historyIndex = history.length - 1;
  try { localStorage.setItem('flag-lab-document', snapshot); } catch { /* The editor still works without storage. */ }
  if (location.hash) window.history.replaceState(null, '', location.pathname + location.search);
  refs.undo.disabled = historyIndex === 0;
  refs.redo.disabled = true;
}

function restore(index) {
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  doc = JSON.parse(history[index]);
  if (!doc.layers.some(layer => layer.id === selectedId)) selectedId = doc.layers.at(-1)?.id ?? null;
  renderAll();
  try { localStorage.setItem('flag-lab-document', history[index]); } catch { /* Optional storage. */ }
  if (location.hash) window.history.replaceState(null, '', location.pathname + location.search);
}

function layoutPreview() {
  const { width, height } = dimensions(doc.ratio);
  const style = getComputedStyle(refs.stageCenter);
  const availableWidth = Math.max(40, refs.stageCenter.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4);
  const availableHeight = Math.max(40, refs.stageCenter.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 8);
  refs.surround.style.width = `${Math.max(40, Math.min(availableWidth, availableHeight * width / height, 1100))}px`;
  refs.surround.style.aspectRatio = `${width}/${height}`;
}

function renderPreview() {
  refs.surround.innerHTML = svgMarkup(doc, selectedId);
  layoutPreview();
}

function renderLayers() {
  const reversed = [...doc.layers].reverse();
  const pages = Math.max(1, Math.ceil(reversed.length / PAGE_SIZE));
  layerPage = clamp(layerPage, 0, pages - 1);
  refs.layerList.innerHTML = reversed.slice(layerPage * PAGE_SIZE, (layerPage + 1) * PAGE_SIZE).map((layer, index) => `
    <div class="layer-row ${layer.id === selectedId ? 'selected' : ''}" data-row-id="${esc(layer.id)}" role="listitem" tabindex="0" aria-label="Capa ${esc(label(layer.type))}">
      <span class="layer-index">${String(doc.layers.length - layerPage * PAGE_SIZE - index).padStart(2, '0')}</span>
      <span class="layer-icon" aria-hidden="true">${icon(layer.type)}</span>
      <span class="layer-name">${esc(label(layer.type))}</span>
      <span class="layer-color" style="background:${layer.color}"></span>
      <span class="layer-buttons"><button data-action="visibility" aria-label="${layer.visible ? 'Ocultar' : 'Mostrar'} capa" class="${layer.visible ? '' : 'hidden-layer'}">${layer.visible ? '◉' : '◎'}</button><button data-action="up" aria-label="Subir capa">↑</button><button data-action="down" aria-label="Bajar capa">↓</button></span>
    </div>`).join('') || '<div class="inspector-empty" aria-label="Sin capas">◇</div>';
  refs.layerCount.textContent = String(doc.layers.length).padStart(2, '0');
  refs.pageLabel.textContent = `${String(layerPage + 1).padStart(2, '0')}/${String(pages).padStart(2, '0')}`;
  refs.pagePrev.disabled = layerPage === 0;
  refs.pageNext.disabled = layerPage === pages - 1;
}

function knob(param, name, glyph, min, max, value, unit = '') {
  const turn = -135 + (value - min) / (max - min) * 270;
  return `<div class="knob-unit"><span class="knob-glyph" aria-hidden="true">${glyph}</span><div class="knob-body" style="--turn:${turn}deg"><input type="range" min="${min}" max="${max}" step="1" value="${value}" data-param="${param}" aria-label="${name}"/></div><output data-output="${param}">${value}${unit}</output></div>`;
}

function renderInspector() {
  const layer = selectedLayer();
  if (!layer) {
    refs.inspector.innerHTML = '<div class="inspector-empty" aria-label="Selecciona una capa">✳ ◇ ✳</div>';
    return;
  }
  const countTypes = ['stripes', 'star', 'sun', 'rays', 'dots', 'checks', 'waves'];
  const detailTypes = ['cross', 'saltire', 'chevron', 'star', 'sun', 'crescent', 'rays', 'dots', 'waves'];
  refs.inspector.innerHTML = `
    <div class="oscillator-bank">
    <div class="type-grid" role="group" aria-label="Forma de la capa">${TYPES.map(type => `<button class="type-key ${type.id === layer.type ? 'active' : ''}" data-type="${type.id}" aria-label="${type.label}" aria-pressed="${type.id === layer.type}">${type.icon}</button>`).join('')}</div>
    ${layer.type === 'text' ? `<input class="text-socket" type="text" maxlength="50" value="${esc(layer.text)}" data-param="text" aria-label="Texto de la capa"/>` : ''}
    <div class="color-pair"><label class="color-socket"><input type="color" value="${layer.color}" data-param="color" aria-label="Color principal"/></label><label class="color-socket"><input type="color" value="${layer.color2}" data-param="color2" aria-label="Color secundario"/></label></div>
    <div class="inspector-actions"><button data-inspector-action="duplicate" aria-label="Duplicar capa">⧉</button><button data-inspector-action="delete" aria-label="Eliminar capa">×</button></div>
    </div>
    <div class="geometry-bank">
    <div class="knob-grid">
      ${knob('x', 'Posición horizontal', '↔', -50, 150, Math.round(layer.x * 100), '%')}
      ${knob('y', 'Posición vertical', '↕', -50, 150, Math.round(layer.y * 100), '%')}
      ${knob('rotation', 'Giro', '⟳', -180, 180, Math.round(layer.rotation), '°')}
      ${knob('w', 'Anchura', '◧', 1, 250, Math.round(layer.w * 100), '%')}
      ${knob('h', 'Altura', '▤', 1, 250, Math.round(layer.h * 100), '%')}
      ${knob('opacity', 'Opacidad', '◐', 0, 100, Math.round(layer.opacity * 100), '%')}
      ${countTypes.includes(layer.type) ? knob('count', 'Número', '⠿', 2, 32, layer.count) : ''}
      ${detailTypes.includes(layer.type) ? knob('detail', 'Detalle', '✳', 2, 95, Math.round(layer.detail * 100), '%') : ''}
    </div>
    </div>
    <div class="texture-bank">
    <div class="effect-rail" aria-hidden="true"><span>◌</span><span>╱╲╱╲</span><span>◌</span></div>
    <div class="effects-bank" role="group" aria-label="Efectos de capa">
      ${knob('dither', 'Trama', '⠿', 0, 100, Math.round(layer.dither * 100))}
      ${knob('ditherSize', 'Tamaño de trama', '∙', 0, 100, Math.round(layer.ditherSize * 100))}
      ${knob('blur', 'Desenfoque', '◌', 0, 100, Math.round(layer.blur * 100))}
      ${knob('warp', 'Distorsión', '≋', 0, 100, Math.round(layer.warp * 100))}
      ${knob('echo', 'Eco', '◈', 0, 100, Math.round(layer.echo * 100))}
    </div>
    <div class="effect-selectors"><div class="pattern-grid" role="group" aria-label="Forma de la trama">${DITHER_SHAPES.map((shape, index) => `<button data-dither-shape="${shape}" class="pattern-key ${layer.ditherShape === shape ? 'active' : ''}" aria-label="${['Círculos', 'Cuadrados', 'Rombos', 'Barras'][index]}" aria-pressed="${layer.ditherShape === shape}">${['●', '■', '◆', '▥'][index]}</button>`).join('')}</div><div class="mode-grid" role="group" aria-label="Modo de color">${COLOR_MODES.map((mode, index) => `<button data-color-mode="${mode}" class="mode-key ${layer.colorMode === mode ? 'active' : ''}" aria-label="${['Color', 'Escala de grises', 'Blanco y negro'][index]}" aria-pressed="${layer.colorMode === mode}">${['◉', '◐', '◑'][index]}</button>`).join('')}</div></div>
    </div>`;
}

function renderAll() {
  refs.ratio.innerHTML = RATIOS.map(value => { const [w, h] = value.split(':').map(Number); const scale = 25 / Math.max(w, h); return `<button class="ratio-key ${doc.ratio === value ? 'active' : ''}" data-ratio="${value}" aria-label="Proporción ${value}" aria-pressed="${doc.ratio === value}"><span class="ratio-shape" style="--rw:${Math.round(w * scale)}px;--rh:${Math.round(h * scale)}px"></span></button>`; }).join('');
  refs.background.value = doc.background;
  refs.ratioLabel.textContent = doc.ratio;
  refs.undo.disabled = historyIndex === 0;
  refs.redo.disabled = historyIndex === history.length - 1;
  renderPreview(); renderLayers(); renderInspector();
}

function select(id) {
  selectedId = id;
  const reverseIndex = [...doc.layers].reverse().findIndex(layer => layer.id === id);
  if (reverseIndex >= 0) layerPage = Math.floor(reverseIndex / PAGE_SIZE);
  renderPreview(); renderLayers(); renderInspector();
}

function addLayer(type) {
  if (doc.layers.length >= 80) return toast('Límite de 80 capas');
  const layer = makeLayer(type);
  doc.layers.push(layer);
  selectedId = layer.id;
  layerPage = 0;
  refs.addMenu.hidden = true;
  commit(); renderAll();
  toast(`${label(type)} añadido`);
}

function removeSelected() {
  if (!selectedId) return;
  const index = doc.layers.findIndex(layer => layer.id === selectedId);
  if (index < 0) return;
  doc.layers.splice(index, 1);
  selectedId = doc.layers[Math.min(index, doc.layers.length - 1)]?.id ?? null;
  commit(); renderAll();
}

function duplicateSelected() {
  const layer = selectedLayer();
  if (!layer || doc.layers.length >= 80) return;
  const index = doc.layers.indexOf(layer);
  const copy = { ...layer, id: crypto.randomUUID(), x: clamp(layer.x + .055, -2, 3), y: clamp(layer.y + .055, -2, 3) };
  doc.layers.splice(index + 1, 0, copy);
  selectedId = copy.id;
  commit(); renderAll();
}

function svgPoint(event) {
  const box = refs.surround.getBoundingClientRect();
  const { width, height } = dimensions(doc.ratio);
  return { x: (event.clientX - box.left) * width / box.width, y: (event.clientY - box.top) * height / box.height };
}

function startDrag(event) {
  if (event.button !== 0) return;
  const handle = event.target.closest('[data-handle]');
  const hit = event.target.closest('[data-layer-id]');
  if (handle && selectedLayer()) {
    drag = { kind: handle.dataset.handle, id: selectedId, start: svgPoint(event), original: { ...selectedLayer() } };
  } else if (hit) {
    const id = hit.dataset.layerId;
    if (id !== selectedId) select(id);
    drag = { kind: 'move', id, start: svgPoint(event), original: { ...selectedLayer() } };
  } else { select(null); return; }
  event.preventDefault();
  refs.surround.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (!drag) return;
  const layer = doc.layers.find(item => item.id === drag.id);
  if (!layer) return;
  const p = svgPoint(event), { width, height } = dimensions(doc.ratio);
  const center = { x: drag.original.x * width, y: drag.original.y * height };
  if (drag.kind === 'move') {
    layer.x = clamp(drag.original.x + (p.x - drag.start.x) / width, -2, 3);
    layer.y = clamp(drag.original.y + (p.y - drag.start.y) / height, -2, 3);
  } else if (drag.kind === 'rotate') {
    const startAngle = Math.atan2(drag.start.y - center.y, drag.start.x - center.x);
    const angle = Math.atan2(p.y - center.y, p.x - center.x);
    layer.rotation = Math.round(drag.original.rotation + (angle - startAngle) * 180 / Math.PI);
  } else if (drag.kind === 'resize') {
    const startDistance = Math.hypot(drag.start.x - center.x, drag.start.y - center.y);
    const distance = Math.hypot(p.x - center.x, p.y - center.y);
    const factor = clamp(distance / Math.max(1, startDistance), .02, 20);
    layer.w = clamp(drag.original.w * factor, .01, 3);
    layer.h = clamp(drag.original.h * factor, .01, 3);
  }
  renderPreview();
}

function finishDrag(event) {
  if (!drag) return;
  if (refs.surround.hasPointerCapture(event.pointerId)) refs.surround.releasePointerCapture(event.pointerId);
  drag = null;
  commit(); renderAll();
}

async function share() {
  const url = new URL(location.href);
  url.hash = `d=${encodeDocument(doc)}`;
  try {
    await navigator.clipboard.writeText(url.href);
    window.history.replaceState(null, '', url.href);
    toast('Enlace copiado');
  } catch {
    const input = document.createElement('textarea');
    input.value = url.href; document.body.append(input); input.select();
    const copied = document.execCommand('copy'); input.remove();
    if (copied) { window.history.replaceState(null, '', url.href); toast('Enlace copiado'); }
    else toast('No se pudo copiar el enlace');
  }
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportSvg() {
  download(new Blob([svgMarkup(doc)], { type: 'image/svg+xml;charset=utf-8' }), 'flag-lab.svg');
  refs.dialog.close(); toast('SVG descargado');
}

async function exportPng() {
  const markup = svgMarkup(doc);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    const { width, height } = dimensions(doc.ratio);
    const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = Math.round(2400 * height / width);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG unavailable');
    download(blob, 'flag-lab.png'); refs.dialog.close(); toast('PNG descargado');
  } catch { toast('No se pudo crear el PNG'); }
  finally { URL.revokeObjectURL(url); }
}

function resetKnob(input) {
  const layer = selectedLayer();
  if (!layer) return;
  const param = input.dataset.param;
  const defaults = makeLayer(layer.type);
  if (!(param in defaults)) return;
  layer[param] = defaults[param];
  knobDrag = null;
  commit();
  renderAll();
}

function init() {
  refs.addMenu.innerHTML = TYPES.map(type => `<button data-add-type="${type.id}" aria-label="Añadir ${type.label}">${type.icon}</button>`).join('');
  renderAll();
  new ResizeObserver(layoutPreview).observe(refs.stageCenter);

  $('#addLayerBtn').addEventListener('click', () => { refs.addMenu.hidden = !refs.addMenu.hidden; });
  refs.pagePrev.addEventListener('click', () => { layerPage--; renderLayers(); });
  refs.pageNext.addEventListener('click', () => { layerPage++; renderLayers(); });
  $('.deck-nav').addEventListener('click', event => {
    const target = event.target.closest('[data-deck-target]');
    if (!target) return;
    refs.panel.dataset.deck = target.dataset.deckTarget;
    for (const button of document.querySelectorAll('[data-deck-target]')) button.setAttribute('aria-pressed', String(button === target));
    refs.addMenu.hidden = true;
  });
  for (const button of document.querySelectorAll('[data-deck-target]')) button.setAttribute('aria-pressed', String(button.dataset.deckTarget === refs.panel.dataset.deck));
  refs.addMenu.addEventListener('click', event => { const button = event.target.closest('[data-add-type]'); if (button) addLayer(button.dataset.addType); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.module-layers')) refs.addMenu.hidden = true; });
  refs.layerList.addEventListener('click', event => {
    const row = event.target.closest('[data-row-id]'); if (!row) return;
    const id = row.dataset.rowId, layer = doc.layers.find(item => item.id === id);
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return select(id);
    if (action === 'visibility') layer.visible = !layer.visible;
    else {
      const index = doc.layers.indexOf(layer), next = action === 'up' ? index + 1 : index - 1;
      if (next >= 0 && next < doc.layers.length) [doc.layers[index], doc.layers[next]] = [doc.layers[next], doc.layers[index]];
    }
    commit(); renderAll();
  });
  refs.layerList.addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.dataset.rowId) select(event.target.dataset.rowId); });
  refs.inspector.addEventListener('input', event => {
    const layer = selectedLayer(), param = event.target.dataset.param;
    if (!layer || !param) return;
    if (['x', 'y', 'w', 'h', 'opacity', 'detail', 'dither', 'ditherSize', 'blur', 'warp', 'echo'].includes(param)) layer[param] = Number(event.target.value) / 100;
    else if (['rotation', 'count'].includes(param)) layer[param] = Number(event.target.value);
    else if (['color', 'color2', 'text'].includes(param)) layer[param] = event.target.value;
    else return;
    const output = refs.inspector.querySelector(`[data-output="${param}"]`);
    if (output) output.textContent = event.target.value + (param === 'rotation' ? '°' : ['x', 'y', 'w', 'h', 'opacity', 'detail'].includes(param) ? '%' : '');
    const body = event.target.closest('.knob-body');
    if (body) body.style.setProperty('--turn', `${-135 + (Number(event.target.value) - Number(event.target.min)) / (Number(event.target.max) - Number(event.target.min)) * 270}deg`);
    renderPreview();
  });
  refs.inspector.addEventListener('change', event => {
    const layer = selectedLayer(), param = event.target.dataset.param;
    if (!layer || !param) return;
    commit(); renderAll();
  });
  refs.inspector.addEventListener('click', event => {
    const ditherShape = event.target.closest('[data-dither-shape]')?.dataset.ditherShape;
    if (ditherShape && selectedLayer()) { selectedLayer().ditherShape = ditherShape; commit(); renderAll(); return; }
    const colorMode = event.target.closest('[data-color-mode]')?.dataset.colorMode;
    if (colorMode && selectedLayer()) { selectedLayer().colorMode = colorMode; commit(); renderAll(); return; }
    const type = event.target.closest('[data-type]')?.dataset.type;
    if (type && selectedLayer()) { selectedLayer().type = type; commit(); renderAll(); return; }
    const action = event.target.dataset.inspectorAction;
    if (action === 'duplicate') duplicateSelected();
    if (action === 'delete') removeSelected();
  });
  refs.inspector.addEventListener('pointerdown', event => {
    const input = event.target.closest('.knob-body input');
    if (!input || event.button !== 0) return;
    if (event.pointerType === 'touch') {
      const now = performance.now();
      if (lastKnobTap?.param === input.dataset.param && now - lastKnobTap.time < 350) {
        event.preventDefault();
        lastKnobTap = null;
        resetKnob(input);
        return;
      }
      lastKnobTap = { param: input.dataset.param, time: now };
    }
    knobDrag = { input, pointerId: event.pointerId, startY: event.clientY, startValue: Number(input.value) };
    input.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  refs.inspector.addEventListener('pointermove', event => {
    if (!knobDrag || event.pointerId !== knobDrag.pointerId) return;
    const { input, startY, startValue } = knobDrag;
    const span = Number(input.max) - Number(input.min);
    const value = Math.round(clamp(startValue + (startY - event.clientY) * span / 180, Number(input.min), Number(input.max)));
    if (value !== Number(input.value)) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  const finishKnob = event => {
    if (!knobDrag || event.pointerId !== knobDrag.pointerId) return;
    knobDrag = null;
    commit();
  };
  refs.inspector.addEventListener('pointerup', finishKnob);
  refs.inspector.addEventListener('pointercancel', finishKnob);
  refs.inspector.addEventListener('dblclick', event => {
    const input = event.target.closest('.knob-body input');
    if (input) { event.preventDefault(); resetKnob(input); }
  });
  refs.ratio.addEventListener('click', event => { const value = event.target.closest('[data-ratio]')?.dataset.ratio; if (value) { doc.ratio = value; commit(); renderAll(); } });
  refs.background.addEventListener('input', () => { doc.background = refs.background.value; renderPreview(); });
  refs.background.addEventListener('change', () => { commit(); renderAll(); });
  refs.surround.addEventListener('pointerdown', startDrag);
  refs.surround.addEventListener('pointermove', moveDrag);
  refs.surround.addEventListener('pointerup', finishDrag);
  refs.surround.addEventListener('pointercancel', finishDrag);
  $('#mutateBtn').addEventListener('click', () => {
    const layer = selectedLayer(); if (!layer) return toast('Selecciona una capa');
    Object.assign(layer, varyLayer(layer)); commit(); renderAll();
  });
  $('#randomBtn').addEventListener('click', () => { doc = randomDocument(); selectedId = doc.layers.at(-1)?.id ?? null; commit(); renderAll(); });
  refs.undo.addEventListener('click', () => restore(historyIndex - 1));
  refs.redo.addEventListener('click', () => restore(historyIndex + 1));
  $('#shareBtn').addEventListener('click', share);
  $('#exportBtn').addEventListener('click', () => refs.dialog.showModal());
  $('#closeDialog').addEventListener('click', () => refs.dialog.close());
  $('#downloadSvg').addEventListener('click', exportSvg);
  $('#downloadPng').addEventListener('click', exportPng);
  document.addEventListener('keydown', event => {
    const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); restore(historyIndex + (event.shiftKey ? 1 : -1)); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); restore(historyIndex + 1); }
    else if (!editing && (event.key === 'Delete' || event.key === 'Backspace')) removeSelected();
    else if (!editing && event.key.toLowerCase() === 'd' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); duplicateSelected(); }
  });
  window.addEventListener('hashchange', () => {
    const value = new URLSearchParams(location.hash.slice(1)).get('d');
    const fromLink = decodeDocument(value);
    if (fromLink) { doc = fromLink; selectedId = doc.layers.at(-1)?.id ?? null; history = [JSON.stringify(doc)]; historyIndex = 0; renderAll(); }
  });
}

init();
