# Accessibility (WCAG 2.1 AA) Compliance — TerraMind AI

TerraMind AI is built with accessibility in mind, conforming to the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards.

---

## 1. Implemented Features

### Keyboard Navigation & Focus Indicators
- All interactive controls (buttons, forms, select menus, links) are navigable using standard `Tab` and `Shift + Tab` key sequences.
- Focus visible indicators are customized with consistent emerald outline highlight styles:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-primary-container, #6ae908);
    outline-offset: 2px;
  }
  ```
- **Skip to Content Link**: Added a hidden-by-default anchor link as the first focusable item on the layout page. This allows users navigating via screen readers or keyboards to skip dashboard navigational sidebars and jump directly to page content.

### Screen Reader Landmarks & Attributes
- **Landmarks**: Wrap the main application structure using the `<main id="main-content">` landmark.
- **Form Associations**: Form inputs use explicit `htmlFor` and matching `id` bindings to ensure labels are programmatically associated with inputs.
- **ARIA Required & Live Regions**:
  - Crucial input fields include `aria-required="true"`.
  - Error messages utilize `role="alert"` and `aria-live="assertive"` to ensure screen readers instantly notify users of submission failures.
  - Loading states use `aria-live="polite"` to dynamically announce action states without interrupting flow.

---

## 2. Accessibility Verification Checklist

| Compliance Vector | Success Criterion | Status | Implementation Details |
|---|---|---|---|
| **Skip-Link** | 2.4.1 Bypass Blocks | ✅ Passed | Added to top of `layout.tsx` |
| **Focus Style** | 2.4.7 Focus Visible | ✅ Passed | Set custom outline in `globals.css` |
| **Labels** | 3.3.2 Labels or Instructions | ✅ Passed | Explicit `htmlFor` & `id` on all inputs |
| **Live Updates** | 4.1.3 Status Messages | ✅ Passed | Form feedback uses `role="alert"` |
| **Language** | 3.1.1 Language of Page | ✅ Passed | Root html tag enforces `lang="en"` |
