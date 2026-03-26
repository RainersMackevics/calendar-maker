/* =========================================================
   Calendar Maker – Main Application Logic
   ========================================================= */

"use strict";

// ── Constants ──────────────────────────────────────────────
const MONTH_NAMES_LV = [
  "Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs",
  "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris",
];

const DAY_NAMES_LV = ["P", "O", "T", "C", "Pk", "S", "Sv"]; // Mon–Sun
const DAY_NAMES_FULL_LV = [
  "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena",
  "Piektdiena", "Sestdiena", "Svētdiena",
];

const STORAGE_KEY = "calendarMaker_data";
const SETTINGS_KEY = "calendarMaker_settings";

// ── State ──────────────────────────────────────────────────
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed
let showHolidays = true;

// Persisted note data: { "YYYY-MM-DD": "text", … }
let noteData = {};

// ── Persistence ────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) noteData = JSON.parse(raw);
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    if (typeof settings.showHolidays === "boolean") {
      showHolidays = settings.showHolidays;
    }
  } catch (_) {
    noteData = {};
  }
}

function saveNote(key, text) {
  noteData[key] = text;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(noteData));
  } catch (_) {}
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ showHolidays }));
  } catch (_) {}
}

// ── Helpers ────────────────────────────────────────────────
function dayKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function today() {
  const d = new Date();
  return dayKey(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Return the number of days in a month (1-indexed month).
 */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Return the day-of-week index (0=Mon … 6=Sun) for the 1st of the month.
 */
function firstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return (d + 6) % 7; // convert to Mon=0
}

// ── Rendering ──────────────────────────────────────────────
function renderCalendar() {
  const holidays = showHolidays ? getLatvianHolidays(currentYear) : {};
  const total = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);
  const todayKey = today();

  // Update header
  const monthYearText = `${MONTH_NAMES_LV[currentMonth]} ${currentYear}`;
  document.getElementById("monthYear").textContent = monthYearText;
  // Update print title (used by CSS ::before on .calendar-surface)
  document.getElementById("calendarSurface").setAttribute("data-month-year", monthYearText);
  // Sync jump controls
  document.getElementById("jumpMonth").value = currentMonth;
  document.getElementById("jumpYear").value = currentYear;

  // Sync toggle button
  const toggleBtn = document.getElementById("toggleHolidays");
  toggleBtn.classList.toggle("active", showHolidays);
  toggleBtn.textContent = showHolidays
    ? "🇱🇻 Latvijas svētku dienas: ieslēgts"
    : "🇱🇻 Latvijas svētku dienas: izslēgts";

  // Build grid
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  // Day-name header row
  DAY_NAMES_LV.forEach((name, i) => {
    const header = document.createElement("div");
    header.className = "day-header" + (i >= 5 ? " weekend" : "");
    header.textContent = name;
    header.setAttribute("title", DAY_NAMES_FULL_LV[i]);
    grid.appendChild(header);
  });

  // Empty cells before the 1st
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= total; d++) {
    const key = dayKey(currentYear, currentMonth, d);
    const dayOfWeek = (startDay + d - 1) % 7; // 0=Mon … 6=Sun
    const isWeekend = dayOfWeek >= 5;
    const holiday = holidays[key];
    const isToday = key === todayKey;

    const cell = document.createElement("div");
    cell.className = [
      "day-cell",
      isWeekend ? "weekend" : "",
      holiday ? "holiday" : "",
      isToday ? "today" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Day number
    const numEl = document.createElement("span");
    numEl.className = "day-number";
    numEl.textContent = d;
    cell.appendChild(numEl);

    // Holiday label
    if (holiday) {
      const hEl = document.createElement("span");
      hEl.className = "holiday-label";
      hEl.textContent = holiday;
      cell.appendChild(hEl);
    }

    // Editable note area
    const textarea = document.createElement("textarea");
    textarea.className = "day-note";
    textarea.placeholder = "Pievienot piezīmi…";
    textarea.value = noteData[key] || "";
    textarea.setAttribute("aria-label", `Piezīme ${d}. ${MONTH_NAMES_LV[currentMonth]}`);
    textarea.addEventListener("input", () => saveNote(key, textarea.value));

    cell.appendChild(textarea);
    grid.appendChild(cell);
  }
}

// ── Navigation ─────────────────────────────────────────────
function navigate(delta) {
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function goToToday() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  renderCalendar();
}

// ── Year / Month jump ──────────────────────────────────────
function jumpToMonth() {
  const monthSel = document.getElementById("jumpMonth");
  const yearInput = document.getElementById("jumpYear");
  const m = parseInt(monthSel.value, 10);
  const y = parseInt(yearInput.value, 10);
  if (!isNaN(m) && !isNaN(y) && y >= 1900 && y <= 2200) {
    currentMonth = m;
    currentYear = y;
    renderCalendar();
  }
}

// ── Holiday toggle ─────────────────────────────────────────
function toggleHolidays() {
  showHolidays = !showHolidays;
  saveSettings();
  renderCalendar();
}

// ── Print ──────────────────────────────────────────────────
function printCalendar() {
  window.print();
}

// ── Init ───────────────────────────────────────────────────
function init() {
  loadFromStorage();

  // Populate jump controls
  const monthSel = document.getElementById("jumpMonth");
  MONTH_NAMES_LV.forEach((name, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = name;
    if (i === currentMonth) opt.selected = true;
    monthSel.appendChild(opt);
  });
  document.getElementById("jumpYear").value = currentYear;

  // Wire up buttons
  document.getElementById("prevMonth").addEventListener("click", () => navigate(-1));
  document.getElementById("nextMonth").addEventListener("click", () => navigate(1));
  document.getElementById("todayBtn").addEventListener("click", goToToday);
  document.getElementById("toggleHolidays").addEventListener("click", toggleHolidays);
  document.getElementById("printBtn").addEventListener("click", printCalendar);
  document.getElementById("jumpMonth").addEventListener("change", jumpToMonth);
  document.getElementById("jumpYear").addEventListener("change", jumpToMonth);

  renderCalendar();
}

document.addEventListener("DOMContentLoaded", init);
