# TO DO

## Travel Pins Issues

### Z-Index Management
- **Travel pin marker z-index should be lower than modals**
  - **Issue**: Pin markers may appear above modal overlays, creating visual layering conflicts
  - **Priority**: Medium
  - **Status**: Completed
  - **Solution**: Adjusted marker hover z-index to stay below overlays
    - Modals remain at higher z-index (e.g., z-[9999], overlays ~z-[950])
    - Marker default z-index stays low; hover z-index reduced below overlay
  - **Files**: `src/Pages/TravelPins/index.jsx`
  - **Acceptance**: Hovering markers never visually overrun modal/overlay

### Testing Infrastructure
- **Decide test strategy for Mapbox-dependent UI**
  - **Options**:
    - Minimal adapter seam in source to enable deterministic mocking in unit/integration tests.
    - Or move popup + modal flows to E2E (Playwright/Cypress).
  - **Priority**: High (to stabilize current flaky page tests)
  - **Status**: Pending decision
  - **Notes**: Unit tests already mock `mapbox-gl`; adapter seam would improve determinism.

### Page-Level Tests (Travel Pins)
- **Popup delegated actions** (unit/integration)
  - Copy: clipboard write + UI revert with timers
  - Open photo: lightbox opens and ESC (capture) closes
  - Edit: prefilled form; ESC with changes shows unsaved dialog; confirm/keep paths
  - Delete: confirm/cancel; cancel restores popup
  - Close button: removes popup and restores map interactions
- **ESC behaviors**
  - Delete modal ESC closes modal
  - Photo modal ESC uses capture and blocks others
  - Display popup ESC closes all when no modals open; ignore when search input focused
- **Map mechanics and policy**
  - Zoom delta ≥ 0.1 closes open popups
  - Mobile single-popup policy keeps most recent only
  - Marker click doesn’t open form; map background click opens form
  - Custom popup style tag injected/removed
- **Navbar integration**
  - `travelPinsLocationSelect` fly-to + history (<=5, dedup)
- **Geolocation flows**
  - Success fly-to + loading/reset; error variants
- **Clipboard fallback**
  - `clipboard.writeText` reject → fallback `execCommand('copy')` still shows success UI
- **Body scroll lock**
  - Active during photo modal or popup overlay; released on close

Suggested test files:
- `src/Pages/TravelPins/__tests__/popup.interactions.test.jsx`
- `src/Pages/TravelPins/__tests__/esc.behaviors.test.jsx`
- `src/Pages/TravelPins/__tests__/map.behavior.test.jsx`

Execution notes:
- Always restart before tests: `docker compose restart`
- Filter tests for speed: `docker compose exec app yarn test <path>`; name filter: `-t "<pattern>"`
