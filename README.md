# Freshers Guide Portal

A static orientation schedule portal for incoming students. The site lets students select their programme and view the latest orientation timetable, including session times, activity names, and venue details.

## Project structure

- `index.html` — page markup and content structure
- `style.css` — layout, theme, and responsive styling
- `app.js` — department lookup, schedule rendering, and page interaction
- `data.json` — programme schedules and venue details used by the site
- `data.xlsx` — source schedule data used to update `data.json`

## How it works

Students choose their programme from the dropdown and the app renders that programme's schedule.

- No registration-number search is required anymore
- The dropdown is populated from `data.json`
- Schedule entries now include session time, activity, and venue

## Updating schedules

To update the timetable:

1. Edit `data.xlsx` with the new schedule details.
2. Regenerate `data.json` from the spreadsheet, or update `data.json` directly.
3. Keep programme names consistent so the dropdown loads the correct entries.

Schedule objects in `data.json` should follow this shape:

```json
{
  "programme": "B.Tech. Biotechnology",
  "schedule": [
    {
      "date": "2026-07-15",
      "slots": [
        {
          "time": "9:30 AM - 01:00 PM",
          "activity": "Main Induction",
          "venue": "MG Auditorium",
          "slot": 1
        }
      ]
    }
  ]
}
```

## Confirming programme coverage

The dropdown is generated from `data.json`, so every programme listed there must be present in the file. If a programme is missing from the dropdown, add or correct its entry in `data.json`.

## Local preview

Use any static server to preview locally:

```bash
npx serve .
```

Then visit the local URL shown by the server.

## Deployment

This repository is ready for static hosting.

- For Vercel: import the folder as a plain static project.
- For any other host: deploy as static HTML/CSS/JS.

`vercel.json` is provided for clean deployment if you choose the Vercel CLI or dashboard.
