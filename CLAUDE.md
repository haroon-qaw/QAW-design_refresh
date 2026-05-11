# QAW Design Refresh

## Project Overview
Single-file HTML prototype for QA Wolf's design refresh, branded for Burger King. No build tools, no framework — vanilla HTML/CSS/JS in a single file.

## Files
- `index.html` — the entire app (HTML + CSS + JS)
- `wolfrun.gif` — wolf running animation used in the chat sidebar
- `.claude/launch.json` — launches a Python HTTP server on port 3400

## Local Development
```
python -m http.server 3400
```
Then open `http://localhost:3400/index.html`

> **Note:** YouTube embeds only work from `http://localhost:3400` or the live GitHub Pages URL — not from `file://`.

## Live URL
`https://haroon-qaw.github.io/QAW-design_refresh/`

## Repo
`https://github.com/haroon-qaw/QAW-design_refresh.git`
Local clone: `C:\Users\Haroon\Desktop\QAW-design_refresh`

## Reference Design
Paper design file: `https://app.paper.design/file/01KQYY4CTXH6HY792P61MEC71P`

## Tech Notes
- **Font:** Inter Tight
- **Sidebar width:** controlled by `--sidebar-width` CSS variable, updated via `updateSidebarVar()` in JS whenever the panel resizes or opens/closes
- **Sidebar max width:** 600px (`const maxWidth = 600`)
- **Sidebar min width:** 200px (`const minWidth = 200`)
- **Batch bar** uses `left: var(--sidebar-width)` — always set `--sidebar-width` directly (not via `offsetWidth`) when expanding programmatically to avoid transition timing issues

## Key Features
- **Burger King branding** — BK SVG logo in nav, "Burger King" throughout
- **Map New Flows sequence** — clicking the primary button triggers: user bubble → wolf → AI message → wolf → browser placeholder (YouTube, animated gradient border) + sidebar expands to max width → final AI message → wolf stays visible
- **Animated gradient border** on video uses `conic-gradient` + `@property --border-angle`, colors: `#3B3BEF`, `#4DFFDE`, `#FFB8F5`, `#D7FF33`
- **Chat** — messages left-aligned, pinned to bottom, scroll upward; Enter to send; 5 rotating AI responses cycle on each message; env blocks fade out on first message
- **Wolf GIF** — 16px tall, shown during AI "thinking", stays visible after last message
- **Toolbar** — icons wrap to next line on narrow viewports; right buttons top-aligned

## Branding Colors
- `#3B3BEF` — blue
- `#4DFFDE` — cyan
- `#FFB8F5` — pink
- `#D7FF33` — yellow-green
