# ResearchGap Frontend Style Guide

## Purpose

This document defines the **visual design and frontend styling conventions** for ResearchGap.

The existing ResearchGap interface is used as a visual reference, particularly for:

- purple brand identity,
- purple-to-orange accent gradient,
- clean white surfaces,
- rounded components,
- soft borders,
- geometric typography,
- simple dashboard aesthetics.

This document intentionally **does not define UX, information architecture, page layout, navigation placement, or user flows**.

Existing screen structure should not be treated as mandatory. Future pages may reorganize content where better UX decisions are identified.

---

# 1. Visual Direction

ResearchGap should feel:

- modern,
- academic,
- approachable,
- clean,
- youthful,
- professional,
- lightweight.

The interface should avoid looking overly corporate, overly playful, or visually dense.

The primary visual identity should remain recognizable through:

- purple as the main brand color,
- selective purple-orange gradients,
- strong dark typography,
- generous white space,
- subtle borders,
- restrained shadows.

---

# 2. Design Principles

## Clean First

Prefer simple surfaces and clear hierarchy.

Do not decorate components unless the decoration contributes to the visual identity.

## Purple as Identity

Purple is the primary ResearchGap brand color.

Use it for:

- primary actions,
- selected states,
- highlights,
- branded badges,
- important visual accents.

Do not make every component purple.

## Gradient as Accent

The purple-to-orange gradient is a distinctive ResearchGap visual element.

Use it selectively.

Appropriate uses:

- primary promotional CTA,
- strong brand highlight,
- selected branded decorative element,
- special action where additional emphasis is justified.

Avoid using gradients for:

- regular body text,
- all buttons,
- all cards,
- large page backgrounds,
- standard form controls.

## Neutral Surfaces

Most application surfaces should remain neutral.

Use white and subtle neutral backgrounds so branded accents remain meaningful.

---

# 3. Color System

Colors should be defined through semantic design tokens instead of repeated raw values throughout components.

The following values are the proposed starting palette based on the existing ResearchGap visual reference.

## Brand

| Token                  | Value     | Usage                          |
| ---------------------- | --------- | ------------------------------ |
| `brand-primary`        | `#9718F5` | Primary ResearchGap purple     |
| `brand-primary-hover`  | `#8212D8` | Hover state                    |
| `brand-primary-soft`   | `#F5E9FF` | Soft selected/background state |
| `brand-secondary`      | `#FF713D` | Orange accent                  |
| `brand-secondary-soft` | `#FFF0E9` | Soft orange accent             |

Exact brand values may be adjusted later if official ResearchGap brand assets provide authoritative colors.

---

## Gradient

Primary brand gradient:

```css id="z1e7qb"
linear-gradient(
  90deg,
  #9718F5 0%,
  #B832C8 45%,
  #FF713D 100%
)
```

Use through a shared token or utility rather than redefining the gradient per component.

Suggested semantic name:

```text id="kgv7qx"
gradient-brand
```

---

## Neutral

| Token            | Suggested Value | Usage                         |
| ---------------- | --------------- | ----------------------------- |
| `background`     | `#FFFFFF`       | Main application background   |
| `surface`        | `#FFFFFF`       | Cards, dialogs, panels        |
| `surface-subtle` | `#FAFAFC`       | Secondary surfaces            |
| `surface-muted`  | `#F6F7F9`       | Table rows, muted blocks      |
| `border`         | `#E5E7EB`       | Standard border               |
| `border-strong`  | `#D7DAE0`       | Stronger separation           |
| `text-primary`   | `#182033`       | Main text                     |
| `text-secondary` | `#667085`       | Supporting text               |
| `text-muted`     | `#98A2B3`       | Placeholder and tertiary text |

Avoid pure black for normal interface typography.

---

## Semantic Colors

Use semantic tokens for application states.

```text id="h8hwbj"
success
warning
danger
info
```

Do not reuse brand purple for every semantic state.

Suggested direction:

- success → green,
- warning → amber,
- danger → red,
- info → blue.

Use soft backgrounds for non-critical status indicators.

---

# 4. Typography

Use **Poppins** as the primary interface typeface.

Fallback:

```css id="yizttw"
font-family: "Poppins", system-ui, sans-serif;
```

The visual hierarchy should rely primarily on:

- font size,
- font weight,
- spacing,

rather than excessive color variation.

---

## Font Weights

Prefer:

```text id="n9i2mh"
400 — Regular
500 — Medium
600 — Semibold
700 — Bold
```

Avoid excessive use of very heavy typography.

---

## Suggested Type Scale

| Purpose         |    Size |  Weight |
| --------------- | ------: | ------: |
| Page Title      | 24–28px |     700 |
| Section Title   | 18–20px | 600–700 |
| Card Title      | 16–18px |     600 |
| Body            | 14–16px |     400 |
| Label           | 13–14px |     500 |
| Supporting Text | 13–14px |     400 |
| Caption         |    12px | 400–500 |

Use responsive sizing where appropriate instead of hardcoding unnecessarily large headings.

---

## Text Color

Primary hierarchy:

```text id="xv3z3u"
Primary content      → text-primary
Supporting content   → text-secondary
Metadata             → text-muted
```

Purple text should generally represent:

- interactive emphasis,
- selected state,
- brand emphasis.

Do not use purple as the default body text color.

---

# 5. Spacing

Use a consistent spacing scale.

Recommended Tailwind-aligned scale:

```text id="pt7k8a"
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Avoid arbitrary values unless required by the design.

Common defaults:

```text id="i1c5kx"
Component internal gap: 8–16px
Card padding:           20–24px
Section gap:            24–32px
Major section gap:      32–48px
```

Dense interfaces may use smaller spacing where appropriate.

---

# 6. Border Radius

ResearchGap uses visibly rounded components without becoming overly soft.

Recommended tokens:

| Component     |      Radius |
| ------------- | ----------: |
| Small control |       6–8px |
| Button        |         8px |
| Input         |         8px |
| Card          |     10–12px |
| Dialog        |     12–16px |
| Badge         | Full / pill |

Avoid excessive radius variation across similar components.

---

# 7. Borders

Use borders more often than heavy shadows.

Default:

```text id="02ft1f"
1px solid var(--border)
```

Borders should provide subtle separation.

Active or focused components may use brand-colored borders.

Avoid thick decorative borders unless they represent an intentional brand accent.

---

# 8. Shadows

Use restrained shadows.

Default cards should often rely on borders alone.

Use shadows primarily for elevated elements such as:

- dialogs,
- popovers,
- dropdowns,
- floating elements.

Preferred direction:

```text id="xv6tcq"
soft
low-opacity
large blur
minimal vertical offset
```

Avoid strong black shadows.

---

# 9. Buttons

Use shared button variants instead of custom button styling per page.

Primary variants:

```text id="5q21uw"
primary
secondary
outline
ghost
destructive
```

Optional branded variant:

```text id="9unmh6"
brand-gradient
```

---

## Primary Button

Use solid ResearchGap purple.

Characteristics:

- medium/semibold text,
- white foreground,
- 8px radius,
- clear hover state,
- clear disabled state.

---

## Brand Gradient Button

Use selectively for high-emphasis branded actions.

Do not use the gradient variant as the default action everywhere.

---

## Secondary Button

Use neutral or soft-purple styling.

Secondary actions must remain visually weaker than the primary action.

---

## Button Height

Recommended:

```text id="wmv7pk"
sm      32px
default 40px
lg      44–48px
```

Avoid very tall buttons unless they are intentionally promotional.

---

# 10. Inputs

Inputs should remain visually simple.

Default characteristics:

- white background,
- neutral border,
- 8px radius,
- dark text,
- muted placeholder,
- visible focus ring.

Recommended height:

```text id="rg3dyg"
40–44px
```

Focus state should use the brand purple.

Avoid strong gradients or colored input backgrounds.

---

# 11. Form Labels

Labels should:

- appear above controls,
- use medium weight,
- use primary text color,
- remain visually distinct from helper text.

Required indicators should be consistent.

Helper or validation text should sit visually below the relevant control.

---

# 12. Cards

Cards are a primary ResearchGap surface.

Default card style:

```text id="g4w6ln"
background: white
border: subtle
radius: 10–12px
shadow: none or minimal
```

Cards should not automatically receive:

- gradients,
- heavy shadows,
- strong colored borders.

Brand accents may be used selectively.

---

## Content Cards

Examples include:

- bootcamp,
- webinar,
- article,
- dashboard summary.

Keep content hierarchy consistent:

```text id="ms9fiw"
visual / metadata
title
supporting information
action
```

Exact placement is a UX decision and is not prescribed by this guide.

---

# 13. Images

Content imagery should use consistent aspect ratios where possible.

Prefer:

```text id="w0tpst"
object-fit: cover
```

Avoid stretching source images.

Use shared image containers rather than allowing every page to invent unique dimensions.

Bootcamp and webinar visual assets should retain enough prominence to support the ResearchGap identity.

---

# 14. Badges

Use badges for short categorical or status information.

Examples:

- category,
- publication state,
- enrollment state,
- program status.

Badge characteristics:

- compact,
- semibold or medium text,
- pill-shaped,
- soft background,
- strong enough foreground contrast.

Avoid using badges for long sentences.

---

# 15. Tables

Tables should visually remain lightweight.

Use:

- subtle headers,
- clear row separation,
- neutral background,
- restrained borders.

Avoid:

- strong grid borders around every cell,
- excessive background colors,
- large decorative elements.

Status information may use semantic badges.

---

# 16. Dialogs and Modals

Dialogs should use:

- white surface,
- clear title hierarchy,
- subtle shadow,
- rounded corners,
- dimmed backdrop,
- consistent padding.

Avoid unnecessary decorative gradient surfaces inside dialogs.

Dialogs should visually feel elevated from the application surface.

Exact dialog behavior and placement are UX concerns and are intentionally not defined here.

---

# 17. Dropdowns and Popovers

Use consistent elevated surfaces.

Characteristics:

- white background,
- subtle border,
- soft shadow,
- 8–12px radius,
- concise option states.

Selected and hover states may use soft purple.

---

# 18. Navigation Visual States

This guide only defines the **visual treatment**, not navigation structure or placement.

Navigation states should support:

```text id="f7vdkh"
default
hover
active
disabled
```

Active state may use:

- brand purple text,
- soft purple background,
- subtle brand indicator.

Avoid excessive visual treatments simultaneously.

---

# 19. Icons

Use one consistent icon library.

Prefer the icon system already used by shadcn/ui.

Recommended default:

**Lucide Icons**

Rules:

- use consistent stroke weight,
- keep icons visually subordinate to text,
- do not mix unrelated icon styles,
- avoid decorative icons without functional or semantic value.

Typical size:

```text id="5qfkv2"
16px
18px
20px
24px
```

---

# 20. Avatars

Use circular avatars.

When no profile image exists:

- use initials,
- use a subtle neutral or soft-purple background,
- maintain readable contrast.

Do not generate arbitrary profile illustrations automatically.

---

# 21. Empty States

Empty states should remain visually simple.

They may contain:

- optional icon,
- concise heading,
- supporting text,
- relevant action.

Avoid large decorative illustrations unless specifically designed.

---

# 22. Loading States

Use visual loading patterns consistent with the component.

Prefer:

- skeletons for content surfaces,
- spinner for compact actions,
- disabled button state during submission.

Avoid major layout shifts once content loads.

---

# 23. Error States

Errors should be noticeable without visually overwhelming the page.

Use semantic danger styling.

For form errors:

- keep the error close to the relevant field,
- use concise text,
- preserve layout stability.

---

# 24. Success States

Use success styling for completed operations.

Avoid turning the entire interface green.

Use restrained semantic feedback such as:

- toast,
- badge,
- compact confirmation state.

---

# 25. Motion

Motion should be subtle and functional.

Recommended duration:

```text id="1p6lh4"
150ms–250ms
```

Suitable transitions:

- hover,
- focus,
- dialog appearance,
- dropdown appearance,
- button state,
- subtle content transitions.

Avoid excessive:

- bouncing,
- scaling,
- long animations,
- decorative motion.

Respect reduced-motion preferences.

---

# 26. Responsive Visual Behavior

Components must visually adapt across screen sizes.

Avoid:

- fixed desktop-only widths,
- overflowing text,
- excessively small touch targets,
- stretched cards,
- unreadable tables.

Responsive **layout and information priority decisions remain UX concerns** and should be designed per feature rather than copied from the legacy interface.

---

# 27. Accessibility

Visual implementation should maintain:

- sufficient text contrast,
- visible keyboard focus,
- readable font sizes,
- distinguishable disabled states,
- touch targets of appropriate size,
- non-color-only status communication.

Avoid removing focus outlines without replacing them with a visible alternative.

---

# 28. Tailwind Conventions

Prefer design tokens and shared variants over repeated arbitrary Tailwind values.

Prefer:

```text id="yq70w0"
bg-background
bg-card
text-foreground
text-muted-foreground
border-border
bg-primary
text-primary
```

over repeatedly writing raw hex values in components.

Use arbitrary values only when the design genuinely requires them.

---

# 29. shadcn/ui

Use shadcn/ui as the base component system.

Prefer extending existing primitives over recreating:

- Button,
- Input,
- Select,
- Dialog,
- Dropdown,
- Table,
- Badge,
- Card,
- Form controls.

Project styling should primarily happen through:

- shared variants,
- CSS variables,
- Tailwind tokens,
- composed application components.

Do not fork basic primitives unnecessarily.

---

# 30. Design Tokens

Centralize reusable visual values.

At minimum define semantic tokens for:

```text id="48i0xs"
background
foreground

card
card-foreground

primary
primary-foreground

secondary
secondary-foreground

muted
muted-foreground

accent
accent-foreground

destructive

border
input
ring

brand-purple
brand-orange
brand-gradient
```

Components should consume semantic tokens rather than knowing raw brand values.

---

# 31. Component Consistency

If multiple screens use the same visual concept, create a shared component.

Examples may include:

```text id="z03j9z"
PageHeader
StatusBadge
ContentCard
BootcampCard
WebinarCard
EmptyState
DataTable
FormSection
MediaThumbnail
```

Do not extract components prematurely when visual or behavioral requirements are still meaningfully different.

---

# 32. Visual Density

ResearchGap should generally use moderate visual density.

Avoid both extremes:

**Too sparse**

- excessive unused whitespace,
- giant controls,
- oversized cards.

**Too dense**

- compressed tables,
- crowded cards,
- tiny typography,
- insufficient separation.

Choose density according to content while maintaining the same design language.

---

# 33. Legacy UI Reference

The existing ResearchGap interface provides useful visual references for:

- brand purple,
- orange accent,
- gradient direction,
- rounded cards,
- typography character,
- clean white application surfaces.

The following aspects should **not** automatically be preserved:

- sidebar structure,
- header structure,
- content placement,
- dashboard composition,
- modal information structure,
- navigation hierarchy,
- page density,
- fixed component sizing,
- existing interaction patterns.

These will be reconsidered independently during UX design.

---

# 34. Visual Anti-Patterns

Avoid:

- gradients on every action,
- excessive purple surfaces,
- heavy shadows,
- excessive glassmorphism,
- excessive border radius,
- large decorative backgrounds,
- inconsistent card styling,
- inconsistent button variants,
- arbitrary colors,
- arbitrary spacing,
- mixing multiple icon styles,
- giant page titles,
- low-contrast gray text,
- UI elements that imitate unrelated design systems.

---

# 35. Frontend Implementation Principle

When implementing a new frontend feature:

1. reuse existing visual tokens;
2. reuse shadcn primitives;
3. reuse existing application components where appropriate;
4. maintain consistent typography and spacing;
5. avoid introducing page-specific design systems;
6. keep visual implementation separate from product/UX assumptions.

The target is a frontend that feels like **one ResearchGap product**, even when individual pages have different content and interaction needs.

---

## Core Visual Principle

ResearchGap should use a **clean neutral interface with a strong but restrained purple identity and selective purple-to-orange accents**.

Preserve the brand character of the current interface while allowing the UX, layout, and information architecture to be redesigned independently.
