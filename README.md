# calendar-maker

A printable calendar web application built with plain HTML, CSS, and JavaScript.

## Features

- **Monthly calendar view** – clean, printable grid layout (A4 landscape)
- **Editable day cells** – type notes or reminders directly into each day
- **Latvian public holidays** – toggle Latvian holidays on/off; includes both fixed-date and Easter-based moveable holidays
- **Month/year navigation** – ‹ › buttons or jump directly to any month/year
- **"Today" button** – return to the current month instantly
- **Auto-save** – notes and holiday preference are persisted in `localStorage`
- **Print-ready** – click 🖨️ or use Ctrl+P; controls are hidden and the month title appears automatically

## Usage

Open `index.html` in any modern browser – no build step or server required.

```
open index.html
```

## Files

| File | Description |
|---|---|
| `index.html` | App HTML and layout |
| `styles.css` | Screen and print styles |
| `app.js` | Calendar logic and state management |
| `holidays.js` | Latvian public holiday calculations |

## Latvian Holidays Included

**Fixed dates:** New Year's Day, Labour Day, Restoration of Independence (May 4), Midsummer Eve (June 23), Midsummer Day / St. John's Day (June 24), Proclamation Day (November 18), Christmas Eve, Christmas Day, Second Christmas Day, New Year's Eve.

**Moveable (Easter-based):** Good Friday, Easter Sunday, Easter Monday, Pentecost (Whit Sunday).
