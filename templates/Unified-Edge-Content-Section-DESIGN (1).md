---
version: "alpha"
name: "Unified Edge Content Section"
description: "Unified Edge Content Section is designed for structuring key content in a full-width page block. Key features include clear structure, reusable styling patterns, and production-ready layout behavior. Built with custom CSS, it is suitable for component libraries and responsive web projects. It includes animated visual treatment for stronger visual hierarchy. Interaction states are designed for practical user flows."
colors:
  primary: "#BBA6FF"
  secondary: "#A855F7"
  tertiary: "#FAB0FF"
  neutral: "#0A0A0A"
  background: "#0A0A0A"
  surface: "#BBA6FF"
  text-primary: "#FFFFFF"
  text-secondary: "#A3A3A3"
  accent: "#BBA6FF"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "60px"
    fontWeight: 600
    lineHeight: "60px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
spacing:
  sm: "1px"
  md: "48px"
  gap: "24px"
  card-padding: "48px"
  section-padding: "48px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Open
  - Grid: Strong

## Colors

The color system uses dark mode with #BBA6FF as the main accent and #0A0A0A as the neutral foundation.

- **Primary (#BBA6FF):** Main accent and emphasis color.
- **Secondary (#A855F7):** Supporting accent for secondary emphasis.
- **Tertiary (#FAB0FF):** Reserved accent for supporting contrast moments.
- **Neutral (#0A0A0A):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #0A0A0A; Surface: #BBA6FF; Text Primary: #FFFFFF; Text Secondary: #A3A3A3; Accent: #BBA6FF

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 60px, weight 600, line-height 60px, letter-spacing -0.025em.
- **Body (`body-md`):** Inter, 16px, weight 400, line-height 24px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Scale:** 1px, 48px
- **Section padding:** 48px
- **Card padding:** 48px
- **Gaps:** 24px, 32px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 25px 50px -12px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(88, 28, 135, 0.1) 0px 25px 50px -12px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 16px radius. Drive the shell with linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 16px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 16px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Component styling should inherit the shared button, icon, spacing, and surface rules instead of inventing one-off treatments. Favor a small family of repeatable patterns for actions, content containers, and fields.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 16px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Easing favors ease.

**Motion Level:** minimal

**Easings:** ease
