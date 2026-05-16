---
version: alpha
name: AI Venture Lab
description: A focused venture operations console for moving app ideas through evidence, planning, design, build, QA, security, and launch gates.
colors:
  primary: "#020617"
  accent: "#2563EB"
  success: "#059669"
  warning: "#D97706"
  danger: "#DC2626"
  surface: "#FFFFFF"
  canvas: "#F5F7FB"
  border: "#D9E2EF"
  muted: "#64748B"
  on-surface: "#0F172A"
typography:
  title:
    fontFamily: Geist Sans
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: 0
  section:
    fontFamily: Geist Sans
    fontSize: 20px
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: 0
  body:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  label:
    fontFamily: Geist Sans
    fontSize: 12px
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: 0.08em
rounded:
  sm: 4px
  md: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 12px
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
---

## Overview

AI Venture Lab should feel like an operations console for a careful venture studio: clear, dense, calm, and action-oriented. The interface is for repeat use by an operator who is screening ideas, collecting evidence, and pushing only qualified concepts toward build.

## Surface Roles

AI Venture Lab has three deliberately different surfaces:

- `/` is the public landing surface. It should feel editorial, digital, and execution-oriented. The first screen sells the product's operating philosophy, not a feature manual. Use asymmetric grids, signal diagrams, artifact lanes, and restrained motion cues. Avoid repeated equal cards, long explanatory blocks, chatbot tropes, and generic AI gradients.
- `/workspace` is the operator console. It should stay compact, scan-friendly, and task-first: left step menu, right task surface, one visible next action, and clear empty/loading/error/success states. Do not make this route feel like a marketing page.
- `/guide` is the reference bridge. It can be more document-like than the landing page, but it should stay concise and navigational. It explains the workflow only enough to move the operator into the board.

## Product Philosophy

The core promise is: AI prepares the work, the operator makes the judgment, and the decision trail remains usable. Design should repeatedly show that loop: raw idea -> candidate -> validation -> execution package -> launch decision -> learning. The interface should never imply that AI replaces judgment, hides risk, or turns evidence into decoration.

The visual language should feel like a venture operations room rather than a general AI tool. Prefer signal fields, ledgers, artifact libraries, route maps, and decision gates. Avoid feature-card walls, generic SaaS benefit grids, overly friendly mascots, and copy that sounds like a brochure.

## Colors

Use high-contrast neutrals for most of the interface. Reserve blue for the active step, focused controls, and guided next actions. Use green only for completion or safe status, amber for unresolved caution, and red for blocking risk.

## Typography

Use compact, readable type. Headings identify the current task, not marketing claims. Labels should be short and stable because operators scan forms repeatedly.

## Layout

Prefer a left-hand step menu and a right-hand task surface. Avoid long pages that force users to scroll back and forth between navigation and input. Keep repeated records in lists, and keep the active form near the selected record.

For the landing page only, long scroll is acceptable when it behaves like an editorial product story. Each section needs a distinct rhythm and job: first impression, workflow proof, best-fit qualification, artifact outcome, and handoff into the board. Do not reuse the same card density from section to section.

## Elevation & Depth

Use borders and subtle shadows to separate task surfaces. Do not nest cards inside decorative cards. Use depth only to distinguish active work, modal surfaces, or repeated records.

## Shapes

Use 4px to 8px radii. The product should feel precise and operational rather than playful or promotional.

## Components

Buttons should use icons for common actions when available. Inputs need persistent labels, helper text where the field can be ambiguous, and plain-language errors. Tabs and segmented controls should have stable dimensions so content changes do not shift the layout.

## Do's and Don'ts

- Do keep one primary action per task surface.
- Do show saved, loading, blocked, and read-only states.
- Do make ownership, workspace, and permission boundaries visible.
- Do keep mobile forms single-column and readable.
- Do let the landing page be visually memorable when it routes clearly into the actual workspace.
- Don't make the workspace route promotional.
- Don't hide the current step or next recommended action.
- Don't ask for sensitive data before explaining why it is needed.
