# Design System Document: High-End Developer Portfolio

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Architect"
This design system rejects the "template-first" mentality of modern web portfolios. Instead, it treats the screen as a three-dimensional site of construction—a **Layered Matrix**. It is a space where code meets cinema. 

The system moves beyond flat UI by utilizing **Spatial Architecture**: a method of defining importance through Z-axis depth and translucency rather than just X/Y placement. By combining massive, high-contrast editorial typography with surgical technical accents, we create an experience that feels like browsing a high-end architectural blueprint of a digital mind.

**Core Principles:**
*   **Intentional Asymmetry:** Avoid perfect balance. Use heavy-weighted typography on one side of the axis to create a "push-pull" dynamic with negative space.
*   **The Overlap:** Elements should rarely sit side-by-side in isolation. Use `surface-container` nesting and 0.5px - 1px offsets to create the illusion of stacked physical layers.
*   **The Tech-Noir Detail:** Every broad, cinematic stroke (massive headers) must be balanced by a tiny, precise technical detail (monospaced metadata or a 1px hairline border).

---

## 2. Colors

The palette is rooted in absolute depth. We do not use "grey"; we use varying densities of charcoal and shadow to build a matrix.

### The Color Logic
*   **Background (`#050505`):** The void. Use this as the base for the entire canvas.
*   **Surface (`#0F0F11`):** The primary work surface. This is the "material" that sits one level above the background.
*   **Primary (`#FFFFFF`):** High-impact light. Used for critical information and primary actions.
*   **Tertiary (`#6FFBBE`):** The "Functional Green." Reserved strictly for status, success indicators, or a single "live" terminal cursor element.

### The "No-Line" Rule
Standard 1px solid borders for sectioning are prohibited. Boundaries between major content blocks must be defined solely through **Background Shifts** (e.g., a `surface-container-low` section sitting directly on a `surface` background).

### Surface Hierarchy & Nesting
Use the container tiers to define depth. Do not mix them randomly:
1.  **Lowest (`#0E0E0E`):** Sunken content, recessed code blocks.
2.  **Low (`#1C1B1B`):** Main content cards.
3.  **High/Highest (`#2A2A2A` / `#353534`):** Modals, tooltips, or elements being "hovered" by the user.

### Glass & Gradient Rule
To achieve "Spatial Architecture," use `backdrop-blur(8px)` with semi-transparent surface colors (e.g., `surface` at 70% opacity). This creates a "frosted obsidian" look where the content underneath is felt but not distracting.

---

## 3. Typography

The typographic system is a dialogue between **Massive Impact** and **Surgical Precision**.

*   **Display (`Clash Display`):** These are your architectural beams. Use `display-lg` (3.5rem) for hero statements. Kerning should be tight to emphasize the geometric nature of the letterforms.
*   **Body (`Switzer` / `Inter`):** This is the functional layer. Use `body-md` (0.875rem) for most descriptions. It provides a neutral, high-legibility counter-balance to the aggressive headings.
*   **Technical/Label (`JetBrains Mono` / `Space Grotesk`):** Used for metadata, tags, and code. This conveys "The Technical Grid." Always use all-caps for labels to maximize the architectural feel.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by stacking. A `surface-container-lowest` card should be nested inside a `surface-container-low` section. This creates a soft, natural "recessed" effect without the need for heavy-handed box shadows.

### Ambient Shadows
Shadows must be invisible until they are noticed.
*   **Blur:** 40px - 80px.
*   **Opacity:** 4% - 8%.
*   **Color:** Use a tinted version of `on-surface` (e.g., a very faint white glow) rather than black, to simulate light catching the edge of a glass plate.

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**. Use the `outline-variant` (`#474747`) at 20% opacity. This creates a "hairline" that appears and disappears based on the user's viewing angle, reinforcing the "Matrix" aesthetic.

---

## 5. Components

### Buttons
*   **Primary:** Solid `#FFFFFF` background, `#1A1C1E` text. Sharp 0px corners. No border.
*   **Secondary:** Ghost style. 1px hairline border using `outline` (`#919191`). No background.
*   **Tertiary:** Text-only in `JetBrains Mono` with a leading `>` character.

### Input Fields
*   **Base:** 0px radius. `surface-container-lowest` background.
*   **Active State:** Change border from `outline-variant` to `primary` (`#FFFFFF`).
*   **Error:** Use `error` (`#FFB4AB`) for the hairline border and helper text.

### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal lines to separate list items. Use vertical white space (Spacing `8` or `10`) or subtle background shifts.
*   **The "Architectural" Card:** A card should not have a border on all four sides. Experiment with a single 1px hairline on the left side only to "anchor" the content to the grid.

### New Component: The Matrix Breadcrumb
A persistent monospaced string at the bottom-left of the viewport (using `JetBrains Mono` at `label-sm`) that tracks the user's Z-index position (e.g., `ROOT / PROJECTS / 01_NEURAL_NET`).

---

## 6. Do's and Don'ts

### Do
*   **DO** use extreme negative space. If you think there is enough room between sections, double it.
*   **DO** mix font weights. Pair a `display-lg` (Bold) with a `label-sm` (Regular Monospace) in close proximity.
*   **DO** use 0px border-radius everywhere. This system is about precision and sharp edges.

### Don't
*   **DON'T** use soft drop shadows. They break the "Glass & Matrix" architectural vibe.
*   **DON'T** use rounded icons. Use sharp, linear icon sets (e.g., Phosphor Bold or Lucide with 1px stroke).
*   **DON'T** use more than one accent color per page. If using the functional green (`tertiary`), do not introduce other colors. Keep it cinematic and monochromatic.

### Accessibility Note
While the aesthetic is dark and high-contrast, ensure all `text-secondary` (`#A1A1AA`) on `surface` backgrounds maintains a 4.5:1 ratio. If a surface is nested and becomes lighter, adjust text tokens accordingly.