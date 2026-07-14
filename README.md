# Last Cast

A charter-fishing marketplace app focused on filling last-minute cancellations.
Customer booking flow + captain portal (registration, license verification,
dashboard, fee tiers) in one app.

This is a real, runnable project — not just a preview. Here's what you need to
know to get it live, in plain terms.

## What this is (and isn't) right now

- ✅ A fully working front-end app — every screen, button, and flow works
- ✅ Styled and ready to show people
- ❌ Not connected to a real database yet — everything resets when you refresh
  (no real accounts, no real bookings saved)
- ❌ No real login/signup yet — the captain login just moves you to the next
  screen, it doesn't check anything
- ❌ No payments yet

Those three are the next milestones, in that order. None of them require
starting over — they get added on top of what's here.

## Running it on your own computer

You'll need [Node.js](https://nodejs.org) installed (the free, standard
version — just click download on that site).

Then, in a terminal, inside this folder:

```
npm install
npm run dev
```

That prints a local address (something like `http://localhost:5173`) —
open that in your browser and the app runs, fully working, on your machine.

## Putting it on the internet (so you can send people a link)

The easiest path for a non-developer is **Vercel** or **Netlify** — both have
a free tier and both work the same basic way:

1. Create a free account at vercel.com or netlify.com
2. Connect it to a GitHub account (also free) and push this folder there
3. Point Vercel/Netlify at the repo — it detects this is a Vite project
   automatically and builds it for you
4. You get a real `https://` URL you can send to anyone

I can walk through this step by step whenever you're ready to actually do it —
it's about a 15-minute process the first time.

## Where things live

- `src/App.jsx` — the entire app (customer flow + captain portal)
- `public/icon.png` — the app icon
- Sample charter listings live directly inside `App.jsx` for now (the
  `CHARTERS` array near the top) — this is what gets replaced by a real
  database next

## Reaching the captain side directly

Add `?captain=1` to the end of the app's URL (or `#captain`) to land straight
on the captain login screen — useful for a text message or QR code aimed at
captains specifically, instead of sending them through the angler-facing app.
