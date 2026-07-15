# Shaurya Sharma — Personal Site

The online home of Shaurya Sharma — a 14-year-old builder who loves making games, apps, and experiments. Fun, loud, and first-person: it's a personal site, not a résumé. Shaurya builds things on screens *and* in real life. Static HTML/CSS/JS, no build step. **Charcoal & Sky** identity (inspired by, not copied from, a Dribbble concept).

## Design

- **Palette:** cool off-white `#f3f4f6`, charcoal `#1f2229`, sky blue `#2f6bff` (main accent), red `#f5402c` (spark accent — hot takes, logo/eyebrow dots, marquee) — tokens at top of `assets/styles.css`
- **Type:** Fraunces (display serif), Archivo (body), Space Mono (labels)
- **Motion:** scroll reveals + stagger, stat count-ups, hover interactions, a marquee — all respect `prefers-reduced-motion`

## Pages

- `index.html` — Home: big hero, **Stuff I've built** (teaser), **What I like**, **Hot takes**
- `work.html` — **Stuff I've Built**: the full grid of projects
- `about.html` — **About Me**: friendly story, fun facts, full **What I like** + **Hot takes** (no CV/experience — it's a kid's personal site)
- Contact is a friendly "say hi" in the footer (`#connect`).

## Placeholders to swap before sharing

| Placeholder | Where |
|---|---|
| Hero stats `+24 / 14 / 5` | index.html hero |
| Projects `<My coolest build>` etc. + `Add a screenshot here` blocks | index.html + work.html — names, tags, descriptions, and **images** (drop screenshots into the `.ph` blocks) |
| **What I like** cards `<Your thing>` | index.html + about.html — edit to real interests |
| **Hot takes** | index.html + about.html — make them his real spicy opinions |
| Fun facts (`<age you started>`, `<favorite game>`, `<dream build>`) | about.html `.facts` |
| Story + `<hobby>` bits | about.html |
| YouTube link (`add link`) | footer — add a real URL or remove |
| A photo of Shaurya | about.html `.about__photo` |

Already wired to real accounts: **GitHub** → `github.com/shaurya8sharma-bot`, **email** → `shaurya8sharma@gmail.com`.

## Images
Drop image files into `assets/` and replace the `.ph` placeholder blocks with `<img>` tags (e.g. `<img src="assets/my-game.png" alt="My game">`). Send the pics and I'll wire them in.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
