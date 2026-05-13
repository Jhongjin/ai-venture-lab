---
version: "alpha"
name: "Dimensional UI Framework"
description: "Dimensional Framework Login Section is designed for authenticating users through a focused access flow. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for authentication screens in web products."
colors:
  primary: "#06B6D4"
  secondary: "#22D3EE"
  tertiary: "#8B5CF6"
  neutral: "#09090B"
  background: "#18181B"
  surface: "#FFFFFF"
  text-primary: "#09090B"
  text-secondary: "#FFFFFF"
  border: "#06B6D4"
  accent: "#06B6D4"
typography:
  display-lg:
    fontFamily: "System Font"
    fontSize: "128px"
    fontWeight: 600
    lineHeight: "128px"
    letterSpacing: "-0.025em"
    textTransform: "uppercase"
  body-md:
    fontFamily: "System Font"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22.75px"
  label-md:
    fontFamily: "System Font"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
rounded:
  md: "0px"
  full: "9999px"
spacing:
  base: "4px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  gap: "8px"
  card-padding: "32px"
  section-padding: "32px"
components:
  button-primary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px"
  button-link:
    textColor: "#D4D4D8"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "0px"
  card:
    rounded: "16px"
    padding: "32px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses light mode with #06B6D4 as the main accent and #09090B as the neutral foundation.

- **Primary (#06B6D4):** Main accent and emphasis color.
- **Secondary (#22D3EE):** Supporting accent for secondary emphasis.
- **Tertiary (#8B5CF6):** Reserved accent for supporting contrast moments.
- **Neutral (#09090B):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #18181B; Surface: #FFFFFF; Text Primary: #09090B; Text Secondary: #FFFFFF; Border: #06B6D4; Accent: #06B6D4

## Typography

Typography relies on System Font across display, body, and utility text.

- **Display (`display-lg`):** System Font, 128px, weight 600, line-height 128px, letter-spacing -0.025em, uppercase.
- **Body (`body-md`):** System Font, 14px, weight 400, line-height 22.75px.
- **Labels (`label-md`):** System Font, 14px, weight 500, line-height 20px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px
- **Section padding:** 32px, 48px, 80px, 96px
- **Card padding:** 32px
- **Gaps:** 8px, 16px, 24px, 32px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.91px #FFFFFF; 0.91px #06B6D4; 0.91px #8B5CF6; 0.91px #3B82F6
- **Shadows:** rgba(56, 189, 248, 0.9) 0px 0px 10px 0px
- **Blur:** 12px

## Shapes

Shapes rely on a tight radius system anchored by 16px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 16px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #FFFFFF, text #09090B, radius 9999px, padding 8px, border 0px solid rgb(229, 231, 235).
- **Secondary:** background #FFFFFF, text #FFFFFF, radius 9999px, padding 12px, border 0.909091px solid rgba(255, 255, 255, 0.1).
- **Links:** text #D4D4D8, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** background rgba(24, 24, 27, 0.5), border 0.909091px solid rgba(255, 255, 255, 0.05), radius 16px, padding 32px, shadow none.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 16px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 200ms and 300ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and stroke changes. Scroll choreography uses Parallax for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 200ms, 300ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** text, stroke, color, transform

**Scroll Patterns:** parallax
