# Travel Pins Page Refactor Plan

## Goals

- Reduce `src/Pages/TravelPins/index.jsx` complexity and size while preserving behavior.
- Improve separation of concerns: map setup, markers management, popups, overlays, forms, and utilities.
- Eliminate render loops and minimize React state churn for map/marker operations.
- Keep Mapbox GL imperative APIs isolated behind hooks/components for testability and reuse.
- Maintain mobile UX fixes (scrollable modal, gesture disabling, single-popup policy) and wallet/auth interactions.

## Constraints & Non-Goals

- Keep Mapbox GL JS and current pin popup design/behavior intact.
- Do not migrate to Mapbox layer-based symbol rendering at this stage (HTML markers remain).
- Do not change API contracts for `useTravelPins` or mutations.
- Avoid unrelated feature changes; focus on structure and maintainability.

## Proposed Architecture

Top-level composition for the page:

- `TravelPinsPage` (container)
  - Data fetching (pins), auth/login modal triggers.
  - Holds form/edit/delete/photo modal states and handlers.
  - Renders `TravelPinsMap` and lightweight overlays.

- `TravelPinsMap` (component)
  - Initializes/destroys Mapbox map via `useMapboxMap`.
  - Provides a map ref to children via prop or React context.
  - Accepts callbacks: `onEmptyMapClick(coord)`, `onLoad()`, `onError(err)`.

- `MarkersLayer` (component or hook-driven)
  - Receives `map`, `pins`, and popup handlers (`onEdit`, `onDelete`, `onCopy`, `onOpenPhoto`).
  - Manages diff-by-id lifecycle for HTML markers (create/update/remove) via `useMarkers`.
  - Integrates popup creation (using existing `buildPopupHTML`) and delegated event wiring.

- `useMapboxMap(containerRef, options)` (hook)
  - Encapsulates map creation, event subscriptions, cleanup.
  - Returns `{ map, loaded, error }`.

- `useMarkers(map, pins, options)` (hook)
  - Owns `markersByIdRef` and `markersRef`.
  - Performs diffing to add/update/remove markers and popups.
  - Exposes helpers: `closeAllPopups()`, `getMarker(id)`.

- `useProximityColors(map, pins)` (hook)
  - Computes screen-space proximity groups after `moveend/zoomend`.
  - Recolors markers in-place without touching React state.
  - Exposes `applyColors()` for initial map load.

- `OverlayControls` (component)
  - GPS locate button + loading state.
  - Location error toast.
  - Future: search input or other small controls.

- Existing components (keep as-is, just relocate imports):
  - `PinForm` (add/edit), `DeleteConfirmationModal`, `PhotoLightbox`.
  - `popupHtml.js` remains the popup HTML builder.

- Utilities
  - `map/palettes.ts` or `.js`: `SKIN_SCHEMES`, `CONTRAST_SCHEMES`.
  - `map/footprintIcon.ts` or `.js`: `buildFootprintHTML()`.
  - `map/popupEvents.ts` or `.js`: attach/detach delegated popup handlers.

## File Layout (after refactor)

```
src/
  Pages/
    TravelPins/
      index.jsx                 # Slim orchestrator (page container)
      TravelPinsMap.jsx         # Map shell (uses useMapboxMap)
      MarkersLayer.jsx          # Imperative marker management (uses useMarkers)
      hooks/
        useMapboxMap.js
        useMarkers.js
        useProximityColors.js
      utils/
        palettes.js             # SKIN_SCHEMES, CONTRAST_SCHEMES
        footprintIcon.js        # buildFootprintHTML
        popupEvents.js          # delegated popup action wiring
      components/
        PinForm.jsx             # existing
        DeleteConfirmationModal.jsx
        PhotoLightbox.jsx
        OverlayControls.jsx     # locate button + toast
      popupHtml.js              # existing
```

## Step-by-Step Plan (Incremental, Verifiable)

### TODOs (Mark as completed as we proceed)

- [x] **Phase 1: Extract Utilities** ✅ COMPLETED
  - [x] Extract palettes + footprint icon to `utils/`
  - [x] Extract popup events wiring to `utils/`
  - [x] Extract color management utilities
  - [x] Extract popup HTML building utilities
  - [x] Extract markdown and styling utilities

- [x] **Phase 2: Extract Custom Hooks** ✅ COMPLETED  
  - [x] Extract marker factory + popups into a hook (`useMapManager`)
  - [x] Implement markers lifecycle management (integrated in `useMapManager`)
  - [x] Create map initialization hook (`useMapManager`) 
  - [x] Move map init/handlers into hooks
  - [x] Extract popup state management (`usePopupManager`)
  - [x] Extract form state management (`useFormState`)
  - [x] Extract geolocation functionality (`useGeolocation`)

- [x] **Phase 2.4: Map Management Hook** ✅ COMPLETED
  - [x] Create comprehensive `useMapManager` hook
  - [x] Extract ~100+ lines of map management code from main component
  - [x] Add comprehensive test coverage (30 tests)
  - [x] Implement defensive error handling for runtime issues

- [x] **Phase 3: Extract UI Components** ✅ COMPLETED
  - [x] Extract `OverlayControls` (locate button + toast) 
  - [x] Create reusable UI components from inline JSX

- [ ] **Phase 4: Main Component Restructure**
  - [ ] Slim page container to orchestrator role (<400 lines)
  - [ ] Clean up remaining inline code and improve organization

- [ ] **Phase 5: Final Integration & Polish**
  - [ ] Add `useProximityColors` optimization (if needed)
  - [ ] Verify UX/performance; finalize refactor
  - [ ] Comprehensive manual testing

## Acceptance Criteria

- Feature parity: All existing actions (create/edit/delete/copy/open-photo) work.
- Mobile UX: Centered popup scrollable; map gestures disabled when modal open; ESC behavior consistent.
- No render loops; no console errors.
- Nearby markers recolor distinctly post pan/zoom; isolated markers keep skin tone.
- `index.jsx` reduced to a thin orchestrator (<300–400 lines, primarily JSX and handlers).

## Risks & Mitigations

- Imperative/React boundaries: Keep marker and popup logic inside hooks/components that own refs to avoid accidental state updates.
- Event leaks: Centralize add/remove logic (popupEvents utils) and ensure cleanup on close/unmount.
- Regression on auth/UI toggles: Retain `applyAuthButtonsVisibility` integration in popup open/refresh.

## Rollout Strategy

- Phase-by-phase PRs (Steps 1–8), verifying at each step.
- Add quick manual checks per Acceptance Criteria.
- Optional: behind a feature flag if needed, but expected to be safe without one.

## Follow-ups (Optional)

- Consider migrating to Mapbox symbol layers for massive datasets (with clustering).
- Add unit tests for palette assignment and popup event wiring.
- Add e2e smoke test for add/edit/delete flows.

## Process & Guidelines

- On completing any step, immediately update this checklist and mark the item as completed.
- Keep exactly one step in progress at a time for clarity.
- Make small, verifiable commits/patches per step; avoid unrelated changes.
- Preserve functional parity after each step; validate before moving on.
- Update this plan if scope or ordering needs to change, explaining rationale.
