---
version: "alpha"
name: "Agentic Workspace"
description: "Agentic Workspace Dashboard Section is designed for demonstrating application workflows and interface hierarchy. Key features include clear information density, modular panels, and interface rhythm. It is suitable for product showcases, admin panels, and analytics experiences."
colors:
  primary: "#60A5FA"
  secondary: "#3B82F6"
  tertiary: "#34D399"
  neutral: "#525252"
  background: "#FFFFFF"
  surface: "#000000"
  text-primary: "#525252"
  text-secondary: "#A3A3A3"
  border: "#000000"
  accent: "#60A5FA"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: "48px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: "26px"
  label-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
rounded:
  md: "4px"
spacing:
  base: "4px"
  sm: "4px"
  md: "6px"
  lg: "6.21px"
  xl: "8px"
  gap: "4px"
  card-padding: "8px"
  section-padding: "24px"
components:
  button-primary:
    backgroundColor: "#F5F5F5"
    textColor: "#171717"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "6px"
  button-link:
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "6px"
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "16px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses light mode with #60A5FA as the main accent and #525252 as the neutral foundation.

- **Primary (#60A5FA):** Main accent and emphasis color.
- **Secondary (#3B82F6):** Supporting accent for secondary emphasis.
- **Tertiary (#34D399):** Reserved accent for supporting contrast moments.
- **Neutral (#525252):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #000000; Text Primary: #525252; Text Secondary: #A3A3A3; Border: #000000; Accent: #60A5FA

- **Gradients:** bg-gradient-to-r from-blue-50/50 to-transparent, bg-gradient-to-t from-black/60 to-transparent, bg-gradient-to-tr from-blue-400 to-purple-400

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 48px, weight 400, line-height 48px, letter-spacing -0.025em.
- **Body (`body-md`):** Inter, 16px, weight 300, line-height 26px.
- **Labels (`label-md`):** Inter, 14px, weight 400, line-height 20px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 4px, 6px, 6.21px, 8px, 10px, 12px, 16px, 24px
- **Section padding:** 24px, 88px
- **Card padding:** 8px, 16px, 24px
- **Gaps:** 4px, 8px, 12px, 16px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.91px #000000; 1.82px #60A5FA; 0.91px #D4D4D4; 0.91px #FFFFFF
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px; rgba(0, 0, 0, 0.3) 0px 1px 1px 0px inset, rgba(255, 255, 255, 0.5) 0px 1px 0px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 2px 4px 0px inset
- **Blur:** 4px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 6px padding and a 0px radius. Drive the shell with linear-gradient(to right, rgba(239, 246, 255, 0.5), rgba(0, 0, 0, 0)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 4px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 4px, 8px, 12px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #F5F5F5, text #171717, radius 4px, padding 6px, border 0px solid rgb(229, 231, 235).
- **Links:** text #525252, radius 4px, padding 6px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** background #FFFFFF, border 0.909091px solid rgba(0, 0, 0, 0.05), radius 4px, padding 16px, shadow none.
- **Card surface:** background #E2DDD3, border 0.909091px solid rgba(255, 255, 255, 0.5), radius 12px 12px 6px 6px, padding 12px, shadow rgba(0, 0, 0, 0.1) 0px 20px 40px -10px, rgba(255, 255, 255, 0.9) 0px 2px 6px 0px inset, rgba(0, 0, 0, 0.05) 0px -4px 10px 0px inset.
- **Card surface:** background #1A1A1A, border 0px solid rgb(229, 231, 235), radius 12px, padding 8px, shadow rgba(0, 0, 0, 0.9) 0px 10px 20px 0px inset, rgba(255, 255, 255, 0.5) 0px 1px 0px 0px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 4px, 8px, 12px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 150ms and 1000ms. Easing favors ease and 0. Hover behavior focuses on color changes. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 150ms, 1000ms, 700ms, 500ms

**Easings:** ease, 0, 0.2, 1), cubic-bezier(0.4, cubic-bezier(0

**Hover Patterns:** color

**Scroll Patterns:** gsap-scrolltrigger
