// Пользовательские настройки с персистом в localStorage.
// Валидация и дефолты изолированы здесь, UI и игровой код обращаются через getters.

const STORAGE_KEY = 'maze-settings-v1';
const SENS_MIN = 0.2;
const SENS_MAX = 3.0;
const SENS_DEFAULT = 1.0;

const defaults = () => ({
  sensitivity: SENS_DEFAULT,
});

const clampSens = (v) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return SENS_DEFAULT;
  if (v < SENS_MIN) return SENS_MIN;
  if (v > SENS_MAX) return SENS_MAX;
  return v;
};

let state = defaults();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    state.sensitivity = clampSens(parsed.sensitivity);
  } catch (_) {
    state = defaults();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export const SENSITIVITY = {
  min: SENS_MIN,
  max: SENS_MAX,
  default: SENS_DEFAULT,
  step: 0.1,
};

export function initSettings() {
  load();
  return state;
}

export function getSensitivity() {
  return state.sensitivity;
}

export function setSensitivity(v) {
  const next = clampSens(v);
  if (next === state.sensitivity) return next;
  state.sensitivity = next;
  save();
  for (const fn of listeners) {
    try { fn(state); } catch (_) {}
  }
  return next;
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
