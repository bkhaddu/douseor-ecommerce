---
name: DOUSEOR Identity
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfdf'
  on-secondary-container: '#626363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 42px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  body:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.7'
    letterSpacing: 0.01em
  label-caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.08em
spacing:
  base: 8px
  navbar-height: 60px
  gutter: 1px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style

The design system is rooted in extreme brutalist-minimalism, stripping away all decorative elements to emphasize structural integrity and product photography. It targets a high-end, fashion-forward audience that values confidence and architectural clarity over visual noise. 

The aesthetic is intentionally cold and editorial, utilizing a "raw" layout approach where hairline borders define the space rather than shadows or depth. Every element is functional, unapologetic, and highly disciplined.

## Colors

The palette is restricted to a high-contrast, monochromatic range to maintain an editorial feel. 

- **Primary & Accent:** The solid ink black (#0D0D0D) is used for all primary actions, typography, and structural emphasis.
- **Backgrounds:** A warm off-white (#F5F4F0) serves as the primary canvas to prevent the interface from feeling clinical, while pure white (#FFFFFF) is reserved for product cards and surface layers.
- **Muted Elements:** Secondary text and tertiary information utilize a mid-gray (#9A9A9A) to create a clear visual hierarchy without introducing new hues.
- **Borders:** Hairline dividers (#E0DFDB) provide the only method of separation, ensuring the brutalist structure remains lightweight and sharp.

## Typography

This design system utilizes **Inter** exclusively to achieve a utilitarian and systematic look. The hierarchy is driven by dramatic scale shifts and strict uppercase application for headlines.

- **Headlines:** Use light weights for large displays to emphasize the letterforms' geometry. Tight letter-spacing is essential for the Heading XL to maintain a "locked-in" editorial appearance.
- **Body:** Set at a smaller 13px with a generous 1.7 line-height to ensure maximum legibility against the minimalist backdrop.
- **Labels:** Captions must be tracked out (0.08em) and rendered in uppercase to serve as functional anchors for product data and metadata.

## Layout & Spacing

The layout follows a strict 8px base grid, but relies on a **fixed-width grid container** for desktop to mimic the constraints of a printed lookbook. 

- **Grid:** Use a 12-column grid for desktop and a 2-column grid for mobile. 
- **Dividers:** Elements are separated by 1px hairline borders rather than gutters in many instances, creating a "tiled" effect.
- **Navbar:** A fixed 60px height bar provides a consistent anchor at the top of the viewport, separated by a single hairline bottom border.
- **Padding:** Use generous internal padding within sections (80px+) to allow the minimal content to breathe, emphasizing the "cold" luxury aesthetic.

## Elevation & Depth

In line with brutalist principles, this design system contains **zero shadows, gradients, or blurs.** 

Depth is communicated entirely through:
1. **Layered Surfaces:** Pure white surfaces (#FFFFFF) sitting on top of the warm off-white (#F5F4F0) background.
2. **Hairline Outlines:** All containers and interactive zones are defined by 1px solid borders.
3. **High Contrast:** Using black fills for active states to "pop" elements forward against the light background.

## Shapes

The shape language is strictly orthogonal. A **0px border-radius** is applied to every element, including buttons, inputs, and image containers. This lack of curvature reinforces the architectural, confident, and "unrefined" nature of the brand.

## Components

### Buttons
- **Primary:** Solid #0D0D0D background with white text. 0px radius. No hover transition other than a slight opacity shift (0.9) or a full color invert.
- **Secondary:** Transparent background with a 1px #0D0D0D border and black text.

### Cards
- **Product Cards:** Must use a 4:5 aspect ratio for all imagery. Images are flush to the top and sides of the card container. 
- **Labels:** Product titles and prices are placed below the image using the `label-caption` style, aligned left.

### Inputs
- **Text Fields:** 1px bottom border only (#E0DFDB). No background fill. `label-caption` used for floating labels or placeholder text.

### Navigation
- **Navbar:** 60px height. Links are `headline-md` style. Desktop navigation should be centered or split-justified with zero padding between items, separated by vertical hairline dividers.

### Chips & Tags
- **Status Tags:** Simple 1px bordered rectangles. No background. All caps. 11px font size.