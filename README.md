# PKHosting VPS Pricing Page

A lightweight, zero-dependency responsive pricing page built for PKHosting's VPS cloud lineup as part of the TechAbout web developer technical assessment.

Everything runs self-contained from plain HTML, CSS, and vanilla JS with zero external web requests (no Google Fonts, no CDN scripts, no hotlinked assets). The total asset weight is under 50 KB, well within the 300 KB limit.

---

## How to Run It Locally

You don't need any build steps, bundlers, or npm installations. Just clone the repo and open it:

1. **Directly in browser:**
   Double-click `index.html` or open `file:///path/to/test/index.html` in Chrome, Firefox, Edge, or Safari.

2. **Via local dev server (optional):**
   ```bash
   # Python
   python -m http.server 8000

   # or Node / npx
   npx serve .
   ```

---

## How It Works

- **Base Prices in HTML:** The Starter (Rs 2,400), Growth (Rs 4,800), Scale (Rs 9,600), and Dedicated Core (Rs 19,500) monthly PKR rates and the full 10-row specification table live directly in raw HTML. If JavaScript is turned off, the page still renders properly with zero layout shift or missing numbers.
- **Annual Billing Formula:** Evaluated strictly as `(Monthly Price * 10) / 12`. When toggled, Growth displays `Rs 4,000/mo` alongside the annual billed total and dynamically calculated savings badge.
- **Currency Conversion:** Hardcoded rates for USD (`278.50 PKR`) and GBP (`355.00 PKR`). PKR values round cleanly to whole numbers, while USD and GBP format with two decimal places.
- **State Retention:** Selections for both currency and billing cycle are saved in `localStorage`, so your view persists when reloading or returning later.
- **Accessibility:** Uses native HTML semantic elements (`<details>` / `<summary>` for FAQs, `<table tabindex="0">` with horizontal container scroll), visible `:focus-visible` outlines for keyboard users, and an `aria-live="polite"` region that announces price changes to screen readers.

---

## Browsers Tested

- **Google Chrome (v142+ / Windows 11):** Tested keyboard tabbing, localStorage retention across reloads, 200% zoom behavior, and responsive resizing down to 360px viewport.
- **Mozilla Firefox:** Verified that system fonts render cleanly without layout jitter, details/summary animation handles properly, and `:focus-visible` outlines render sharp.
- **Responsive Widths:** Validated at 360px (mobile), 768px (tablet 2-column grid), and 1440px (desktop 4-column layout) with zero body-level horizontal scrolling.

---

## What Could Be Improved Next

Given the 5-6 hour assessment timebox, I focused on bulletproof core logic, rock-solid accessibility, and responsive typography. If this was heading to production, here is what I would add next:

- **Configurable Slider Add-ons:** Sliders for extra NVMe disk storage, extra IPv4 addresses, and backup retention periods with real-time price recalculation.
- **Datacenter Region Selector:** A radio toggle allowing users to choose between Karachi (PKIX), Islamabad, Frankfurt, and Singapore datacenter routing.
- **Direct WHMCS / Checkout Handoff:** Pass the selected plan ID, currency, and billing term directly as URL parameters or a session payload to PKHosting's WHMCS billing system (`cart.php?a=add&pid=X&billingcycle=annually&currency=PKR`).
- **Smooth FAQ Transition Height:** While `<details>` works out of the box with zero JS, adding the modern CSS `interpolate-size: allow-keywords` or a brief grid height transition would make the accordion expansion feel even smoother.

---

## AI Disclosure

As requested in the assessment brief: I utilized an AI coding assistant (Google Antigravity / Gemini) during the development process to help scaffold initial boilerplates, double-check WCAG color contrast math, and quickly generate headless screenshot/Lighthouse execution scripts. All core formulas, responsive design structure, trade-off analysis, and code reviews were hands-on and verified directly.
