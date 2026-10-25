# Drum Academy 🥁

> **Read the beat. Make the kit speak.**
>
> A free, bilingual, browser-based drum-learning studio for anyone who wants to start from zero — with notation you can hear, not just read.

[![Live Site — GitHub Pages](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github)](https://flynntaggart26.github.io/bateri-akademisi/)
[![Verify and Deploy](https://github.com/Flynntaggart26/bateri-akademisi/actions/workflows/pages.yml/badge.svg)](https://github.com/Flynntaggart26/bateri-akademisi/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Language: English & Turkish](https://img.shields.io/badge/Language-EN%20%7C%20TR-blue)](https://flynntaggart26.github.io/bateri-akademisi/)

**🔗 Live site:** https://flynntaggart26.github.io/bateri-akademisi/  
**💻 Repository:** https://github.com/Flynntaggart26/bateri-akademisi  
**🌐 Languages:** English & Turkish — switch with **EN / TR** in the header  
**🛠️ Tech:** Vanilla HTML / CSS / JavaScript · Web Audio API · No build step · No account required

---

## Why This Exists

I have been around drums since I was a child. I teach friends at school the basics, and when someone wants deeper instruction, I send them to my uncle — a professional drum teacher with his own studio. One day I plan to build a booking system for his studio, but right now I wanted to share something smaller and immediate.

**Drum Academy** is my free guide for drum enthusiasts who want to learn without paying for lessons or installing software.

I built it because I struggled with one specific thing: I can read drum notation, but I do not truly internalize a rhythm until I hear it. If you are like me — someone who needs to hear the pattern alongside the notes — this is for you.

---

## What You Get

- **12-week learning path** — Four stages: Foundations → Read & Build → Control → Create
- **Bilingual interface** — English and Turkish, with saved preference
- **Playable drum pads** — Kick, snare, hi-hat, and tom (Web Audio API)
- **Metronome** — 40–220 BPM, tap tempo, visual pulse
- **16-step rhythm sequencer** — Build and play your own kick/snare/hi-hat patterns
- **Local progress saving** — Lessons completed and tempo stored in your browser
- **No signup, no backend, no tracking**

## The Curriculum at a Glance

| Stage | Weeks | Focus |
|-------|-------|-------|
| **Foundations** | 1–3 | Kit setup, posture, grip, rebound, note values |
| **Read & Build** | 4–6 | Write–say–play, drum notation, coordination |
| **Control** | 7–10 | Rock backbeat, rudiments, styles, dynamics |
| **Create** | 11–12 | Fills, song form, independence, final groove |

Every lesson follows the same flow: **feel → count → play**. You start with simple 1/4 pulses, build coordination layer by layer, and finish by writing your own groove.

---

## Project Structure

```
bateri-akademisi/
├── index.html      # Accessible, bilingual page structure
├── styles.css      # Responsive visual design
├── src/
│   ├── app.mjs     # Interface, audio engine, metronome, sequencer
│   ├── core.mjs    # Tempo helpers and browser-storage logic
│   └── i18n.mjs    # English/Turkish translations + 12-week curriculum
├── tests/          # Node.js test suite
├── docs/           # Additional documentation
├── README.md       # This file
└── LICENSE         # MIT License
```

---

## Run Locally

No dependencies, no build step. Just serve the folder over HTTP:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

---

## Testing

Requires Node.js 20+:

```bash
node --check src/app.mjs
node --check src/core.mjs
node --check src/i18n.mjs
node --test
```

Tests cover tempo normalization, saved progress, language preferences, all 12 weekly lessons in both languages, and translation completeness.

---

## Deployment

The site is deployed automatically to **GitHub Pages** via GitHub Actions on every push to `main`.

**🔗 Live URL:** https://flynntaggart26.github.io/bateri-akademisi/

For your own fork: go to **Settings → Pages → Build and deployment → GitHub Actions**.

---

## Curriculum References

All lesson explanations and practice drills are original. Teaching principles inspired by:

- [Percussive Arts Society — 40 International Drum Rudiments](https://pas.org/rudiments)
- [Berklee Online — Drum Set Practice Method](https://online.berklee.edu/store/product?category_id=21&product_id=11357&usca_p=t)
- [Vic Firth Education — A Fresh Approach to the Drumset](https://ae.vicfirth.com/wp-content/uploads/Fresh-Approach-to-Drumset-SAMPLER.pdf)
- [Müzik Akademi — Bateri Ders Kitabı](https://muzikakademi.com.tr/bateri-kursu/bateri-ders-kitabi)

---

## Privacy

No backend. No analytics. No user accounts. Progress and language choice stay in your browser’s local storage. Drum sounds are synthesized locally.

---

## License

**MIT** — free to use, modify, and share.

Built with ❤️ for drummers who need to hear the beat, not just read it.

---

**Repository:** https://github.com/Flynntaggart26/bateri-akademisi  
**Live site:** https://flynntaggart26.github.io/bateri-akademisi/
