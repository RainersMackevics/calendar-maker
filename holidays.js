/**
 * Latvian Public Holidays
 * Includes fixed-date holidays and moveable (Easter-based) holidays.
 */

/**
 * Calculate Easter Sunday for a given year using the Anonymous Gregorian algorithm.
 * @param {number} year
 * @returns {Date} Easter Sunday
 */
function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Add days to a Date object and return a new Date.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format a Date as "YYYY-MM-DD" key.
 * @param {Date} date
 * @returns {string}
 */
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Build a map of Latvian public holidays for the given year.
 * Returns an object keyed by "YYYY-MM-DD" with holiday name as value.
 * @param {number} year
 * @returns {Object.<string, string>}
 */
function getLatvianHolidays(year) {
  const holidays = {};

  function add(month, day, name) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    holidays[key] = name;
  }

  // Fixed public holidays
  add(1, 1, "Jaunais gads");               // New Year's Day
  add(5, 1, "Darba svētki");               // Labour Day
  add(5, 4, "Neatkarības atjaunošana");    // Restoration of Independence
  add(6, 23, "Līgo diena");               // Midsummer Eve
  add(6, 24, "Jāņu diena");              // Midsummer Day / St. John's Day
  add(11, 18, "Latvijas proklamēšana");   // Proclamation Day
  add(12, 24, "Ziemassvētku vakars");     // Christmas Eve
  add(12, 25, "Ziemassvētki");           // Christmas Day
  add(12, 26, "Otrie Ziemassvētki");     // Second Christmas Day
  add(12, 31, "Vecgada vakars");         // New Year's Eve

  // Moveable holidays (Easter-based)
  const easter = getEasterSunday(year);
  holidays[dateKey(addDays(easter, -2))] = "Lielā Piektdiena";   // Good Friday
  holidays[dateKey(easter)] = "Lieldienas";                        // Easter Sunday
  holidays[dateKey(addDays(easter, 1))] = "Otrās Lieldienas";    // Easter Monday
  holidays[dateKey(addDays(easter, 49))] = "Vasarsvētki";        // Pentecost (Whit Sunday)

  return holidays;
}
