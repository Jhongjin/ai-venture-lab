# AI Venture Lab Redesign Brief

## Why we are resetting

The current product still reads like a refined version of the original dashboard:

- left navigation
- center content
- right operator/status rail

That is not enough. The target is not "prettier dashboard chrome". The target is a **single AI execution workspace** for one operator who moves from idea to validation to build to launch.

This redesign uses:

- `Unified Edge Content Section` as the primary visual and layout benchmark
- `taste-skill` as the discipline layer that prevents generic AI dashboard habits

## Product stance

This is **not** a team admin console first.
This is **not** a traditional BI dashboard.

This is:

- a solo-first AI execution workspace
- one active question at a time
- one primary section per stage
- side information only when it directly helps the current decision

Team collaboration remains optional and secondary.

## Core design principles

### 1. One dominant section per stage

Every stage must have a single dominant content block.

Bad:
- multiple equal-weight cards
- a dashboard of panels competing for attention

Good:
- one large primary section
- one compact helper column or footer band
- one next action

### 2. Open framing, not boxed dashboard clutter

We follow Unified Edge's "open / full-width / strong grid" behavior.

That means:

- fewer nested cards inside cards
- larger spans of negative space
- section-level grouping instead of overusing boxes
- only one or two elevated surfaces per viewport section

### 3. The left side is a flow rail, not a control center

The left rail exists only to answer:

- where am I?
- what is done?
- what is next?

It should not behave like a second dashboard.

### 4. The main canvas asks one question

At the top of every active stage:

- one question
- one AI summary
- one operator action

The user should understand the current task within 3 seconds.

### 5. AI-first, operator-confirmed

The system should prefill as much as possible.
Manual fields should only appear when:

- user judgment is needed
- the AI needs correction
- approval or override is needed

### 6. Avoid "AI app purple dashboard" clichés

We may use the Unified Edge palette, but layout decisions matter more than accent color.

We avoid:

- equal-width KPI strips as the main experience
- too many bright callouts
- giant sidebars with duplicated summaries
- card-on-card-on-card nesting

## Layout system

## Global page anatomy

1. Hero band
2. Flow rail + active workspace section
3. Stage content section
4. Minimal supporting section if needed

There should no longer be a permanent "right status board" competing with the main stage.

## Hero band

Purpose:

- identify the product
- show only the highest level metrics
- set mood and hierarchy

Rules:

- one dark hero shell
- one concise product statement
- 4 compact metrics max

## Flow rail

Purpose:

- show progress through the lifecycle

Rules:

- narrow
- vertical
- low information density
- no large explanatory cards unless absolutely needed
- collaboration option treated as optional utility, not top priority

## Active workspace shell

Purpose:

- display the current stage as a large open content section

Rules:

- left: stage identity and main question
- right: current AI summary and next action
- below: actual working surface

This section should feel like one large unit, not separate dashboard cards.

## Stage content grammar

Each stage should use the same content grammar:

1. Stage question
2. AI summary
3. Working surface
4. Decision/next action

Optional:

5. Supporting evidence

## Stage-specific mapping

### Idea finding

Primary focus:

- source material in
- AI recommendation out

Structure:

- left: source input
- right: recommended candidate
- bottom: comparison queue

Do not show:

- too many operator stats
- too many small diagnostic panels

### Idea intake

Primary focus:

- confirm or correct the AI draft

Structure:

- single main form surface
- "AI already filled this" messaging
- optional advanced fields collapsed

### Candidate selection

Primary focus:

- choose one item to advance

Structure:

- ranked list
- selected idea detail
- next action

No extra dashboard framing.

### Scoring / risk / experiment

Primary focus:

- one decision at a time

Structure:

- left: editable controls
- right: AI interpretation
- bottom: approval / next step

### Build / launch / learning

Primary focus:

- operational readiness

Structure:

- top summary band
- one main checklist or execution surface
- hidden technical details by default

Developer handoff must never dominate the primary screen.

## Visual system

### Palette

Use Unified Edge palette with restraint:

- background: near-black
- accent: lilac
- surface accents: soft lilac / soft white
- text: white / slate neutrals

Do not let accent become constant noise.

### Type hierarchy

- stage question: large and decisive
- stage label / eyebrow: small uppercase
- body: calm, readable, lower contrast

We avoid:

- too many large headings
- repeated section titles saying the same thing

### Shapes

- large surfaces: 20-24px radius
- controls: 14-18px radius
- pills only for filters / labels

### Cards

Cards are used only for:

- true hierarchy
- action grouping
- recommended candidate emphasis

Not for every single piece of information.

## Behavioral rules

### Default mode

The interface defaults to:

- AI-generated content visible
- advanced controls hidden
- one next action visible

### Advanced mode

Advanced diagnostics may exist, but must be collapsed by default.

### Empty state rule

Every empty state must explain:

- what goes here
- what the AI will do next
- what the operator should do now

## What success looks like

A user should be able to answer these questions immediately:

1. What stage am I in?
2. What is the one thing I need to decide here?
3. What has AI already prepared for me?
4. What happens if I click next?

If any screen fails these four tests, it is not finished.

## Immediate implementation priorities

1. Remove the permanent right dashboard feel from the shell
2. Reduce the flow rail to progress only
3. Make the active stage header one unified section
4. Rebuild idea finding to match the stage grammar
5. Apply the same grammar to intake, selection, and scoring
