# PKHosting VPS Pricing Page

Static pricing page built for the PKHosting / TechAbout front-end technical assessment. Everything runs from plain HTML, CSS, and vanilla JavaScript with zero external dependencies, no web fonts, and no build step. Total weight across `index.html`, `style.css`, and `script.js` sits around 65 KB.

## Running it locally

Since everything is offline-ready, you can either double-click `index.html` directly in your browser or serve the folder over a quick local server:

```bash
python -m http.server 8000
```

Or with Node:

```bash
npx serve .
```

## Pricing, currencies, and accessibility details

Monthly PKR base prices (`Rs 2,400`, `Rs 4,800`, `Rs 9,600`, `Rs 19,500`) and the full 10-row comparison table are written straight into the HTML. Toggling to annual billing evaluates `(Monthly Price * 10) / 12` (so Growth drops from `Rs 4,800/mo` to `Rs 4,000/mo`), updates the annual billed total and savings badge, and mirrors the active monthly rate in the table footer. Currency conversion uses `1 USD = 278.50 PKR` and `1 GBP = 355.00 PKR`, keeping PKR in whole numbers and USD/GBP to two decimal places. Both selections persist in `localStorage`.

On the accessibility side, the billing and currency controls use semantic radio groups with arrow-key and Tab support, visible `:focus-visible` outlines, an `aria-live="polite"` region that announces updated Growth pricing when you switch options, native `<details>`/`<summary>` FAQ items, and text contrast kept above 4.5:1 across both light sections and the dark footer.

## Browsers and viewports checked

Tested locally in Google Chrome and Mozilla Firefox across `360px`, `768px`, and `1440px` viewports (plus `320px` as an extra narrow sanity check). The 4-column card row drops to 2x2 around tablet widths and stacks cleanly to 1 column on mobile, while the spec table scrolls inside its own wrapper with no page-level horizontal scroll.

## What I would add next

If this were moving into production for PKHosting, the natural next steps would be wiring the plan buttons directly into WHMCS cart URLs with the selected plan, billing cycle, and currency prefilled, adding a datacenter selector (Karachi vs Islamabad IXP), and letting buyers toggle add-ons like extra IPv4 addresses or automated snapshot storage.

## AI usage disclosure

As noted in the assessment instructions, I used an AI coding assistant during development to help speed up initial markup scaffolding, double-check WCAG contrast ratios, and run automated headless Chrome layout/DOM checks across viewports. I handled the pricing math verification, visual layout direction, copy edits, and final cross-browser checks myself.
