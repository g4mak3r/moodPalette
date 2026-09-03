const ATLAS = window.MOODPALETTE_ATLAS;

if (!ATLAS || ATLAS.colorCount !== 192 || ATLAS.groupCount !== 16) {
  throw new Error("moodPalette Color Atlas failed to load.");
}

const MOOD_SETS = Object.freeze(ATLAS.groups);
const MOOD_PROFILES = Object.freeze(ATLAS.profiles);

const MIN_MOODLETS = 1;
const MAX_MOODLETS = 6;
const MIN_PALETTE_DISTANCE = 0.12;

const state = {
  count: 3,
  activeMoodlets: [],
  selectedIndex: 0,
  isShuffling: false,
  language: "en"
};

const dom = {
  root: document.documentElement,
  body: document.body,
  card: document.getElementById("moodCard"),
  palette: document.getElementById("palette"),
  moodIndex: document.getElementById("moodIndex"),
  moodCategory: document.getElementById("moodCategory"),
  colorNameButton: document.getElementById("colorNameButton"),
  colorName: document.getElementById("colorName"),
  colorHexButton: document.getElementById("colorHexButton"),
  colorHex: document.getElementById("colorHex"),
  tagButton: document.getElementById("tagButton"),
  tag: document.getElementById("tag"),
  quote: document.getElementById("quote"),
  shuffleButton: document.getElementById("shuffleButton"),
  shuffleIcon: document.querySelector(".shuffle-button__icon"),
  cursorDot: document.getElementById("cursorDot"),
  cursorHalo: document.getElementById("cursorHalo"),
  copyLive: document.getElementById("copyLive"),
  languageSwitcher: document.querySelector("[data-language-switcher]"),
  languageTrigger: document.querySelector(".language-switcher__trigger"),
  languageOption: document.querySelector(".language-switcher__option"),
  i18nText: [...document.querySelectorAll("[data-i18n]")],
  i18nHtml: [...document.querySelectorAll("[data-i18n-html]")],
  i18nAria: [...document.querySelectorAll("[data-i18n-aria]")]
};

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];


const UI_COPY = Object.freeze({
  en: {
    title: "my moodlets<br>for today",
    introCopy: "Collect one to six shades and see what mood finds you today.",
    todayIAm: "today I am",
    shuffle: "shuffle",
    shuffleHint: "or press R",
    brandHome: "moodPalette — home",
    languageMenu: "Interface language",
    paletteLabel: "Choose a moodlet",
    controlsLabel: "Generator controls"
  },
  ru: {
    title: "мои мудлеты<br>на сегодня",
    introCopy: "Соберите от одного до шести оттенков и посмотрите, какое настроение выпадет сегодня.",
    todayIAm: "сегодня я",
    shuffle: "перемешать",
    shuffleHint: "или нажмите R",
    brandHome: "moodPalette — на главную",
    languageMenu: "Язык интерфейса",
    paletteLabel: "Выберите мудлет",
    controlsLabel: "Управление генератором"
  }
});

function localizedUI(key) {
  return UI_COPY[state.language]?.[key] ?? UI_COPY.en[key] ?? key;
}

function applyInterfaceLanguage() {
  dom.i18nText.forEach((element) => {
    const key = element.dataset.i18n;
    if (key) element.textContent = localizedUI(key);
  });
  dom.i18nHtml.forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (key) element.innerHTML = localizedUI(key);
  });
  dom.i18nAria.forEach((element) => {
    const key = element.dataset.i18nAria;
    if (key) element.setAttribute("aria-label", localizedUI(key));
  });
}

function fitTagTypography() {
  if (!dom.tag || !dom.tagButton) return;
  const container = dom.tagButton.parentElement;
  if (!container) return;

  const available = Math.max(180, container.getBoundingClientRect().width - 4);
  const viewport = window.innerWidth;
  const maxSize = viewport <= 560
    ? Math.min(46, Math.max(36, viewport * 0.105))
    : Math.min(70, Math.max(42, viewport * 0.06));
  const minSize = viewport <= 560 ? 25 : 30;

  dom.tag.style.fontSize = `${maxSize}px`;
  const computed = getComputedStyle(dom.tag);
  const canvas = fitTagTypography.canvas ?? (fitTagTypography.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  if (!context) return;

  context.font = `${computed.fontWeight} ${maxSize}px ${computed.fontFamily}`;
  const letterSpacing = Number.parseFloat(computed.letterSpacing) || 0;
  const text = dom.tag.textContent ?? "";
  const measured = context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
  const fitted = measured > available ? Math.max(minSize, maxSize * (available / measured)) : maxSize;
  dom.tag.style.fontSize = `${fitted.toFixed(2)}px`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

function createMoodlet(set, colorIndex) {
  const safeIndex = colorIndex % set.colors.length;
  const colorEntry = set.colors[safeIndex];
  return {
    setId: set.id,
    setNames: set.name,
    palette: set.colors.map((entry) => entry.hex),
    color: colorEntry.hex,
    colorNames: colorEntry.name,
    oklch: colorEntry.oklch,
    moodCopy: colorEntry.mood
  };
}

function localizedGroupName(moodlet) {
  return moodlet.setNames?.[state.language] ?? moodlet.setNames?.en ?? "Untitled";
}

function localizedColorName(moodlet) {
  return moodlet.colorNames?.[state.language] ?? moodlet.colorNames?.en ?? "unnamed color";
}

function localizedMoodTag(moodlet) {
  return moodlet.moodCopy?.tag?.[state.language] ?? moodlet.moodCopy?.tag?.en ?? "#moodPalette";
}

function localizedMoodStatus(moodlet) {
  return moodlet.moodCopy?.status?.[state.language] ?? moodlet.moodCopy?.status?.en ?? "";
}

function getAllMoodlets() {
  return MOOD_SETS.flatMap((set) => set.colors.map((_, index) => createMoodlet(set, index)));
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function oklchToOklab(oklch) {
  const hue = (oklch.h * Math.PI) / 180;
  return {
    l: oklch.l,
    a: oklch.c * Math.cos(hue),
    b: oklch.c * Math.sin(hue)
  };
}

function perceptualDistance(first, second) {
  if (!first?.oklch || !second?.oklch) return 1;
  const a = oklchToOklab(first.oklch);
  const b = oklchToOklab(second.oklch);
  return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
}

function setById(id) {
  return MOOD_SETS.find((set) => set.id === id);
}

function moodletsFromSets(ids) {
  return ids
    .map(setById)
    .filter(Boolean)
    .flatMap((set) => set.colors.map((_, index) => createMoodlet(set, index)));
}

function minimumDistance(candidate, selected) {
  if (!selected.length) return 1;
  return Math.min(...selected.map((moodlet) => perceptualDistance(candidate, moodlet)));
}

function chooseDiverseCandidate(pool, selected, usedColors) {
  const available = pool.filter((candidate) => !usedColors.has(candidate.color));
  if (!available.length) return null;

  const scored = available
    .map((candidate) => ({ candidate, distance: minimumDistance(candidate, selected) }))
    .sort((a, b) => b.distance - a.distance);

  const strong = scored.filter((item) => item.distance >= MIN_PALETTE_DISTANCE);
  const source = strong.length ? strong : scored;
  const topBand = source.slice(0, Math.max(1, Math.ceil(source.length * 0.22)));
  return randomItem(topBand).candidate;
}

function candidateGroupIds(anchorSet, usedGroups) {
  const roll = Math.random();
  const relation = roll < 0.62 ? anchorSet.compatible : roll < 0.88 ? anchorSet.contrast : MOOD_SETS.map((set) => set.id);
  const unused = relation.filter((id) => !usedGroups.has(id));
  if (unused.length) return unused;

  return MOOD_SETS
    .map((set) => set.id)
    .filter((id) => !usedGroups.has(id));
}

function generateMoodlets() {
  const firstSet = randomItem(MOOD_SETS);
  const first = createMoodlet(firstSet, Math.floor(Math.random() * firstSet.colors.length));
  const result = [first];
  const usedColors = new Set([first.color]);
  const usedGroups = new Set([first.setId]);

  while (result.length < state.count) {
    const anchorMoodlet = randomItem(result);
    const anchorSet = setById(anchorMoodlet.setId) ?? firstSet;
    const groupIds = candidateGroupIds(anchorSet, usedGroups);
    let candidate = chooseDiverseCandidate(moodletsFromSets(groupIds), result, usedColors);

    if (!candidate) {
      candidate = chooseDiverseCandidate(getAllMoodlets(), result, usedColors);
    }
    if (!candidate) break;

    result.push(candidate);
    usedColors.add(candidate.color);
    usedGroups.add(candidate.setId);
  }

  return result;
}

function applyAccent(moodlet) {
  const secondary = moodlet.palette.find((color) => color !== moodlet.color) ?? moodlet.color;

  dom.root.style.setProperty("--accent", moodlet.color);
  dom.root.style.setProperty("--accent-rgb", rgbString(moodlet.color));
  dom.root.style.setProperty("--accent-2", secondary);
  dom.root.style.setProperty("--accent-2-rgb", rgbString(secondary));
}

function selectMoodlet(index, { focus = false } = {}) {
  const moodlet = state.activeMoodlets[index];
  if (!moodlet) return;

  state.selectedIndex = index;
  applyAccent(moodlet);

  const groupName = localizedGroupName(moodlet);
  const colorName = localizedColorName(moodlet);
  const groupPrefix = state.language === "ru" ? "ГРУППА" : "GROUP";

  dom.moodCategory.textContent = `${groupPrefix} / ${groupName.toUpperCase()}`;
  dom.colorName.textContent = colorName;
  dom.colorHex.textContent = moodlet.color.toUpperCase();
  dom.colorNameButton.setAttribute("aria-label", state.language === "ru"
    ? `Скопировать название цвета ${colorName}`
    : `Copy color name ${colorName}`);
  dom.colorHexButton.setAttribute("aria-label", state.language === "ru"
    ? `Скопировать HEX-код ${moodlet.color.toUpperCase()}`
    : `Copy HEX color ${moodlet.color.toUpperCase()}`);
  dom.tag.textContent = localizedMoodTag(moodlet);
  dom.quote.textContent = localizedMoodStatus(moodlet);
  requestAnimationFrame(fitTagTypography);
  dom.moodIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(state.count).padStart(2, "0")}`;

  const buttons = [...dom.palette.querySelectorAll(".swatch:not(.swatch--add)")];
  buttons.forEach((button, buttonIndex) => {
    button.setAttribute("aria-pressed", String(buttonIndex === index));
  });

  if (focus) buttons[index]?.focus();
}

function animatePaletteShift(previousRects) {
  requestAnimationFrame(() => {
    for (const element of dom.palette.children) {
      const key = element.dataset.paletteKey;
      if (!key || !previousRects.has(key)) continue;

      const previous = previousRects.get(key);
      const next = element.getBoundingClientRect();
      const dx = previous.left - next.left;
      const dy = previous.top - next.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

      element.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" }
        ],
        { duration: 360, easing: "cubic-bezier(.16, 1, .3, 1)" }
      );
    }
  });
}

function paletteRects() {
  return new Map(
    [...dom.palette.children]
      .filter((element) => element.dataset.paletteKey)
      .map((element) => [element.dataset.paletteKey, element.getBoundingClientRect()])
  );
}

function renderPalette({ previousRects = null, addedColor = null } = {}) {
  dom.palette.replaceChildren();

  state.activeMoodlets.forEach((moodlet, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.setProperty("--swatch-color", moodlet.color);
    button.style.setProperty("--selected-rgb", rgbString(moodlet.color));
    button.setAttribute("aria-label", state.language === "ru" ? `Мудлет ${index + 1}: ${localizedColorName(moodlet)} ${moodlet.color}. Нажмите, чтобы удалить.` : `Moodlet ${index + 1}: ${localizedColorName(moodlet)} ${moodlet.color}. Click to remove.`);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("data-cursor-morph", "");
    button.dataset.moodletIndex = String(index);
    button.dataset.paletteKey = moodlet.color;
    button.innerHTML = '<span class="swatch__remove-hint" aria-hidden="true">×</span>';

    if (addedColor === moodlet.color) button.classList.add("is-added");

    button.addEventListener("click", () => removeMoodlet(index, button));

    button.addEventListener("pointerenter", () => {
      if (window.matchMedia("(hover: hover)").matches) selectMoodlet(index);
    });

    dom.palette.append(button);
  });

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "swatch swatch--add";
  addButton.setAttribute("aria-label", state.language === "ru" ? (state.count >= MAX_MOODLETS ? "Достигнут максимум из шести мудлетов" : "Добавить случайный мудлет") : (state.count >= MAX_MOODLETS ? "Maximum of six moodlets reached" : "Add a random moodlet"));
  addButton.setAttribute("data-cursor-morph", "");
  addButton.dataset.paletteKey = "__add__";
  addButton.disabled = state.count >= MAX_MOODLETS;
  addButton.innerHTML = '<span class="swatch-add__plus" aria-hidden="true">+</span>';
  addButton.addEventListener("click", addMoodlet);
  dom.palette.append(addButton);

  if (previousRects) animatePaletteShift(previousRects);
  queueMicrotask(() => document.dispatchEvent(new Event("moodPalette:palette-mutated")));
}

function renderMoodlets() {
  renderPalette();
  selectMoodlet(0);
}

function animateCardChange() {
  dom.card.classList.remove("is-changing");
  void dom.card.offsetWidth;
  dom.card.classList.add("is-changing");
  window.setTimeout(() => dom.card.classList.remove("is-changing"), 540);
}

function shuffleMoodlets({ animate = true } = {}) {
  if (state.isShuffling) return;

  state.isShuffling = true;
  state.activeMoodlets = generateMoodlets();
  state.selectedIndex = 0;

  if (animate) {
    animateCardChange();
    dom.shuffleButton.classList.add("is-shuffling");
  }

  window.setTimeout(() => {
    renderMoodlets();

    window.setTimeout(() => {
      dom.shuffleButton.classList.remove("is-shuffling");
      state.isShuffling = false;
    }, animate ? 180 : 0);
  }, animate ? 180 : 0);
}

function createAdditionalMoodlet() {
  const usedColors = new Set(state.activeMoodlets.map((moodlet) => moodlet.color));
  const usedGroups = new Set(state.activeMoodlets.map((moodlet) => moodlet.setId));
  const selected = state.activeMoodlets[state.selectedIndex] ?? randomItem(state.activeMoodlets);
  const anchorSet = setById(selected?.setId) ?? randomItem(MOOD_SETS);
  const groupIds = candidateGroupIds(anchorSet, usedGroups);

  return chooseDiverseCandidate(moodletsFromSets(groupIds), state.activeMoodlets, usedColors)
    ?? chooseDiverseCandidate(getAllMoodlets(), state.activeMoodlets, usedColors)
    ?? randomItem(getAllMoodlets());
}

function addMoodlet() {
  if (state.count >= MAX_MOODLETS || state.isShuffling) return;

  animateCardChange();
  const previousRects = paletteRects();
  const moodlet = createAdditionalMoodlet();
  state.activeMoodlets.push(moodlet);
  state.count = state.activeMoodlets.length;

  renderPalette({ previousRects, addedColor: moodlet.color });
  selectMoodlet(state.selectedIndex);
}

function removeMoodlet(index, button) {
  if (state.count <= MIN_MOODLETS || state.isShuffling) return;

  animateCardChange();
  button.classList.add("is-removing");
  const removedWasSelected = index === state.selectedIndex;

  window.setTimeout(() => {
    const previousRects = paletteRects();
    state.activeMoodlets.splice(index, 1);
    state.count = state.activeMoodlets.length;

    if (index < state.selectedIndex) state.selectedIndex -= 1;
    if (removedWasSelected) state.selectedIndex = Math.min(index, state.count - 1);
    state.selectedIndex = Math.max(0, state.selectedIndex);

    renderPalette({ previousRects });
      selectMoodlet(state.selectedIndex);
  }, 120);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

const feedbackTimers = new WeakMap();

function showCopyFeedback(target, message) {
  const popover = target.querySelector("[data-copy-popover]");
  if (!popover) return;

  popover.textContent = message;
  dom.copyLive.textContent = message;

  const existingTimer = feedbackTimers.get(target);
  if (existingTimer) window.clearTimeout(existingTimer);

  target.classList.remove("is-copy-feedback");
  // Restart the entrance transition on repeated clicks without a harsh jump.
  requestAnimationFrame(() => {
    target.classList.add("is-copy-feedback");
  });

  const timer = window.setTimeout(() => {
    target.classList.remove("is-copy-feedback");
    feedbackTimers.delete(target);
  }, 1250);

  feedbackTimers.set(target, timer);
}

async function copyTag() {
  const text = dom.tag.textContent.trim();
  const copied = await copyToClipboard(text);

  if (copied) {
    showCopyFeedback(dom.tagButton, state.language === "ru" ? "хештег скопирован" : "hashtag copied");
    dom.tagButton.setAttribute("aria-label", state.language === "ru" ? "Хештег скопирован" : "Hashtag copied");
    window.setTimeout(() => dom.tagButton.setAttribute(
      "aria-label",
      state.language === "ru" ? "Скопировать хештег" : "Copy hashtag"
    ), 1300);
  } else {
    dom.tagButton.setAttribute(
      "aria-label",
      state.language === "ru" ? "Не удалось скопировать хештег" : "Could not copy hashtag"
    );
  }
}

async function copyColorName() {
  const text = dom.colorName.textContent.trim();
  if (!text) return;
  const copied = await copyToClipboard(text);
  if (copied) showCopyFeedback(dom.colorNameButton, state.language === "ru" ? "название скопировано" : "name copied");
}

async function copyColorHex() {
  const text = dom.colorHex.textContent.trim().toUpperCase();
  if (!text) return;
  const copied = await copyToClipboard(text);
  if (copied) showCopyFeedback(dom.colorHexButton, state.language === "ru" ? `${text} скопирован` : `${text} copied`);
}

function setupKeyboard() {
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (isTyping) return;

    if (event.code === "KeyR") {
      event.preventDefault();
      pulseControl(dom.shuffleButton);
      shuffleMoodlets();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      addMoodlet();
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      const selected = dom.palette.querySelector(`.swatch[data-moodlet-index="${state.selectedIndex}"]`);
      if (selected) removeMoodlet(state.selectedIndex, selected);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (state.selectedIndex + delta + state.activeMoodlets.length) % state.activeMoodlets.length;
      selectMoodlet(nextIndex, { focus: true });
    }
  });
}

const controlPulseTimers = new WeakMap();

function pulseControl(control) {
  if (!control) return;
  const previousTimer = controlPulseTimers.get(control);
  if (previousTimer) window.clearTimeout(previousTimer);

  control.classList.add("is-control-pressed");
  const timer = window.setTimeout(() => {
    control.classList.remove("is-control-pressed");
    controlPulseTimers.delete(control);
  }, 150);
  controlPulseTimers.set(control, timer);
}

function setupControlDynamics() {
  const supportsDynamics = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!supportsDynamics.matches) return;

  const surfaces = [dom.shuffleButton].filter(Boolean);

  for (const surface of surfaces) {
    const reset = () => {
      surface.style.setProperty("--control-tilt-x", "0deg");
      surface.style.setProperty("--control-tilt-y", "0deg");
      surface.style.setProperty("--control-shift-x", "0px");
      surface.style.setProperty("--control-shift-y", "0px");
      surface.style.setProperty("--control-light-x", "50%");
      surface.style.setProperty("--control-light-y", "50%");
      surface.classList.remove("is-pointer-down");
    };

    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      surface.style.setProperty("--control-tilt-x", `${(-ny * 2.8).toFixed(2)}deg`);
      surface.style.setProperty("--control-tilt-y", `${(nx * 4.2).toFixed(2)}deg`);
      surface.style.setProperty("--control-shift-x", `${(nx * 1.8).toFixed(2)}px`);
      surface.style.setProperty("--control-shift-y", `${(ny * 1.2).toFixed(2)}px`);
      surface.style.setProperty("--control-light-x", `${(((nx + 1) / 2) * 100).toFixed(1)}%`);
      surface.style.setProperty("--control-light-y", `${(((ny + 1) / 2) * 100).toFixed(1)}%`);
    }, { passive: true });

    surface.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      surface.classList.add("is-pointer-down");
    });

    surface.addEventListener("pointerup", () => surface.classList.remove("is-pointer-down"));
    surface.addEventListener("pointercancel", reset);
    surface.addEventListener("pointerleave", reset);
  }
}

function setupPointerEffects() {
  const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!supportsFinePointer.matches) return;

  const cursor = {
    pointerX: window.innerWidth / 2,
    pointerY: window.innerHeight / 2,
    dotX: window.innerWidth / 2,
    dotY: window.innerHeight / 2,
    haloX: window.innerWidth / 2,
    haloY: window.innerHeight / 2,
    haloTargetX: window.innerWidth / 2,
    haloTargetY: window.innerHeight / 2,
    activeTarget: null,
    activeMagneticSurfaces: []
  };

  const MAGNET_DISTANCE = 18;
  const NESTED_MAGNET_DISTANCE = 36;

  function targetRadius(target, rect) {
    const value = getComputedStyle(target).borderRadius;
    if (value.includes("%")) return Math.min(rect.width, rect.height) / 2;
    return Number.parseFloat(value) || 18;
  }

  function clearMagneticSurfaces() {
    cursor.activeMagneticSurfaces.forEach((surface) => surface.classList.remove("is-pointer-magnetized"));
    cursor.activeMagneticSurfaces = [];
  }

  function activateMagneticSurfaces(target) {
    clearMagneticSurfaces();

    const surfaces = [target];
    let parent = target.parentElement?.closest("[data-cursor-morph]");
    while (parent) {
      surfaces.push(parent);
      parent = parent.parentElement?.closest("[data-cursor-morph]");
    }

    surfaces.forEach((surface) => surface.classList.add("is-pointer-magnetized"));
    cursor.activeMagneticSurfaces = surfaces;
  }

  function releaseTarget() {
    clearMagneticSurfaces();
    cursor.activeTarget = null;

    dom.body.classList.remove("is-cursor-morphed", "cursor-over-swatch", "cursor-over-removable-swatch", "cursor-over-add");
    dom.cursorHalo.style.width = "34px";
    dom.cursorHalo.style.height = "34px";
    dom.cursorHalo.style.borderRadius = "50%";
    cursor.haloTargetX = cursor.pointerX;
    cursor.haloTargetY = cursor.pointerY;
  }

  function findMagneticTarget(x, y) {
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const target of document.querySelectorAll("[data-cursor-morph]")) {
      if (target.matches(":disabled")) continue;

      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;

      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = Math.hypot(dx, dy);

      const isNested = target.hasAttribute("data-cursor-nested");
      const parentSurface = isNested ? target.parentElement?.closest("[data-cursor-morph]") : null;
      const parentRect = parentSurface?.getBoundingClientRect();
      const pointerInsideParent = parentRect
        ? x >= parentRect.left && x <= parentRect.right && y >= parentRect.top && y <= parentRect.bottom
        : false;

      // Links only morph once the real pointer is inside their expanded hit area.
      // That keeps left-click and browser right-click/context-menu behavior perfectly aligned
      // with the visual magnetic state. Nested controls receive a wider directional field
      // while the pointer is already inside their parent capsule.
      const maxDistance = target.matches("a")
        ? 0
        : (isNested && pointerInsideParent ? NESTED_MAGNET_DISTANCE : MAGNET_DISTANCE);
      if (distance > maxDistance) continue;

      // Nested controls deliberately win over their parent capsule as the pointer
      // approaches them, while the parent glass remains active underneath.
      const nestedBias = isNested ? 24 : 0;
      const areaBias = Math.min((rect.width * rect.height) / 100000, 0.8);
      const score = distance - nestedBias + areaBias;

      if (score < bestScore) {
        best = { target, rect };
        bestScore = score;
      }
    }

    return best;
  }

  function morphTo({ target, rect }) {
    if (cursor.activeTarget !== target) {
      cursor.activeTarget = target;
      activateMagneticSurfaces(target);

      if (target.classList.contains("swatch")) {
        const index = Number.parseInt(target.dataset.moodletIndex ?? "", 10);
        if (Number.isInteger(index)) selectMoodlet(index);
      }
    }

    const isAnySwatch = target.classList.contains("swatch");
    const isAddSwatch = target.classList.contains("swatch--add");
    const isSwatch = isAnySwatch && !isAddSwatch;
    dom.body.classList.toggle("cursor-over-swatch", isSwatch);
    dom.body.classList.toggle("cursor-over-removable-swatch", isSwatch);
    dom.body.classList.toggle("cursor-over-add", isAddSwatch);

    const maxWidth = isAnySwatch ? rect.width + 12 : rect.width + 14;
    const maxHeight = isAnySwatch ? rect.height + 12 : rect.height + 12;
    const radius = targetRadius(target, rect) + 5;

    dom.body.classList.add("is-cursor-morphed");
    dom.cursorHalo.style.width = `${maxWidth}px`;
    dom.cursorHalo.style.height = `${maxHeight}px`;
    dom.cursorHalo.style.borderRadius = `${radius}px`;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const travelX = Math.max(-rect.width * 0.1, Math.min(rect.width * 0.1, (cursor.pointerX - centerX) * 0.14));
    const travelY = Math.max(-rect.height * 0.1, Math.min(rect.height * 0.1, (cursor.pointerY - centerY) * 0.14));

    cursor.haloTargetX = centerX + travelX;
    cursor.haloTargetY = centerY + travelY;
  }

  document.addEventListener("pointermove", (event) => {
    cursor.pointerX = event.clientX;
    cursor.pointerY = event.clientY;


    const magneticTarget = findMagneticTarget(event.clientX, event.clientY);
    if (magneticTarget) morphTo(magneticTarget);
    else releaseTarget();
  }, { passive: true });

  document.addEventListener("moodPalette:palette-mutated", () => {
    const magneticTarget = findMagneticTarget(cursor.pointerX, cursor.pointerY);
    if (magneticTarget) morphTo(magneticTarget);
    else releaseTarget();
  });

  document.addEventListener("pointerleave", releaseTarget);
  window.addEventListener("blur", releaseTarget);

  function animateCursor() {
    cursor.dotX += (cursor.pointerX - cursor.dotX) * 0.38;
    cursor.dotY += (cursor.pointerY - cursor.dotY) * 0.38;

    if (!cursor.activeTarget) {
      cursor.haloTargetX = cursor.pointerX;
      cursor.haloTargetY = cursor.pointerY;
    }

    const haloEase = cursor.activeTarget ? 0.24 : 0.14;
    cursor.haloX += (cursor.haloTargetX - cursor.haloX) * haloEase;
    cursor.haloY += (cursor.haloTargetY - cursor.haloY) * haloEase;

    dom.cursorDot.style.left = `${cursor.dotX}px`;
    dom.cursorDot.style.top = `${cursor.dotY}px`;
    dom.cursorHalo.style.left = `${cursor.haloX}px`;
    dom.cursorHalo.style.top = `${cursor.haloY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

function setupCardTilt() {
  const supportsTilt = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!supportsTilt.matches) return;

  dom.card.addEventListener("pointermove", (event) => {
    const rect = dom.card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 7;
    const rotateX = (0.5 - y) * 6;

    dom.card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    dom.card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
  }, { passive: true });

  dom.card.addEventListener("pointerleave", () => {
    dom.card.style.setProperty("--tilt-x", "0deg");
    dom.card.style.setProperty("--tilt-y", "0deg");
  });
}

function refreshLocalizedColorUI() {
  document.documentElement.lang = state.language === "ru" ? "ru" : "en";
  applyInterfaceLanguage();

  if (dom.languageTrigger && dom.languageOption) {
    dom.languageTrigger.querySelector("span:first-child").textContent = state.language === "ru" ? "Рус" : "Eng";
    dom.languageOption.textContent = state.language === "ru" ? "Eng" : "Рус";
    dom.languageOption.setAttribute("lang", state.language === "ru" ? "en" : "ru");
  }

  if (state.activeMoodlets.length) {
    selectMoodlet(state.selectedIndex);
    const swatches = [...dom.palette.querySelectorAll(".swatch:not(.swatch--add)")];
    swatches.forEach((button, index) => {
      const moodlet = state.activeMoodlets[index];
      if (!moodlet) return;
      button.setAttribute("aria-label", state.language === "ru"
        ? `Мудлет ${index + 1}: ${localizedColorName(moodlet)} ${moodlet.color}. Нажмите, чтобы удалить.`
        : `Moodlet ${index + 1}: ${localizedColorName(moodlet)} ${moodlet.color}. Click to remove.`);
    });
  }
}

function setupLanguageSwitcher() {
  if (!dom.languageSwitcher || !dom.languageTrigger || !dom.languageOption) return;

  const setOpen = (open) => {
    dom.languageSwitcher.classList.toggle("is-open", open);
    dom.languageTrigger.setAttribute("aria-expanded", String(open));
  };

  dom.languageTrigger.addEventListener("click", () => {
    setOpen(!dom.languageSwitcher.classList.contains("is-open"));
  });

  dom.languageOption.addEventListener("click", () => {
    state.language = state.language === "en" ? "ru" : "en";
    refreshLocalizedColorUI();
    setOpen(false);
  });

  dom.languageSwitcher.addEventListener("pointerenter", () => setOpen(true));
  dom.languageSwitcher.addEventListener("pointerleave", () => setOpen(false));
  dom.languageSwitcher.addEventListener("focusin", () => setOpen(true));
  dom.languageSwitcher.addEventListener("focusout", (event) => {
    if (!dom.languageSwitcher.contains(event.relatedTarget)) setOpen(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!dom.languageSwitcher.contains(event.target)) setOpen(false);
  });
}

function setupEvents() {
  dom.shuffleButton.addEventListener("click", () => {
    pulseControl(dom.shuffleButton);
    shuffleMoodlets();
  });
  dom.tagButton.addEventListener("click", copyTag);
dom.colorNameButton.addEventListener("click", copyColorName);
dom.colorHexButton.addEventListener("click", copyColorHex);

  setupKeyboard();
  setupLanguageSwitcher();
  setupPointerEffects();
  setupControlDynamics();
  setupCardTilt();
  window.addEventListener("resize", () => requestAnimationFrame(fitTagTypography), { passive: true });
}

function init() {
  setupEvents();
  refreshLocalizedColorUI();
  shuffleMoodlets({ animate: false });
}

init();
