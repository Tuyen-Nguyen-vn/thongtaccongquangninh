---
version: alpha
name: TTCQN Service Operations
colors:
  primary: "#36B757"
  primaryHover: "#168B39"
  primaryBright: "#7ED957"
  secondary: "#0B6FD3"
  secondaryHover: "#0757BA"
  accent: "#F5B301"
  warning: "#FF7A00"
  info: "#00B8D9"
  error: "#C62828"
  success: "#168A3A"
  background: "#F7FCFF"
  surface: "#FFFFFF"
  surfaceMuted: "#EEF8FF"
  border: "#D9E6EF"
  textPrimary: "#102A43"
  textSecondary: "#243B53"
  textMuted: "#52606D"
  onDark: "#F8FAFC"
  onDarkMuted: "#D8E8F4"
  dark: "#03111F"
  darkSecondary: "#020D17"
  darkTertiary: "#061827"
typography:
  display:
    fontFamily: "Segoe UI, Roboto, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "46px"
    fontWeight: 800
    lineHeight: 1.15
  section-title:
    fontFamily: "Segoe UI, Roboto, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Segoe UI, Roboto, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Segoe UI, Roboto, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "2px"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  sectionY: "60px"
shadows:
  soft: "0 16px 40px rgba(15,76,129,.10)"
  card: "0 18px 44px rgba(15,76,129,.12)"
components:
  buttonPrimary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.pill}"
    padding: "16px 35px"
  buttonEmergency:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "16px 35px"
  buttonSecondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "16px 35px"
  hoverOnDark:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.primaryBright}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  secondaryHoverState:
    backgroundColor: "{colors.secondaryHover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  primaryHoverOnBlack:
    backgroundColor: "#000000"
    textColor: "{colors.primaryHover}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  serviceCard:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  mutedPanel:
    backgroundColor: "{colors.surfaceMuted}"
    textColor: "{colors.textSecondary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  borderSample:
    backgroundColor: "{colors.border}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
  mutedTextOnLight:
    backgroundColor: "{colors.background}"
    textColor: "{colors.textMuted}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
  accentBadge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  warningBadge:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  infoPanel:
    backgroundColor: "{colors.info}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  successOnDark:
    backgroundColor: "#000000"
    textColor: "{colors.success}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  darkSection:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.onDark}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  darkSectionMuted:
    backgroundColor: "{colors.darkSecondary}"
    textColor: "{colors.onDarkMuted}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  darkTertiaryPanel:
    backgroundColor: "{colors.darkTertiary}"
    textColor: "{colors.onDark}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
---

## Overview

TTCQN is a local emergency service brand for environmental sanitation work in Quang Ninh. This file follows the Google Labs `DESIGN.md` alpha format so coding agents have one stable source of truth for UI decisions. The interface should feel fast, practical, and trustworthy: clear service information, obvious phone actions, visible local coverage, and direct proof of real work.

The visual system combines environmental green, service blue, and emergency amber/red. Green communicates clean handling and completion. Blue supports professional service structure and local reliability. Amber/red is reserved for urgent call-to-action moments, warnings, and hotline emphasis.

## Colors

Use `primary` green for service confidence, completion states, and secondary phone actions. Use `secondary` blue for headings, links, informational UI, and structured service cards. Use `accent` and `warning` sparingly for urgency, price highlights, badges, and active attention points. Use `error` only for emergency call buttons or true warnings. Use `success` for confirmed completion states only.

Dark surfaces should use `dark`, `darkSecondary`, and `darkTertiary` with `primaryBright` highlights. Dark text must use `onDark` or `onDarkMuted`. Light surfaces should use `background`, `surface`, and `surfaceMuted`; text must stay on `textPrimary`, `textSecondary`, or `textMuted` rather than ad hoc grays.

## Typography

Use the system sans stack already present in the renderer. Headings should be heavy and compact, but not decorative. Body text should prioritize scan speed for mobile users trying to call, compare services, or verify service areas.

Avoid negative letter spacing. Use uppercase label text only for short section kickers, service badges, or operational status labels.

## Layout

The first screen must make the brand, emergency service, and hotline obvious. Keep action buttons close to service claims. Service pages and homepage sections should use dense but readable blocks rather than marketing-only hero layouts.

Cards should represent real repeated entities: services, areas, proof items, prices, or process steps. Do not nest cards inside other cards. Use full-width sections for major page areas and keep content width constrained around 1200px.

## Components

Primary call buttons use green gradients for normal action and red/orange gradients only for urgent hotline action. Buttons should remain large enough for mobile tapping and should not depend on long text to communicate the action. For normal-size generated controls, prefer dark text on pure `primary`; the live homepage uses white text only on large, bold CTA buttons and gradient treatment.

Service cards use white surfaces, blue headings, muted body text, border color from `border`, and a green or blue hover accent. Area cards can use per-area accent colors, but they should still reference the shared TTCQN tokens instead of hard-coded one-off colors. Card shadows should stay close to `shadows.soft` or `shadows.card`.

Footer and dark operating sections should stay close to the shared `darkSection` component token: dark navy surface, white primary text, muted blue-gray support text, and green highlights for phone/contact emphasis. Do not introduce a separate footer palette unless `ttcqn-shared-footer.css` is updated at the same time.

## Agent Usage

When an AI coding agent changes UI color, typography, spacing, button treatment, cards, hero, footer, or homepage visual hierarchy, it must read this file before editing implementation files. Keep the token names aligned with the CSS variables in the renderer:

- `colors.primary` maps to `--ttcqn-color-primary`.
- `colors.secondary` maps to `--ttcqn-color-secondary`.
- `colors.accent`, `colors.warning`, and `colors.error` map to urgent CTA and price/status treatments.
- `colors.dark`, `colors.darkSecondary`, and `colors.darkTertiary` map to hero, nav, area, and footer backgrounds.
- `components.buttonPrimary`, `components.buttonEmergency`, `components.serviceCard`, and `components.darkSection` define the expected repeated UI patterns.

## Imagery

Prefer real service images, branded vehicles, local Quang Ninh scenes, maps, team photos, and field-work evidence. Avoid generic stock-style images when the user needs to judge trust or locality. Image captions and alt text should describe the actual service, place, and business context.

## Accessibility

Maintain strong contrast on dark hero and footer sections. Text over image backgrounds needs a dark overlay. Call buttons must have clear text labels and accessible `aria-label` values when icons are used. Never rely on color alone to communicate emergency or status.

## Implementation Notes

The current renderer implementation source is `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-home.min.css`, with shared footer styles in `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-shared-footer.css`. Their `--ttcqn-color-*` variables should stay aligned with this DESIGN.md file. When changing UI color, typography, spacing, or component patterns, update DESIGN.md first or in the same commit.

Validate this file with:

```bash
npm run design:lint
```

Export tokens for other tools with:

```bash
npx @google/design.md export --format css-tailwind DESIGN.md
npx @google/design.md export --format dtcg DESIGN.md
```
