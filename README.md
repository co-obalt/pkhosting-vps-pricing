# PKHosting VPS Pricing Page

This is a single-page responsive pricing calculator built for PKHosting's VPS lineup as part of the TechAbout assessment. It runs on plain HTML, CSS, and JS with zero external assets or build steps.

## How to test it locally
You don't need any server to run this. Just open index.html straight into your browser. If you prefer a local server, you can use:
- python -m http.server 8000
- npx serve .

## Key Details
- Prices start at Rs 2,400 up to Rs 19,500.
- Annual discount uses the exact formula (Monthly * 10) / 12, calculated via JS.
- Default PKR rates are baked directly into the raw HTML so it works even if JS is disabled.
- Currency switcher (USD/GBP) and billing toggle save state in localStorage.
- Responsive layout tested down to 360px and up to 1440px on Chrome and Firefox.

## What I'd add next
If taking this to production, I'd connect the plan buttons straight into WHMCS checkout links with pre-selected billing cycles and add a datacenter location picker (Karachi / Islamabad).

## AI Assistance
Used AI tools to quickly generate initial HTML boilerplate and test WCAG contrast values. Logic, styling tweaks, and test checks were done manually.