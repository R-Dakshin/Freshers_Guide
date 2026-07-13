# Freshers Guide Portal

A static site where incoming students look up their orientation-week schedule by **department** or **registration number** in a secure, privacy-aware experience.

## Files

- `index.html` — page markup
- `style.css` — visual design (Freshers Guide / ticket theme)
- `app.js` — search logic + rendering
- `data.json` — the schedule, generated from `schedule.xlsx`
- `branch-codes.json` — maps each programme to the branch-code fragments expected inside a registration number (e.g. `24CSD0098` → Data Science)

## Editing the schedule

If the timetable changes, edit `data.json` directly (or regenerate it from a new spreadsheet) — no other file needs to change. Each entry looks like:

```json
{
  "programme": "B.Tech. Biotechnology",
  "schedule": [
    {
      "date": "2026-07-15",
      "display_date": "Wednesday, 15 July 2026",
      "slots": [
        { "slot": 1, "time": "9:30 AM – 11:00 AM", "activity": "Induction" }
      ]
    }
  ]
}
```

## Registration-number search — important

The source spreadsheet has **no registration numbers in it**, only department names. `branch-codes.json` is a best-guess mapping of likely branch-code fragments (e.g. `CSD`, `AIML`, `EEE`) that the app looks for inside whatever the student types. Before going live:

1. Confirm your institution's real registration-number format.
2. Update the code lists in `branch-codes.json` so they match exactly (add/remove codes per programme).

Department search works immediately with no changes, since it uses the real programme names.

## Run locally

Any static file server works, e.g.:

```bash
npx serve .
```

Then open the printed local URL.

## Deploy to Vercel

1. Push this folder to a GitHub repo (or drag-and-drop it in the Vercel dashboard).
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset: **Other** (no build step needed — it's a static site).
4. Deploy. `vercel.json` is already set up for clean URLs.

Or via CLI from inside this folder:

```bash
npm i -g vercel
vercel
```
