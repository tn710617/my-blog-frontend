# Travel Pins — Test Coverage Plan

This plan outlines end-to-end test coverage for the Travel Pins feature, aligned with this project’s testing stack and existing code structure.

## Tech Stack Summary (Project)
- Unit/Integration Runner: Vitest (`vitest`, `@vitest/ui`)
- DOM/React Utils: React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`)
- Test Environment: jsdom
- Network Mocking: MSW available (`msw`), plus direct `vi.mock()` patterns used in existing tests
- State/Data: TanStack React Query v5, Zustand stores
- i18n: `react-intl` (wrap components with `IntlProvider` in tests)
- Build/Run: `yarn test`, coverage via `yarn test --coverage --watch=false`

Recommended defaults for new tests:
- Prefer MSW in component/integration tests; keep `vi.mock('../useAxios')` style for hook unit tests.
- Provide a `QueryClientProvider` with retry disabled in tests.
- Provide `IntlProvider` with minimal messages used in the UI.

## Feature Scope Recap (Travel Pins)
- Display pins on a Mapbox map; marker click opens styled popup.
- Add/Edit/Delete pins (auth-only), with toast feedback and React Query cache updates.
- Copy location to clipboard from popup; render notes (Markdown), date, photo, attachments.
- Pin form modal for create/edit; delete confirmation modal; photo lightbox.
- Pin placement: click on map to place new pin; pins have hover effects.
- ESC key handling: closes modals with proper navigation flow and unsaved content warnings.
- Mobile/responsive behavior toggles classes/layout and auth-button visibility.
- Search/nav affordances shown when on `/travel-pins`.
- Geolocation ("locate me") flow with loading/error states.

## Coverage Goals
- Lines: ≥ 85% across `src/Pages/TravelPins/**` and `src/APIs/travel-pins.js`.
- Branches: Validate key conditionals (auth vs unauth, mobile vs desktop, fields present vs absent, success vs error paths).
- Behavior-first: Verify user-visible outcomes and cache side effects.

## Test Matrix by Layer

### 1) API Hooks (unit; existing + deltas)
Target: `src/APIs/travel-pins.js` with tests in `src/APIs/__tests__/travel-pins.test.js` (already present)
- useTravelPins
  - Success transforms: lat/lng → `[lng, lat]` coordinate array
  - Error path sets `isError` and preserves `error`
  - Stale/cache options respected (no retry in tests)
- useTravelPin (single)
  - Enabled only when `id` truthy; returns transformed pin
  - 404 → `isError` and toast not invoked here (hook-only)
- useCreateTravelPin
  - Auth required throws; 401 shows auth toast
  - 422 validation: multiple error messages surfaced via `toast.error`
  - Success: cache append and `invalidateQueries` on lists; success toast
- useUpdateTravelPin
  - Success: updates item in list, updates detail cache, invalidates lists + detail; success toast
  - 401, 403, 404, 422 each mapped to correct toasts
- useDeleteTravelPin
  - Success: removes from list cache, removes detail query, invalidates lists; success toast
  - 401, 403, 404 mapped to correct toasts
- Optimistic helpers
  - `addOptimisticPin`, `removeOptimisticPin`, `updateOptimisticPin` mutate cached list as expected

Approach: Continue `vi.mock('../useAxios')` and `vi.mock('../../stores')` pattern used in existing tests; add focused deltas for `useTravelPin` and optimistic helpers.

### 2) Utilities (unit)
Target: `src/Pages/TravelPins/popupHtml.js`
- buildPopupHTML
  - Renders title; includes visited date when `visited_at` present
  - Note section: included only when `note` present; Markdown rendered via injected `renderMarkdownToHTML`
  - Photo section: image markup present when `photo_url` provided; fallback container visible when image errors
  - Attachments section: renders count and pluralization when `photos.length > 0`
  - Copy button: `id="copy-btn-{id}"` and `data-action="copy"` present
  - Auth buttons container toggles classes based on `isLoggedIn`
  - Mobile vs desktop: container class switches sizes
  - Close, edit, delete button `data-action` attributes present

Approach: Pure function test with stubbed `t`, `formatDate`, `renderMarkdownToHTML` to assert key substrings/classes/attributes in the returned HTML string.

### 3) Components (unit)
Targets: `src/Pages/TravelPins/components/*`
- PinForm
  - Renders labels/placeholders via `t(...)`
  - Title required; entering text updates controlled value; submit calls `onSubmit` with preventDefault
  - Date field: visible text updates when underlying hidden date input value changes; clicking visible input triggers `showPicker`/focus on hidden input (guard for jsdom)
  - Photo URL (if present in form): updates field and included in submission
  - Cancel button triggers `onCancel`
- DeleteConfirmationModal
  - `open=false` renders null; `open=true` renders pin title, note excerpt, visited date formatted, and action buttons
  - Calls `onCancel` and `onConfirm`
- PhotoLightbox
  - `open=false` renders null; `open=true` renders image with alt text; close button triggers `onClose`

Approach: RTL + `userEvent` to simulate interactions; wrap with minimal `IntlProvider`.

### 4) Page-Level Integration (component)
Target: `src/Pages/TravelPins/index.jsx`
Mocking strategy:
- Mock `mapbox-gl` (Map, Marker, Popup) with test doubles capturing registrations (`on`, `addTo`, `setHTML`, etc.). Do not assert map visuals; assert interactions and side-effects.
- Use MSW (preferred) or mocked `useAxios` to provide network data for hooks.
- Mock `useLoginModalStore` and `useAuthStore` selectors.
- Spy on `navigator.clipboard.writeText` and `navigator.geolocation.getCurrentPosition` with success/error cases.

Scenarios:
- Initial render
  - With fetched pins, markers created and popup HTML set per pin; basic smoke asserts that `buildPopupHTML` output is wired to Popup HTML
  - Empty state renders gracefully (no crash)
- Open popup and copy location
  - Simulate marker click → popup HTML appears
  - Click copy button → clipboard called with “lng,lat”; success toast invoked
- Auth gating
  - isLoggedIn=false → auth buttons container has hidden class; clicking edit/delete in popup requests login via `setShowLoginModal(true)`
  - isLoggedIn=true → edit opens form prefilled; delete opens confirmation modal
- Pin placement and interaction
  - Map click places new pin at clicked coordinates
  - Pin hover effects display correctly
  - Pin click opens display modal with pin details
- Create pin flow
  - Simulate map click to add a new pin (if supported) or open "Add Pin" affordance
  - Fill form and submit → `useCreateTravelPin` mutation called with transformed payload; on success, toast and cache update reflected (new pin present)
- Edit pin flow
  - From popup, choose edit → form shows existing values; submit triggers `useUpdateTravelPin` with payload; success toast and cache mutation reflect updates
- Delete pin flow
  - Open delete modal; confirm → `useDeleteTravelPin` called; success toast and pin removed from view
- Photo lightbox
  - When popup has `photo_url`, clicking image opens lightbox; close works
- Geolocation
  - Click locate-me button: loading spinner shows; on success, map center updates (assert stubbed `flyTo` called); on error, error message/ toast shown
- ESC key behavior and modal navigation
  - Display modal: ESC key closes modal and returns to map view
  - Edit modal: ESC key closes edit modal and returns to display modal
  - Create modal (empty): ESC key closes create modal immediately
  - Create modal (with content): ESC key shows unsaved changes warning modal
  - Delete modal: ESC key closes delete modal and returns to display modal
  - Photo modal: ESC key closes photo modal and returns to display modal
- Responsive/mobile behavior
  - Toggle window width to simulate mobile; verify popup uses mobile classes; repeat a core interaction to ensure no regressions
- Error handling
  - useTravelPins error: displays an error fallback (or logs) but component remains stable

Notes:
- Where exact map events are difficult, assert calls into our stubs (e.g., `Popup#setHTML` called with string containing expected text).
- Use `vi.useFakeTimers()` to control debounced behaviors if tested; flush timers before assertions.
- ESC key testing: Use `fireEvent.keyDown(document, { key: 'Escape' })` to simulate ESC key presses.
- Pin hover testing: Use `fireEvent.mouseEnter` and `fireEvent.mouseLeave` on marker elements.

### 5) Navigation Affordances (light integration)
Targets: `src/Components/Nav/index.jsx`, `EnhancedMobileNav.jsx`, `TravelPinsButton.jsx`
- When route is `/travel-pins`, Travel Pins search bar renders
- Travel Pins button navigates to `/travel-pins` and shows active state when on that route

Approach: Render with MemoryRouter at `/travel-pins` and at a non-matching route to assert conditional UI.

## File Organization
- ✅ API hook tests: `src/APIs/__tests__/travel-pins.test.js` (added useTravelPin + optimistic helpers)
- ✅ Utilities: `src/Pages/TravelPins/__tests__/popupHtml.test.js` (COMPLETED)
- ✅ Components: 
  - ✅ `src/Pages/TravelPins/components/__tests__/PinForm.test.jsx` (COMPLETED - 19 tests)
  - ✅ `src/Pages/TravelPins/components/__tests__/DeleteConfirmationModal.test.jsx` (COMPLETED - 11 tests)
  - ✅ `src/Pages/TravelPins/components/__tests__/PhotoLightbox.test.jsx` (COMPLETED - 17 tests)
- ⏳ Page: `src/Pages/TravelPins/__tests__/index.test.jsx`
- ⏳ Nav: `src/Components/Nav/__tests__/TravelPinsNav.test.jsx`

## Test Data and Helpers
- Providers helper: factory that returns wrapper with `QueryClientProvider` (retry: false) and `IntlProvider` with minimal messages used by Travel Pins.
- Mapbox mock: lightweight classes for Map/Marker/Popup capturing `on`, `addTo`, `setLngLat`, `setHTML`, `addTo`, `remove`.
- i18n messages: only keys used in popup and forms.
- MSW handlers for `GET /travel-pins`, `GET /travel-pins/:id`, `POST /travel-pins`, `PUT /travel-pins/:id`, `DELETE /travel-pins/:id`.

## Risks & Mitigations
- Mapbox DOM complexity: mitigate with unit tests for `buildPopupHTML` and stubbing `mapbox-gl` in page tests.
- Flaky async/debounce: use fake timers and `waitFor` with clear expectations.
- Clipboard/geolocation APIs absent in jsdom: stub on `global.navigator` and restore post-test.

## Execution
- Run all tests: `yarn test`
- Coverage: `yarn test --coverage --watch=false`

## Milestones
1) ✅ API hook deltas (single pin + optimistic helpers) - COMPLETED
2) ✅ Utilities unit tests (popupHtml.js) - COMPLETED  
3) ✅ Components unit tests (PinForm, DeleteConfirmationModal, PhotoLightbox) - COMPLETED (47 tests)
4) Page-level integration with mapbox mock + MSW
5) Nav affordances
6) Coverage gap review and add missing branches

## Exit Criteria
- All critical flows covered (create/edit/delete/copy/geolocate/popup rendering)
- Pin interaction flows validated (placement, hover effects, modal navigation)
- ESC key behavior tested across all modal states with proper navigation flow
- Unsaved content warning system functioning correctly
- Branch conditions validated (auth, mobile, optional sections)
- Coverage thresholds met (≥ 85% lines in Travel Pins codepaths)
