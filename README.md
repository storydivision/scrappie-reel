# Scrappie Reel

A dark, editorial one-page Hugo theme for small video studios, filmmakers and editors. Big serif type, a full-bleed hero video, a numbered film grid with hover trailers, and a proper full-screen player.

Built to stay small: plain CSS, a few kilobytes of vanilla JS, no Node, no SCSS, no Hugo Extended.

## Features

- **Hero video** background loop, with an optional panning image mosaic for mobile / Low Power Mode / `prefers-reduced-motion`
- **Film grid**: numbered tiles, optional client label, silent hover trailers on pointer devices
- **Player** built on native `<dialog>`: Vimeo, YouTube (privacy-enhanced), plain MP4, or self-hosted **HLS** via vendored [Video.js](https://videojs.com/) (loaded only when needed). Previous/next, deep links (`/#film-<slug>`), Escape to close
- **Mobile menu** on the native Popover API
- **Brand tokens** (colors, fonts) set from config, no CSS edits needed
- **Accessible by default**: one `h1`, skip link, real links and buttons, visible focus, reduced-motion support, 44px touch targets
- **i18n** for every UI string (`i18n/en.toml`)

## Requirements

- Hugo **0.128+** (standard edition is fine; tested on 0.166)
- Evergreen browsers: Chrome/Edge 114+, Safari 17+, Firefox 125+ (uses `<dialog>`, `popover` and `color-mix()`)

## Install

As a git submodule:

```sh
git submodule add https://github.com/storydivision/scrappie-reel.git themes/scrappie-reel
```

```yaml
# hugo.yaml
theme: scrappie-reel
```

Or as a Hugo Module:

```yaml
module:
  imports:
    - path: github.com/storydivision/scrappie-reel
```

## Configure

```yaml
title: "Studio Name | Video production"
params:
  name: "Studio Name"                    # logo alt text, footer, page titles
  logo: /images/logo.png                 # light logo on dark; falls back to the name as text
  description: "Small-crew video production for brands with a story to tell."
  email: "hello@example.com"             # shown in Contact; obfuscated in the HTML
  instagram: "handle"                    # also: tiktok, twitter, linkedin, vimeo
  ctaLabel: "Start a project"            # nav button, links to #contact

  brand:
    colorGround: "#0B0C14"               # page background
    colorText: "#F3F1EA"
    colorMuted: "#9A9CAE"
    colorAccent: "#FFAA01"               # used sparingly: dots, underlines, play button
    fontDisplay: "Instrument Serif"
    fontBody: "Instrument Sans"
    # fontGoogleUrl: "https://fonts.googleapis.com/css2?family=..."
    heroMosaicUrl: /images/hero-mosaic.webp   # optional mobile/reduced-motion fallback

  hero:
    eyebrow: "Studio Name · Video makers"
    headline: "Small on<br>purpose"      # HTML allowed; an accent-colored "." is appended
    video: videos/hero.mp4               # muted background loop (desktop)
    poster: images/hero.jpg              # optional
    reel: /gallery/showreel              # optional: hero button opens this film
    reelLabel: "Watch the reel"

  work:
    intro: "A short list, on purpose."   # optional; eyebrow / heading also settable

  formats:                               # optional section
    items:
      - { title: "Short film",   spec: "16:9 · YouTube, web", ratio: "16x9", image: /images/wide.jpg }
      - { title: "Vertical cut", spec: "9:16 · Social",       ratio: "9x16", image: /images/tall.jpg }
      - { title: "Quick clips",  spec: "1:1 · Feeds",         ratio: "1x1",  image: /images/square.jpg }
      # ratio: 16x9 | 9x16 | 1x1 | 4x5

menu:
  main:
    - { name: Work, url: /#work, weight: 1 }
    - { name: About, url: /#about, weight: 2 }
    - { name: Contact, url: /#contact, weight: 3 }
```

Favicons (`favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, `site.webmanifest`) are read from your site's `static/` folder.

## Content

### Films: `content/gallery/<slug>.md`

```sh
hugo new gallery/my-film.md
```

```toml
+++
title = "Clean Water"
client = "NRDC"                          # optional, shown beside the title
date = 2026-01-15                        # grid order: oldest first
image = "gallery/my-film.jpg"            # under static/images/
alt = "Two kids at a water pump"
video = "https://vimeo.com/123456789"
+++
Optional notes, shown under the player.
```

`video` accepts:

| Source | Example |
| --- | --- |
| Vimeo | `https://vimeo.com/123456789` |
| YouTube | `https://youtu.be/dQw4w9WgXcQ` (embedded via youtube-nocookie.com) |
| MP4 | `https://cdn.example.com/film.mp4` |
| HLS | `https://cdn.example.com/film/master.m3u8`, plus optional `videoFallback = ".../film.mp4"` |

**Hover trailer (optional):** put a short muted clip next to the still, with the same name and a `.mp4` extension (`static/images/gallery/my-film.mp4`).

### About: `content/about.md`

The first paragraph becomes the large statement. A bullet list becomes numbered principles:

```markdown
---
title: About
build: { render: never, list: never }
---

We're small on purpose. No bloated production, no wasted time.

More about how you work…

- **Lean + capable.** A small team and just enough gear to move fast.
- **Built to flex.** Same story, shaped for wherever it needs to live.
```

## Customize

1. **Config first:** colors, fonts, copy and sections all come from `params`.
2. **Extra CSS:** set `params.customCSS: true` and add `assets/css/custom.css` to your site. It loads after the theme's CSS.
3. **Self-host fonts:** override `layouts/partials/fonts.html` in your site with your own `@font-face` rules.
4. **Translate:** copy `i18n/en.toml` into your site's `i18n/<lang>.toml`.

Check contrast when changing colors: the accent is meant for small marks on the dark ground, not body text.

## Credits

- Descends from [Osprey](https://github.com/tomanistor/osprey) by Toma Nistor, by way of [scrappie-osprey](https://github.com/jeradsloan/scrappie-osprey). Rewritten for modern browsers and Hugo.
- [Video.js](https://videojs.com/) 8 (Apache-2.0), vendored.
- Default fonts: [Instrument Serif and Instrument Sans](https://fonts.google.com/?query=instrument) (OFL).

## License

[Apache-2.0](LICENSE)
