---
name: Botanical Minimalist
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#404945'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#717975'
  outline-variant: '#c0c8c4'
  surface-tint: '#396759'
  primary: '#154539'
  on-primary: '#ffffff'
  primary-container: '#2f5d50'
  on-primary-container: '#a3d4c3'
  inverse-primary: '#a0d1c0'
  secondary: '#4a654f'
  on-secondary: '#ffffff'
  secondary-container: '#c9e7cc'
  on-secondary-container: '#4e6953'
  tertiary: '#3f3e38'
  on-tertiary: '#ffffff'
  tertiary-container: '#56554f'
  on-tertiary-container: '#cdcac2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceddc'
  primary-fixed-dim: '#a0d1c0'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#204f42'
  secondary-fixed: '#cceacf'
  secondary-fixed-dim: '#b0ceb4'
  on-secondary-fixed: '#062010'
  on-secondary-fixed-variant: '#334d38'
  tertiary-fixed: '#e6e2da'
  tertiary-fixed-dim: '#c9c6bf'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#484741'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap-lg: 80px
  section-gap-sm: 40px
---

## Brand & Style

The design system is anchored in "Botanical Minimalist" principles—a fusion of organic warmth and modern precision. It targets a discerning audience seeking transparency, purity, and luxury in their skincare ritual. The emotional response is one of immediate tranquility and professional expertise.

The style leverages **Modern Minimalism** with a focus on tactile luxury. High-quality whitespace is treated as a core "ingredient," allowing product photography and typography to breathe. This is not a cold minimalism; it is softened by a palette derived from nature and a "lightweight" interface that feels as clean as the products themselves.

## Colors

The palette is a sophisticated "Forest to Skin" transition. **Deep Forest Green** serves as the primary anchor, used for key actions and authoritative text to instill trust. **Sage Green** acts as a supportive secondary, ideal for soft highlights and success states. 

The background strategy utilizes **Soft Cream** as the primary surface color to avoid the clinical harshness of pure white, creating a premium "paper-like" feel. **Warm Beige** and **Natural Brown** are reserved for subtle accents, earth-tone dividers, and secondary iconography. Neutrals remain cool and functional to ensure the organic tones remain the focal point.

## Typography

This design system utilizes a dual-font approach. **Plus Jakarta Sans** provides a modern, geometric clarity for headlines, mimicking the clean lines of premium packaging. **Inter** handles all body copy and UI labels, ensuring maximum readability and a functional, systematic feel.

For a premium editorial touch, use `label-md` for small headers above main headlines (e.g., "ORGANIC SOLUTIONS"). On mobile, headings scale down aggressively to maintain the "lightweight" feel without overwhelming the viewport. Avoid using weights below 400 to maintain accessibility against the Soft Cream background.

## Layout & Spacing

This design system follows a **Fluid Grid** model based on an 8px base unit. The layout is optimized for a mobile-first flow, ensuring that content blocks stack elegantly with generous vertical padding.

- **Mobile:** 4-column grid with 16px side margins. 
- **Desktop:** 12-column grid with a 1200px max-width container, centered.
- **Sectioning:** Use `section-gap-lg` (80px) to separate distinct content stories (e.g., from "Product Benefits" to "Customer Reviews") to maintain the clutter-free aesthetic. Elements within a group should use tighter `unit` multiples (16px, 24px) to indicate relationship.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. Instead of heavy borders, surfaces are differentiated by subtle shifts between Soft Cream and White.

Shadows should be "Airy":
- **Low Elevation:** 0px 2px 8px rgba(47, 93, 80, 0.05) — Used for cards and subtle buttons.
- **High Elevation:** 0px 12px 32px rgba(47, 93, 80, 0.08) — Used for dropdowns and floating navigation.

The Deep Forest Green color can be used in the shadow's tint (at very low opacity) to harmonize the depth with the brand's primary pigment.

## Shapes

The shape language is consistently **Rounded**, reflecting the organic nature of the brand. Sharp corners are avoided to maintain a "gentle" visual persona. 

- **Standard Elements:** 0.5rem (8px) for cards and inputs.
- **Prominent Actions:** 1rem (16px) for main "Shop" buttons to make them feel more inviting.
- **Pill Shapes:** Reserved for "In Stock" chips or status indicators.

## Components

### Buttons
- **Primary:** Solid Deep Forest Green with White text. High roundedness (rounded-lg).
- **Secondary:** Transparent with a Sage Green border and text.
- **Tertiary:** Text-only in Deep Forest Green with a Subtle Underline on hover.

### Cards
- Background: White.
- Border: 1px solid #E7D8C9 (Warm Beige) at 50% opacity.
- Shadow: Low Elevation Airy shadow.

### Inputs
- Background: #FFFFFF.
- Border: 1.5px solid #F5F5F5.
- Focus State: Border changes to Sage Green with a soft outer glow.

### Chips & Badges
- Used for ingredients (e.g., "Aloe Vera", "Vegan"). 
- Styling: Sage Green background at 10% opacity with Sage Green text.

### Icons
- Use **Font Awesome Pro (Light or Regular weight)**. Never use solid/filled icons unless for a toggle state. Icons should always be Deep Forest Green or Natural Brown.