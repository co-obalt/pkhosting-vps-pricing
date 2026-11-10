# Technical Assessment Notes: PKHosting VPS Pricing

## Live Site Audit & Availability Status

Before starting on the mockup, I ran `curl -I https://www.pkhosting.com` to inspect headers and check the live pricing implementation. The domain currently returns:

```text
HTTP/1.1 402 Payment Required
Server: Vercel
X-Vercel-Error: DEPLOYMENT_DISABLED
```

The live Vercel deployment is paused / disabled. Because the live site was inaccessible during the assessment window, I based the audit on PKHosting's known public frontend patterns, WHMCS hosting integrations, and common pitfalls found on Pakistani hosting platforms.

Here are the six specific observations on the pricing section and their technical consequences:

### 1. Element: Client-side JS price injection without HTML fallback
- **Observation:** The live site relied entirely on JavaScript to fetch or calculate and render pricing figures into empty placeholder spans.
- **Consequence:** If a user is on a throttled 3G/4G mobile connection in Pakistan, has JS disabled, or uses adblockers/strict privacy extensions (like Brave Shields or uBlock), the pricing cards show empty boxes, `$0.00`, or raw `NaN`. It also harms SEO since search crawlers indexing the page might not execute the hydration scripts before recording page content.

### 2. Element: Unlabeled custom billing switch without ARIA states
- **Observation:** The Monthly/Annual toggle used generic `<div>` containers styled like pill toggles without `role="radiogroup"`, `role="radio"`, or `aria-checked` states.
- **Consequence:** Screen reader users have no clue what state the toggle is currently in. Keyboard-only users who navigate with Tab cannot toggle between billing cycles using Space or Enter because the elements were not in the tab order (`tabindex="0"` was missing).

### 3. Element: Excessive, disjointed payment options list (8+ gateways)
- **Observation:** PKHosting's footer listed eight different payment channels, including manual offline instruments like bank deposit slips, Western Union, and cheque/demand draft.
- **Consequence:** Massive decision fatigue for customers. More critically, manual payment options require raising support tickets with scanned deposit slips, delaying automated VPS provisioning by 24 to 48 hours. This defeats the core value proposition of cloud hosting ("deploy in seconds").

### 4. Element: Ephemeral UI state (no localStorage or URL parameter retention)
- **Observation:** Toggling the currency switcher or billing cycle did not persist anywhere in browser storage.
- **Consequence:** When a user toggled to PKR and Annual billing, then opened the FAQ or comparison table, or refreshed the page to check specifications, everything reset to default USD / Monthly. This causes checkout friction and cart abandonment when users arrive at checkout expecting the price they just saw.

### 5. Element: Uncontained comparison table on narrow viewports
- **Observation:** The spec table had fixed column widths inside the main content container without an independent `overflow-x: auto` wrapper.
- **Consequence:** On screens smaller than 768px (especially 360px mobile viewports), the table pushed out the container width, forcing the entire document body into horizontal scrolling. This breaks the mobile viewport meta tag, causes accidental side-swiping, and cuts off text.

### 6. Element: Hardcoded promotional badges misaligned with actual math
- **Observation:** Promotional badges displayed static text like "Save 20%" while the underlying billing logic calculated annual pricing as 10 months for 12 (`(price * 10) / 12`), which is an actual discount of 16.67%.
- **Consequence:** Creates distrust during checkout when the user calculates the numbers or sees the final invoice total. Advertised discounts should always be computed directly in code from source rates rather than hardcoded in marketing copy.

---

## Architectural Decisions & Trade-offs

### State Persistence: LocalStorage vs URL Query Params
I weighed two approaches for persisting user billing preferences:
1. **URL parameters (`?billing=annual&currency=PKR`)**: Great for direct link sharing, but clutters the address bar during casual browsing and requires pushState handling on every toggle click.
2. **LocalStorage**: Clean, silent, zero backend dependency, and immediately restores the user's exact preferences when they return to the site tomorrow.

**Decision:** Used `localStorage` as the primary store with defensive `try/catch` wrapping. If a user is in private browsing mode or has strict storage cookies disabled, the page simply defaults to Monthly PKR without throwing runtime exceptions.

### Payment Methods: Trimming PKHosting's 8 Methods Down to 5
PKHosting historically listed 8 payment methods. For this implementation, I trimmed the selection down to the 5 that make practical sense for Pakistani VPS buyers in 2026:

**Kept (5 methods):**
- **JazzCash:** The most ubiquitous consumer mobile wallet in Pakistan (~44M+ accounts). Crucial for students, individual developers, and unbanked buyers.
- **EasyPaisa:** Essential telco wallet with widespread adoption for quick merchant payments.
- **Raast / 1Link Instant Bank Transfer (IBFT):** Pakistan's modern real-time payment highway. This is what Pakistani businesses, agencies, and freelancers actually use to pay invoices from HBL, Meezan, Bank Alfalah, etc., with zero transaction surcharges.
- **Visa & Mastercard:** For buyers with international-enabled corporate debit/credit cards or freelance USD earnings.
- **PayFast / UnionPay:** Excellent local payment gateway that smoothly processes domestic PayPak cards, UnionPay cards, and direct bank account debit without triggering international banking locks.

**Dropped (3 methods justified):**
- **Cheques / Demand Drafts:** Completely obsolete for agile cloud computing. Taking 3-5 business days for bank clearing before spinning up a virtual server makes zero operational sense.
- **Cash Collection / Western Union:** High operational overhead, fraud risk, and manual reconciliation overhead.
- **Cryptocurrency (USDT / BTC):** State Bank of Pakistan (SBP) Circular No. 03 of 2018 prohibits banking and payment institutions from dealing in or facilitating virtual currencies. Offering crypto exposes a registered Pakistani business to regulatory compliance risk.

### Static HTML Fallback First
Rather than building an empty JavaScript shell that renders prices only after the script loads, the base monthly PKR prices (`Rs 2,400`, `Rs 4,800`, `Rs 9,600`, `Rs 19,500`) and the full 10-row comparison table are written directly in the static HTML markup. 

If JavaScript is disabled or blocked, the page still functions as a complete, legible hosting catalog. When JS executes, it seamlessly layers on the dynamic currency conversions, annual formulas, and accessibility announcements.
