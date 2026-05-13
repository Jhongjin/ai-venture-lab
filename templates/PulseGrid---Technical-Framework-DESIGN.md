---
version: "alpha"
name: "PulseGrid - Technical Framework"
description: "Pulsegrid Technical Dashboard Section is designed for demonstrating application workflows and interface hierarchy. Key features include clear information density, modular panels, and interface rhythm. It is suitable for product showcases, admin panels, and analytics experiences."
colors:
  primary: "#FF0B0B"
  secondary: "#000000"
  tertiary: "#FFB915"
  neutral: "#000000"
  background: "#000000"
  surface: "#FF0B0B"
  text-primary: "#FFFFFF"
  text-secondary: "#A3A3A3"
  border: "#FFFFFF"
  accent: "#FF0B0B"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "72px"
    fontWeight: 300
    lineHeight: "72px"
    letterSpacing: "-0.05em"
  body-md:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: "16px"
  label-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
rounded:
  md: "2px"
spacing:
  base: "4px"
  sm: "4px"
  md: "5.6px"
  lg: "11.2px"
  xl: "16px"
  gap: "11.2px"
  card-padding: "14px"
  section-padding: "44.8px"
components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "5.6px"
  button-secondary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "5.6px"
  button-link:
    textColor: "{colors.text-secondary}"
    rounded: "0px"
    padding: "0px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Bounded
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses dark mode with #FF0B0B as the main accent and #000000 as the neutral foundation.

- **Primary (#FF0B0B):** Main accent and emphasis color.
- **Secondary (#000000):** Supporting accent for secondary emphasis.
- **Tertiary (#FFB915):** Reserved accent for supporting contrast moments.
- **Neutral (#000000):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #000000; Surface: #FF0B0B; Text Primary: #FFFFFF; Text Secondary: #A3A3A3; Border: #FFFFFF; Accent: #FF0B0B

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 72px, weight 300, line-height 72px, letter-spacing -0.05em.
- **Body (`body-md`):** Inter, 12px, weight 300, line-height 16px.
- **Labels (`label-md`):** Inter, 14px, weight 500, line-height 20px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, bounded structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / bounded composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Bounded
- **Base unit:** 4px
- **Scale:** 4px, 5.6px, 11.2px, 16px, 16.8px, 22.4px, 32px, 33.6px
- **Section padding:** 44.8px, 70.4px
- **Card padding:** 14px, 44.8px
- **Gaps:** 11.2px, 16.8px, 22.4px, 33.6px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.91px #FFFFFF; 0.91px #FF0B0B
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 11, 11, 0.2) 0px 0px 10px 0px; rgba(255, 11, 11, 0.8) 0px 0px 8px 0px; rgba(255, 11, 11, 0.3) 0px 0px 10px 0px
- **Blur:** 12px, 4px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 0px padding and a 0px radius. Drive the shell with linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 2px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 2px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles.

### Buttons
- **Primary:** background #FFFFFF, text #000000, radius 2px, padding 5.6px, border 0px solid rgb(229, 231, 235).
- **Secondary:** background #FFFFFF, text #FFFFFF, radius 2px, padding 5.6px, border 0.909091px solid rgba(255, 255, 255, 0.1).
- **Links:** text #A3A3A3, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 2px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 200ms and 300ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and color changes. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 200ms, 300ms, 150ms, 2000ms

**Easings:** ease, cubic-bezier(0.4, 0, 1), 0.2, 0.6

**Hover Patterns:** text, color

**Scroll Patterns:** gsap-scrolltrigger

## WebGL

Reconstruct the graphics as a full-bleed background field using webgl, renderer, alpha, dpr clamp, custom shaders. The effect should read as technical, meditative, and atmospheric: dot-matrix particle field with black and sparse spacing. Build it from dot particles + soft depth fade so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** ThreeJS, WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field
  - **Effect:**
    - **Value:** Dot-matrix particle field
  - **Primitives:**
    - **Value:** Dot particles + soft depth fade
  - **Motion:**
    - **Value:** Slow breathing pulse
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** WebGL, Renderer, alpha, DPR clamp, custom shaders

**Techniques:** Dot matrix, Breathing pulse, Pointer parallax, Shader gradients, Noise fields

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <canvas width="1669" height="1508" style="display: block; width: 1518px; height: 1371px;"></canvas>
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      // WebGL Three.js Stepped Columns & Grain Shader setup
      const initWebGLBackground = () => {
          const container = document.getElementById('webgl-bg');
          if (!container || typeof THREE === 'undefined') return;

          const scene = new THREE.Scene();
          const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      …
      ```
  - **Renderer setup:**
    - **Language:** js
    - **Snippet:**
      ```
      if (!container || typeof THREE === 'undefined') return;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const handleResize = () => {
      …
      ```
  - **Scene setup:**
    - **Language:** js
    - **Snippet:**
      ```
      // WebGL Three.js Stepped Columns & Grain Shader setup
      const initWebGLBackground = () => {
          const container = document.getElementById('webgl-bg');
          if (!container || typeof THREE === 'undefined') return;
      ```

## ThreeJS

Reconstruct the Three.js layer as a full-bleed background field with layered spatial depth that feels technical. Use alpha, dpr clamp renderer settings, orthographic projection, plane geometry, shadermaterial materials, and ambient + key + rim lighting. Motion should read as slow orbital drift, with poster frame + dom fallback.

**Id:** threejs

**Label:** ThreeJS

**Stack:** ThreeJS, WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field with layered spatial depth
  - **Render:**
    - **Value:** alpha, DPR clamp
  - **Camera:**
    - **Value:** Orthographic projection
  - **Lighting:**
    - **Value:** ambient + key + rim
  - **Materials:**
    - **Value:** ShaderMaterial
  - **Geometry:**
    - **Value:** plane
  - **Motion:**
    - **Value:** Slow orbital drift

**Techniques:** Shader materials, Timeline beats, alpha, DPR clamp, Poster frame + DOM fallback

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <canvas width="1669" height="1508" style="display: block; width: 1518px; height: 1371px;"></canvas>
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      // WebGL Three.js Stepped Columns & Grain Shader setup
      const initWebGLBackground = () => {
          const container = document.getElementById('webgl-bg');
          if (!container || typeof THREE === 'undefined') return;

          const scene = new THREE.Scene();
          const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      …
      ```
  - **Renderer setup:**
    - **Language:** js
    - **Snippet:**
      ```
      if (!container || typeof THREE === 'undefined') return;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const handleResize = () => {
      …
      ```
  - **Scene setup:**
    - **Language:** js
    - **Snippet:**
      ```
      // WebGL Three.js Stepped Columns & Grain Shader setup
      const initWebGLBackground = () => {
          const container = document.getElementById('webgl-bg');
          if (!container || typeof THREE === 'undefined') return;
      ```
