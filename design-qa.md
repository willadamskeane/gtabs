# Design QA — Quiet Workspace

final result: passed

## Evidence and state

- Source: `/workspace/scratch/5f4a7c69f447/generated_images/exec-2efdb918-e139-419a-af30-956cbee0cecf.png`, selected option 1, 1056 × 1490 raster pixels.
- Implementation: `/workspace/scratch/gtabs-popup-review.jpg`, 440 × 600 browser-rendered pixels; CSS popup 440 × 600. Captured from the browser viewport and cropped to the popup bounds.
- Combined full-view evidence: `/workspace/scratch/gtabs-design-comparison.jpg`; source downsampled to 440px width, implementation at 1:1 CSS pixel density. Source shows all mock groups; implementation shows the top of a scrollable review list. This state difference is intentional for a native Chrome popup with readable controls.
- Settings evidence: `/workspace/scratch/gtabs-settings.jpg`.
- Route: local browser preview `/`, review state, light theme, three groups and twelve simulated tabs. Settings `/options.html`, custom connection with a discovered model.
- Focused comparison: header, first group, and footer remain readable at the combined image's native size; a separate enlargement was unnecessary.

## Findings and comparison history

Earlier [P2]: the review list could continue beneath the footer, obscuring lower rows. Fixed the popup as a 600px flex column, made main independently scrollable, and kept the footer in normal flex flow. Revised screenshot and combined comparison show no overlapping rows or controls.

No actionable P0/P1/P2 findings remain. The native popup intentionally scrolls, while the reference fits every mock row in one static image. Footer controls remain reachable and the list preserves all groups.

## Required fidelity surfaces

- Typography: system sans-serif, clear bold heading and group labels, readable 13px tab rows and smaller secondary domains. Long titles/domains truncate rather than displacing controls; full URLs remain available as row tooltips. Text is intentionally larger than the dense reference.
- Spacing/layout: warm white canvas, aligned 22px inset, quiet section dividers and restrained radii. Search, introductory text, review sections, and primary footer retain the source hierarchy. Scroll is the intentional native-popup adaptation.
- Colors/tokens: deep green primary action and selected checkboxes, dark neutral text, muted secondary text, subtle borders, and semantic group-color dots match the selected direction. Focus-visible, reduced-motion, and forced-color styles are included.
- Assets: bundled official Phosphor SVGs retain sharpness. Real extension tab icons use Chrome's favicon cache; preview uses bundled brand icons and globe fallbacks. Monochrome icons intentionally follow the quieter UI treatment.
- Copy/content: selected mock's review/edit/apply journey is retained. Copy states the actual behavior. Settings explains endpoint access, local credentials, provider discovery, pricing uncertainty, and availability without dated model recommendations.

## Browser interaction checks

Verified: organize/review; rename; group menu; individual exclusion; search; apply; undo; cancel; provider settings; custom model discovery and saved ID preservation; domain-rule draft creation and persistence across panels. Corrected the draft-rule issue before final checks.

Console checked: no app-origin errors observed. The browser's unrelated metadata extension emits its own errors from a different chrome-extension origin.

## Implementation checklist

- [x] Fix review/footer overflow and compare revised render.
- [x] Verify accessible control labels and focus styles.
- [x] Verify rule drafts and provider discovery interactions.
- [x] Pass typecheck, 416 automated tests, production build, and ZIP packaging.
- [ ] Smoke test unpacked extension in a real Chrome profile with actual provider credentials. Preview fixtures cannot verify tabGroups APIs, service-worker lifetime, Chrome AI availability, or real endpoint responses.

## Follow-up polish

P3: inspect platform-specific system-font metrics and user-supplied favicons in the installed extension.
