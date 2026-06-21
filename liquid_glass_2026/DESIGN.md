---
name: Liquid Glass 2026
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bdcbb0'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#88957c'
  outline-variant: '#3e4a35'
  surface-tint: '#65e100'
  primary: '#aeff7d'
  on-primary: '#143800'
  primary-container: '#6ae908'
  on-primary-container: '#296400'
  inverse-primary: '#2d6c00'
  secondary: '#a5e7ff'
  on-secondary: '#003543'
  secondary-container: '#00d2ff'
  on-secondary-container: '#00566a'
  tertiary: '#b4fd83'
  on-tertiary: '#163800'
  tertiary-container: '#99e06a'
  on-tertiary-container: '#2c6300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#80ff30'
  primary-fixed-dim: '#65e100'
  on-primary-fixed: '#092100'
  on-primary-fixed-variant: '#205100'
  secondary-fixed: '#b6ebff'
  secondary-fixed-dim: '#47d6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#adf67c'
  tertiary-fixed-dim: '#93d964'
  on-tertiary-fixed: '#0a2100'
  on-tertiary-fixed-variant: '#235100'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: IBM Plex Sans
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0em
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system embodies a high-fidelity, futuristic aesthetic that merges hyper-realistic materials with digital luminosity. It is designed for high-performance interfaces where data density meets atmospheric elegance. 

The visual language is defined by **Glassmorphism 2.0**: a refined evolution of frosted surfaces characterized by dynamic transparency, multi-layered refraction, and environmental "liquid" lighting. The emotional response is one of technological sophisitication, precision, and immersive depth. The UI feels like a physical glass instrument floating within a dark, bioluminescent environment.

## Colors
The palette is rooted in a "Deep Space" foundation of #0a0a0a to provide maximum contrast for neon elements. 

- **Primary Neon Green (#6ae908):** Used for critical actions and state indicators.
- **Atmospheric Cyan (#00d2ff):** Used for interactive secondary elements and data visualization.
- **Emerald Deep (#377604):** Used for subtle accents and success states.
- **Aurora Overlays:** Implement slow-moving, low-opacity radial gradients in the background to simulate liquid gas or plasma. Surfaces should use a highly desaturated white at 3-8% opacity to achieve the "glass" substrate.

## Typography
This design system utilizes **IBM Plex Sans** for its balance between technical precision and human readability. 

- **Headlines:** Must feature wide tracking (letter-spacing) to evoke a premium, cinematic feel.
- **Data Display:** For numerical values or code-adjacent data, use the monospaced variant to ensure alignment and legibility.
- **Hierarchy:** Use font weight and letter spacing rather than color shifts to establish hierarchy, keeping text primarily in high-contrast white or light-grey to "cut through" the glass background.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous outer margins to emphasize the "floating" nature of the UI.

- **Grid:** Use a 12-column grid for desktop with 24px gutters.
- **Rhythm:** Spacing is strictly based on an 8px scale.
- **Safe Areas:** Components should have internal padding of at least 24px (3 units) to allow the glass refraction effects enough "breathing room" without clipping content.
- **Mobile Adaption:** On mobile, margins shrink to 20px, and the 12-column grid collapses to a 4-column system.

## Elevation & Depth
Depth is not communicated through traditional black shadows, but through **Refractive Layers** and **Ambient Glows**.

- **Backdrop Blur:** All glass surfaces must apply a `backdrop-filter: blur(20px) saturate(180%)`.
- **Inner Glow:** Use a 1px white inner-border (stroke) at 10% opacity on the top and left edges to simulate light hitting the edge of a glass pane.
- **Drop Shadow:** Instead of black, use extremely soft, large-radius shadows tinted with the primary accent color (#6ae908) at 5-10% opacity to create a "neon underglow" effect.
- **Z-Axis:** Higher elevation elements should have a lower background opacity (more transparent) and a more pronounced inner-glow.

## Shapes
The shape language is controlled and sophisticated. 

- **Container Radius:** Standard containers use a 16px (`rounded-lg`) radius to soften the futuristic look, preventing it from feeling overly aggressive or "sharp."
- **Interactive Elements:** Buttons and inputs follow the 16px standard. 
- **Environmental Particles:** Small, circular decorative elements (0-2px) should be scattered in the background with varying opacities to simulate dust or data-particles caught in light.

## Components
- **Floating Glass Cards:** The core container. Features a subtle 1px border with a linear gradient (top-left: white 20%, bottom-right: transparent).
- **Glass Buttons:** Primary buttons use a solid-to-transparent gradient fill of the Primary Neon Green. Secondary buttons are "Ghost Glass"—only a 1px border with a heavy backdrop blur.
- **Soft Neon Inputs:** Input fields should have no background fill until focused. Upon focus, they develop a soft internal glow of the Secondary Cyan color.
- **Lists & Selection:** Selected items in a list should use a "Liquid Fill" effect—a subtle horizontal gradient moving from 10% opacity to 0% across the row.
- **Chips:** Small pill-shaped containers with a high-contrast border and a very faint background tint matching the chip's semantic color.
- **Environmental Lighting:** Use "Light Orbs"—large, blurred radial gradients—that sit behind the UI components to highlight specific sections of the screen.