---
version: "alpha"
name: "Analytics Dashboard - Soft UI"
description: "Analytics Dashboard UI Showcase Section is designed for demonstrating an application interface and hierarchy. Key features include dashboard-like visual hierarchy and dense but readable content organization. Built with custom CSS, it is suitable for product showcases and interface-first landing experiences."
colors:
  primary: "#34D399"
  secondary: "#FB923C"
  tertiary: "#C084FC"
  neutral: "#E0E5EC"
  background: "#E0E5EC"
  surface: "#34D399"
  text-primary: "#64748B"
  text-secondary: "#334155"
  accent: "#34D399"
typography:
  display-lg:
    fontFamily: "System Font"
    fontSize: "60px"
    fontWeight: 400
    lineHeight: "60px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "System Font"
    fontSize: "18px"
    fontWeight: 300
    lineHeight: "28px"
  label-md:
    fontFamily: "SFMono-Regular"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
spacing:
  base: "4px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  gap: "4px"
  card-padding: "32px"
  section-padding: "32px"
---

## Overview

- **Composition cues:**
  - Layout: Flex
  - Content Width: Full Bleed
  - Framing: Open
  - Grid: Minimal

## Colors

The color system uses light mode with #34D399 as the main accent and #E0E5EC as the neutral foundation.

- **Primary (#34D399):** Main accent and emphasis color.
- **Secondary (#FB923C):** Supporting accent for secondary emphasis.
- **Tertiary (#C084FC):** Reserved accent for supporting contrast moments.
- **Neutral (#E0E5EC):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #E0E5EC; Surface: #34D399; Text Primary: #64748B; Text Secondary: #334155; Accent: #34D399

## Typography

Typography pairs System Font for display hierarchy with SFMono-Regular for supporting content and interface copy.

- **Display (`display-lg`):** System Font, 60px, weight 400, line-height 60px, letter-spacing -0.025em.
- **Body (`body-md`):** System Font, 18px, weight 300, line-height 28px.
- **Labels (`label-md`):** SFMono-Regular, 12px, weight 400, line-height 16px.

## Layout

Layout follows a flex composition with reusable spacing tokens. Preserve the flex, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a flex / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Flex
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 80px, 119.09px
- **Section padding:** 32px, 64px, 104px
- **Card padding:** 32px
- **Gaps:** 4px, 6px, 8px, 32px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Shadows:** rgb(255, 255, 255) 0px 1px 0px 0px; rgb(163, 177, 198) 3px 3px 6px 0px inset, rgb(255, 255, 255) -3px -3px 6px 0px inset; rgba(255, 255, 255, 0.4) 2px 2px 4px 0px inset

## Shapes

Shapes rely on a tight radius system anchored by 20px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 20px, 32px, 9999px
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
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 20px, 32px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Easing favors ease. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** minimal

**Easings:** ease

**Scroll Patterns:** gsap-scrolltrigger
