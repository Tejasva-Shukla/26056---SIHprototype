# APIx Prototype - SIH 2026, PS 26056

This prototype demonstrates the **Airfare Price Index (APIx) Base 2024 = 100**, an application for monitoring domestic passenger air travel inflation.

## Visual Styling and Design Tokens
A comprehensive UI overhaul was performed to align the application with the strict design tokens and light theme rules:
- **Theme:** Exclusively Light Theme (no dark mode). White / light grey surfaces (`#F6F8FB` page background, `#FFFFFF` cards).
- **Text:** Slate / dark text (`#0F172A` primary, `#64748B` muted).
- **Borders & Shadows:** Soft 1px borders (`#E3E8EF`), soft shadows (`shadow-sm`), 12px rounded corners (`rounded-xl`) on main cards, with consistent padding.
- **Base (P0) / Current (Pt):** Base is strictly Blue (`#2563EB`) and Current is Orange-red (`#EA580C`).
- **CV Bands:** Monopoly (Red), Shadow (Amber), Moderate (Teal), Healthy (Green), Price War (Purple).
- **Asymmetry & Heatmap:** Uses a continuous diverging Red-Green color scale (100 = solid Green, clamping at 150+ = deep Red).

## Features Implemented

### 1. Real-time Route Analysis Page (`/route-analysis`)
- **KPI Row:**
  - Fully styled cards with 3-4px colored top borders corresponding to their metrics.
  - Route Index (Blue), Market Health (colored by CV band), Festival (Amber), Asymmetry (Orange).
  - Addressed text collisions in the Directional Asymmetry card and implemented a horizontal split bar and window chips for the Festival card.
- **Lead-Time Elasticity & Dynamic Pricing Curve:**
  - Implemented correct Base/Current colors (Blue vs Orange-red).
  - Added a soft filled shaded region between the P0 and Pt curves (`rgba(234, 88, 12, 0.12)`).
  - Gap badges (+xx%) placed above curve points, dynamically colored Green (low), Amber (moderate >10%), or Red (high >25%).
  - Clickable inspection window chips (T+45 to T+1) placed below the chart.
  - Legend forced to a single line with appropriate swatches (line and area swatches).
- **Festival Demand Share:**
  - Reads from a new configurable constant `DEMO_FESTIVAL_SHARE_BY_WINDOW` with plausible non-zero values for routes.
  - Includes a zero-state UI ("No festival overlap for this travel date").
  - Includes an active-window big percentage display, colored by severity, and small chips for all booking windows.
- **Directional Price Asymmetry & Heatmap:**
  - Implemented the continuous diverging Red-Green scale (Cheaper leg = 100.0 baseline, max clamps at 150).
  - Finer interpolated strip (45 days) showing continuous heatmap between anchor windows.
  - Asymmetry Index row computing the outbound/inbound ratio with a dynamically updating severity chip and plain-language summary.
- **Route Competition Analysis:**
  - **CV Hero Block:** Replaced text descriptions with a 220px Semicircular SVG Gauge plotting the CV. Includes bands for Monopoly (0%), Shadow (<2%), Moderate (2-5%), Healthy (5-15%), and Price War (>15%).
  - Highlighted the cheapest airline overall with a green background and a "Cheapest" tag.
  - Seat share bar inside the table.
  - Fixed the `&gt;` text rendering bug in the flight audit modal.
- **Intra-Day Statistics:**
  - Maintained for Tier 1 routes. Fixed the alert threshold label to live in the right margin on a dedicated layer, vertically centered, outside of all bars.
- **Data Freshness (Route Header):**
  - "Last updated" badge. Max expiry rules: T+1 (2 hrs), T+7 (12 hrs), T+15/30/45 (24 hrs). Shows a red dot and a (mocked) "Fetch live fares" button when expired, green dot when fresh.

### 2. National / State Indices Page (`/national-state`)
- **Hero Block:** Full-width hero section dominating the page, showing the national APIx composite score at a very large size (72-96px). Includes YoY badge and HCES item code tags.
- Three small summary cards placed appropriately.
- **Ranked State APIx:** Ranked horizontal bar chart comparing state APIx relative to the baseline.
- **State-wise Table:** Status pills indicating Elevated (Red-tinted), Watch (Amber-tinted), and Normal (Green-tinted) states. Sort functionality intact.

## Configurable Constants Added
The following constants were added to `src/data/mockData.js` to avoid magic numbers and make the dashboard easily configurable in production:
- `DEMO_FESTIVAL_SHARE_BY_WINDOW`: Maps routes to realistic demo arrays representing festival contribution per booking window.
- `FESTIVAL_MODERATE_THRESHOLD` & `FESTIVAL_HIGH_THRESHOLD`: Used for UI coloring in the Festival KPI Card.
- `GAP_MODERATE_THRESHOLD` & `GAP_HIGH_THRESHOLD`: Defined directly in `LeadTimeCurve.jsx` for gap badge coloring.
- `ROUTE_TIER_CONFIG`: Assigns Tier 1/Tier 2 configurations (already partially present, extended utility).
- `HEATMAP_CLAMP_MAX`: Constant (150) determining where the deep red of the heatmap scale caps out.
- `INTRADAY_ALERT_THRESHOLD`: 120 points default. Used to paint peak bars red when threshold is crossed.

## Changelog
- `mockData.js`: Added `DEMO_FESTIVAL_SHARE_BY_WINDOW` and `FESTIVAL_MODERATE_THRESHOLD`, updated `computeFestivalShare()` logic to use the demo constants as required.
- `RouteAnalysisPage.jsx`: Passed the `routeCode` prop to `<KpiCards />` to support routing festival data.
- `KpiCards.jsx`: Completely rewritten. Applied 12px rounded borders, padding, shadows, added top colored borders (Blue, band color, Amber, Orange). Built the horizontal split bar and chips.
- `LeadTimeCurve.jsx`: Rewritten chart `polygon` to support a fill between two paths. Fixed legends, changed markers. Added `+xx%` gap badges. Replaced text with 5 clickable active-window chips at the bottom.
- `CompetitionSection.jsx`: Completely rewritten. Replaced HTML segmented bar with an SVG `circle`-based Semicircular Gauge (using `strokeDasharray`). Mapped all 5 bands accurately. Styled cheapest flights. Fixed `>` bug in the audit modal.
- `DirectionalHeatmap.jsx`: Applied Light Theme tokens. Converted container to `rounded-xl p-5 shadow-sm`. Maintained the complex Continuous Color Scale functionality.
- `IntraDayStats.jsx`: Modified `chartPadRight` to 90px to reserve space for the Alert pill. Styled the outer card to match the `rounded-xl shadow-sm` tokens.
- `RouteHeader.jsx`: Changed the expired badge state to use `bg-red-50 text-red-800` and a red dot instead of an amber Clock icon.
- `NationalStatePage.jsx`: Wrapped the page in `bg-[#F6F8FB]`. Replaced `shadow-2xs` with `shadow-sm`, `p-4` with `p-5`, and `rounded-none` with `rounded-xl` across all cards. Created the large layout for the 72px National Composite Hero Block.

*(Note: "sih", "prototype", etc. have intentionally been kept out of the main UI elements to ensure a clean production look, while this README explicitly documents the scope of the prototype build).*
