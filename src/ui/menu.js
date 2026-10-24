// Игровое меню: главный экран + настройки.
// API: openMenu({ onContinue, onNewGame }), closeMenu(), isMenuOpen(), bindEscape().
// UI-разметка создаётся самим модулем — HTML добавлять не нужно.

import { getSensitivity, setSensitivity, SENSITIVITY, onChange } from '../game/settings.js';

let root = null;
let screen = 'main';
let callbacks = { onContinue: () => {}, onNewGame: () => {} };
let confirming = false;

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const k in props) {
    if (k === 'style') Object.assign(el.style, props[k]);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), props[k]);
    else if (k === 'class') el.className = props[k];
    else if (k === 'html') el.innerHTML = props[k];
    else el.setAttribute(k, props[k]);
  }
  for (const c of children) {
    if (c == null) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

function ensureRoot() {
  if (root) return root;
  root = h('div', { id: 'menu-overlay', class: '' });
  document.body.appendChild(root);
  return root;
}

function render() {
  const r = ensureRoot();
  r.innerHTML = '';
  const box = h('div', { class: 'menu-box', role: 'dialog', 'aria-modal': 'true' });
  r.appendChild(box);

  if (screen === 'main') renderMain(box);
  else if (screen === 'settings') renderSettings(box);
}

function renderMain(box) {
  box.appendChild(h('h2', { class: 'menu-title' }, '⏸ Пауза'));

  if (confirming) {
    box.appendChild(h('p', { class: 'menu-text' },
      'Начать новую игру? Текущий прогресс будет потерян.'));
    const row = h('div', { class: 'menu-row' });
    row.appendChild(h('button', {
      class: 'menu-btn menu-btn-danger',
      onclick: () => callbacks.onNewGame(),
    }, 'Да, начать заново'));
    row.appendChild(h('button', {
      class: 'menu-btn',
      onclick: () => { confirming = false; render(); },
    }, 'Отмена'));
    box.appendChild(row);
    return;
  }

  box.appendChild(h('button', {
    class: 'menu-btn menu-btn-primary',
    onclick: () => callbacks.onContinue(),
  }, '▶ Продолжить'));
  box.appendChild(h('button', {
    class: 'menu-btn',
    onclick: () => { confirming = true; render(); },
  }, '↻ Новая игра'));
  box.appendChild(h('button', {
    class: 'menu-btn',
    onclick: () => { screen = 'settings'; render(); },
  }, '⚙ Настройки'));

  box.appendChild(h('p', { class: 'menu-hint' },
    'Esc — закрыть меню'));
}

function renderSettings(box) {
  box.appendChild(h('h2', { class: 'menu-title' }, '⚙ Настройки'));

  const section = h('div', { class: 'menu-section' });
  section.appendChild(h('h3', { class: 'menu-subtitle' }, 'Управление камерой'));

  const labelRow = h('div', { class: 'menu-slider-head' });
  labelRow.appendChild(h('label', { for: 'menu-sens' }, 'Чувствительность свайпа'));
  const valueEl = h('span', { class: 'menu-slider-value', id: 'menu-sens-value' },
    getSensitivity().toFixed(1));
  labelRow.appendChild(valueEl);
  section.appendChild(labelRow);

  const slider = h('input', {
    id: 'menu-sens',
    type: 'range',
    min: String(SENSITIVITY.min),
    max: String(SENSITIVITY.max),
    step: String(SENSITIVITY.step),
    value: String(getSensitivity()),
    class: 'menu-slider',
  });
  slider.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    setSensitivity(v);
    valueEl.textContent = getSensitivity().toFixed(1);
  });
  section.appendChild(slider);

  const scale = h('div', { class: 'menu-slider-scale' });
  scale.appendChild(h('span', {}, 'медленнее'));
  scale.appendChild(h('span', {}, `${SENSITIVITY.default.toFixed(1)} (по умолч.)`));
  scale.appendChild(h('span', {}, 'быстрее'));
  section.appendChild(scale);

  box.appendChild(section);

  box.appendChild(h('button', {
    class: 'menu-btn',
    onclick: () => { screen = 'main'; render(); },
  }, '← Назад'));
}

export function openMenu(cbs = {}) {
  callbacks = { ...callbacks, ...cbs };
  screen = 'main';
  confirming = false;
  render();
  ensureRoot().classList.add('open');
}

export function closeMenu() {
  if (!root) return;
  root.classList.remove('open');
  confirming = false;
}

export function isMenuOpen() {
  return !!root && root.classList.contains('open');
}

export function bindEscape(onToggle) {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    onToggle();
  });
}

// Подписка на изменения настроек (для внешних HUD, если понадобится)
export { onChange as onSettingsChange };
