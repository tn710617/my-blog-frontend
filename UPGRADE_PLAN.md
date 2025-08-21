# Package Upgrade Plan - My Blog Frontend

## Overview
This document tracks the comprehensive package upgrade plan for the blog frontend project. Each upgrade follows a standardized 8-step process to ensure safety and functionality preservation.

## Git Branching Strategy

### Branch Hierarchy
```
main (production)
└── upgrade (main upgrade branch)
    ├── upgrade-phase-1-gh-pages
    ├── upgrade-phase-2-react-query  
    ├── upgrade-phase-3-testing-libraries
    ├── upgrade-phase-4-utilities
    ├── upgrade-phase-5-mermaid
    ├── upgrade-phase-6-react-icons
    ├── upgrade-phase-7-headless-ui
    ├── upgrade-phase-8-react-router
    └── upgrade-phase-9-react-markdown
```

### Branch Descriptions
- **`main`** - Production branch (stable)
- **`upgrade`** - Main upgrade branch (integrates all upgrade phases)
- **`upgrade-phase-N-package-name`** - Individual upgrade phase branches
- **`vite-migration`** - Completed Vite migration (can be merged to `upgrade` as starting point)

### Setup Process
1. Create main upgrade branch: `git checkout -b upgrade vite-migration`
2. For each phase: `git checkout -b upgrade-phase-N-package-name upgrade`
3. After phase completion: Merge back to `upgrade`
4. Final step: Merge `upgrade` to `main`

### Workflow Pattern (Applied to Each Package)
1. **Branch**: Create phase-specific branch from `upgrade` branch
2. **Research**: Analyze breaking changes from official docs  
3. **Scan**: Find all usage patterns in codebase
4. **Upgrade**: Install new package version
5. **Refactor**: Fix breaking changes and update code
6. **Auto Test**: Run test suite, lint, and build (with proper container management)
7. **Manual Test**: Show affected pages for verification
8. **Merge**: After approval, merge phase branch to `upgrade` branch
9. **Cleanup**: Delete phase branch after successful merge

### Container Management for Builds
**Important**: Before running any build command:
1. Stop development server: `docker-compose down`
2. Start fresh container: `docker-compose up -d`
3. Run build: `docker-compose exec app yarn run build`
4. This prevents conflicts between dev server and build process

## Progress Tracking

### Phase 0: Baseline Setup
- [x] Create backup branch (backup-pre-upgrade)
- [x] Document current package versions (yarn list)
- [x] Run comprehensive baseline tests (test, lint, build) - **BUILD FAILED**
- [ ] Create functional testing checklist document

### Phase 0.5: CRITICAL - Vite Migration (Build System Overhaul) ✅ **COMPLETED**
**CRITICAL**: React 19.1.1 is incompatible with react-scripts 5.0.1 - requires complete build system migration

#### Step-by-Step Vite Migration Process:
- [x] Create backup branch for Vite migration
- [x] Research Vite breaking changes and compatibility requirements
- [x] Scan codebase for all react-scripts dependencies and configurations
- [x] Create detailed migration checklist for 11 affected files
- [x] Remove react-scripts dependencies
- [x] Install Vite and required plugins
- [x] Create vite.config.js with proper configuration
- [x] Move and update index.html (public/ → root)
- [x] Rename and update src/index.js → src/main.jsx
- [x] Update all environment variable usage (process.env → import.meta.env)
- [x] Update package.json scripts and dependencies
- [x] Update Docker configuration for Vite compatibility
- [x] Fix any import/path issues that arise
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Test development server works (yarn dev)
- [x] Test production build works (yarn build)
- [x] Test all environment configurations (.env.local, .env.production)
- [x] Verify hot reload functionality
- [x] Run comprehensive test suite (Jest → Vitest migration)
- [x] Show affected pages/functionality to user for manual testing
- [x] Wait for user manual testing confirmation
- [x] **BONUS**: Fixed layout issues (PostCSS/Tailwind compilation)
- [x] **BONUS**: Fixed CSRF token authentication (Axios withXSRFToken configuration)

**Risk Level**: VERY HIGH (Complete build system change)
**Affected Areas**: Entire build system, all file imports, environment variables, Docker setup, all testing workflows
**Manual Test Focus**: Complete application functionality, development workflow, build process, deployment

### Phase 1: gh-pages Upgrade (4.0.0 → 6.3.0) - Security Fix ✅ **COMPLETED**
**Branch**: `upgrade-phase-1-gh-pages`
- [x] Create branch: `git checkout -b upgrade-phase-1-gh-pages upgrade`
- [x] Research breaking changes (4.0.0 → 6.3.0)
- [x] Scan codebase for gh-pages usage patterns
- [x] Perform package upgrade (yarn add gh-pages@^6.3.0)
- [x] Check for breaking changes and refactor affected code
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d` 
- [x] Run automated tests (test, lint, build, deploy)
- [x] Show affected pages/functionality to user for manual testing
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-1-gh-pages`
- [x] Delete phase branch: `git branch -d upgrade-phase-1-gh-pages`

**Affected Areas**: Deployment scripts
**Manual Test Focus**: Deployment process
**Result**: Successfully upgraded with no breaking changes (devDependency only)

### Phase 2: React Query Upgrade (5.85.3 → 5.85.5) - Minor Update ✅ **COMPLETED**
**Branch**: `upgrade-phase-2-react-query`
- [x] Create branch: `git checkout -b upgrade-phase-2-react-query upgrade`
- [x] Research breaking changes (5.85.3 → 5.85.5)
- [x] Scan codebase for React Query usage patterns
- [x] Perform package upgrade
- [x] Check for breaking changes and refactor affected code
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Run automated tests (test, lint, build)
- [x] Show affected pages/functionality to user for manual testing
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-2-react-query`
- [x] Delete phase branch: `git branch -d upgrade-phase-2-react-query`

**Affected Areas**: Data fetching, API calls
**Manual Test Focus**: All pages with data loading
**Result**: Successfully upgraded with stability improvements (promise handling & data consistency)

### Phase 3: Testing Libraries Upgrade - Medium Risk ✅ **COMPLETED**
**Branch**: `upgrade-phase-3-testing-libraries`
- [x] Create branch: `git checkout -b upgrade-phase-3-testing-libraries upgrade`
- [x] Research breaking changes (@testing-library packages)
- [x] Scan codebase for testing library usage patterns
- [x] Perform package upgrades (@testing-library/react 13.4.0 → 16.3.0, @testing-library/user-event 13.5.0 → 14.6.1)
- [x] Check for breaking changes and refactor test files
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Run automated tests (test, lint, build)
- [x] Show test results to user for verification
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-3-testing-libraries`
- [x] Delete phase branch: `git branch -d upgrade-phase-3-testing-libraries`

**Affected Areas**: Test files only
**Manual Test Focus**: Verify test results
**Result**: Successfully upgraded to latest Testing Library versions. No breaking changes affecting our test patterns (primarily uses fireEvent). Note: Pre-existing vi.mock syntax issues from Vitest migration remain for future resolution.

### Phase 4: Utility Libraries Upgrade - Medium Risk ✅ **COMPLETED**
**Branch**: `upgrade-phase-4-utilities`
- [x] Create branch: `git checkout -b upgrade-phase-4-utilities upgrade`
- [x] Research breaking changes (query-string, uuid, web-vitals)
- [x] Scan codebase for utility library usage patterns
- [x] Perform package upgrades (query-string 8.2.0 → 9.2.2, uuid 9.0.1 → 11.1.0, web-vitals 2.1.4 → 5.1.0)
- [x] Check for breaking changes and refactor affected code
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Run automated tests (test, lint, build)
- [x] Show affected pages/functionality to user for manual testing
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-4-utilities`
- [x] Delete phase branch: `git branch -d upgrade-phase-4-utilities`

**Affected Areas**: URL handling, ID generation, performance
**Manual Test Focus**: Navigation, form submissions
**Result**: Successfully upgraded all utility libraries. Updated web-vitals to use onINP instead of deprecated onFID. All API query parameters, UUID generation, and performance monitoring working correctly.

### Phase 5: Mermaid Upgrade (10.9.3 → 11.10.0) - Medium Risk ✅ **COMPLETED**
**Branch**: `upgrade-phase-5-mermaid`
- [x] Create branch: `git checkout -b upgrade-phase-5-mermaid upgrade`
- [x] Research breaking changes (10.9.3 → 11.10.0)
- [x] Scan codebase for Mermaid usage patterns
- [x] Perform package upgrade (yarn add mermaid@^11.10.0)
- [x] Check for breaking changes and refactor affected code
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Run automated tests (test, lint, build)
- [x] Show affected pages with diagrams to user for manual testing
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-5-mermaid`
- [x] Delete phase branch: `git branch -d upgrade-phase-5-mermaid`

**Affected Areas**: Diagram rendering in posts
**Manual Test Focus**: Posts with diagrams/charts
**Result**: Successfully upgraded to Mermaid v11.10.0. Enhanced error handling in MermaidComponent. All diagram rendering functionality tested and working correctly. No breaking changes required.

### Phase 6: React Icons Upgrade (4.12.0 → 5.4.0) - Medium Risk ✅ **COMPLETED**
**Branch**: `upgrade-phase-6-react-icons`
- [x] Create branch: `git checkout -b upgrade-phase-6-react-icons upgrade`
- [x] Research breaking changes (4.12.0 → 5.4.0)
- [x] Scan codebase for React Icons usage patterns
- [x] Perform package upgrade (yarn add react-icons@5.4.0)
- [x] Check for breaking changes and refactor affected code
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Run automated tests (test, lint, build)
- [x] Show all pages with icons to user for visual verification
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-6-react-icons`
- [x] Delete phase branch: `git branch -d upgrade-phase-6-react-icons`

**Affected Areas**: All UI icons
**Manual Test Focus**: Visual verification of all pages
**Result**: Successfully upgraded to React Icons v5.4.0 (avoided buggy v5.5.0). Major version upgrade with no breaking changes required. All icon sets (fa, md, ai, bs, bi, fc, gi, im, gr, ri) rendering correctly throughout the application.

### Phase 7: Headless UI Upgrade (1.7.19 → 2.2.7) - High Risk ✅ **COMPLETED**
**Branch**: `upgrade-phase-7-headless-ui`
- [x] Create branch: `git checkout -b upgrade-phase-7-headless-ui upgrade`
- [x] Research breaking changes (1.7.19 → 2.2.7)
- [x] Scan codebase for Headless UI component usage
- [x] Perform package upgrade (yarn add @headlessui/react@^2.2.7)
- [x] Check for breaking changes and refactor affected components
- [x] Stop containers: `docker-compose down`
- [x] Start fresh: `docker-compose up -d`
- [x] Run automated tests (test, lint, build)
- [x] Show pages with dropdowns/modals/dialogs to user for manual testing
- [x] Wait for user manual testing confirmation
- [x] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-7-headless-ui`
- [x] Delete phase branch: `git branch -d upgrade-phase-7-headless-ui`

**Affected Areas**: Dropdowns, modals, interactive components
**Manual Test Focus**: All interactive UI elements
**Result**: Successfully upgraded to Headless UI v2.2.7. Complete API migration performed on Modal.jsx component - updated to new component structure (DialogPanel, DialogTitle, TransitionChild) and migrated from class-based to data-attribute transitions. All modal functionality working correctly.

### Phase 8: React Router Upgrade (6.30.1 → 7.8.1) - High Risk
**Branch**: `upgrade-phase-8-react-router`
- [ ] Create branch: `git checkout -b upgrade-phase-8-react-router upgrade`
- [ ] Research breaking changes (6.30.1 → 7.8.1)
- [ ] Scan codebase for React Router usage patterns
- [ ] Perform package upgrade (yarn add react-router-dom@^7.8.1)
- [ ] Check for breaking changes and refactor routing code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show all navigation/routing functionality to user for manual testing
- [ ] Wait for user manual testing confirmation
- [ ] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-8-react-router`
- [ ] Delete phase branch: `git branch -d upgrade-phase-8-react-router`

**Affected Areas**: All routing and navigation
**Manual Test Focus**: Complete site navigation flow

### Phase 9: React Markdown Upgrade (8.0.7 → 10.1.0) - Very High Risk
**Branch**: `upgrade-phase-9-react-markdown`
- [ ] Create branch: `git checkout -b upgrade-phase-9-react-markdown upgrade`
- [ ] Research breaking changes (8.0.7 → 10.1.0)
- [ ] Scan codebase for React Markdown usage and custom renderers
- [ ] Perform package upgrade with related plugins
- [ ] Check for breaking changes and refactor markdown components
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show all pages with markdown content to user for manual testing
- [ ] Wait for user manual testing confirmation
- [ ] Merge to upgrade: `git checkout upgrade && git merge upgrade-phase-9-react-markdown`
- [ ] Delete phase branch: `git branch -d upgrade-phase-9-react-markdown`

**Affected Areas**: All markdown content rendering
**Manual Test Focus**: All posts, markdown content, code blocks

### Final Phase: Verification and Cleanup
**Branch**: `upgrade` (all phases merged)
- [ ] Run comprehensive test suite on all upgrades
- [ ] Performance comparison with baseline
- [ ] Security audit verification
- [ ] Create upgrade documentation and lessons learned
- [ ] Final merge to main: `git checkout main && git merge upgrade`
- [ ] Tag release: `git tag v1.0.0-upgraded`
- [ ] Clean up upgrade branch: `git branch -d upgrade`
- [ ] Celebrate successful upgrade! 🎉

## Manual Testing Checklist

**Key testing areas across upgrades:**
- 🏠 Homepage and post listings
- 📝 Post creation/editing forms  
- 🔍 Search and filtering
- 🧭 Navigation and routing
- 📱 Mobile responsiveness
- 🎨 Visual elements (icons, diagrams)
- 🔐 Authentication flow
- 📊 Performance and loading

## Rollback Procedures

### Phase-Level Rollback (If individual phase fails):
1. `docker-compose down`
2. `git checkout upgrade` (return to main upgrade branch)
3. `git branch -D upgrade-phase-N-package-name` (delete failed phase branch)
4. `docker-compose up -d`
5. `docker-compose exec app yarn install`
6. Reassess phase approach

### Complete Rollback (If upgrade branch has issues):
1. `docker-compose down`
2. `git checkout main` (return to stable production)
3. `docker-compose up -d`
4. `docker-compose exec app yarn install`
5. Test functionality restoration
6. Reassess entire upgrade strategy

### Branch Recovery:
- Each phase branch can be recreated from `upgrade` branch
- Vite migration changes are preserved in `vite-migration` branch
- Original state preserved in `main` branch

## Notes and Updates

### Known Issues:
- **CRITICAL: Build System Failure**: React 19.1.1 incompatible with react-scripts 5.0.1
  - Error: `'__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED' is not exported from 'react'`
  - Solution: Complete migration to Vite build system
- **Container Management**: Development server conflicts with build process - always run `docker-compose down` before builds
- **Test Failures**: Some tests fail due to react-router-dom import issues in test environment
- **Lint Warnings**: 11 ESLint warnings in current codebase (acceptable for baseline)

### Vite Migration Complexity:
- **11 files require modification**: package.json, index.html, main.jsx, vite.config.js, 3 env files, 4 source files
- **Environment variables**: All REACT_APP_ → VITE_ prefixes need dual compatibility
- **File structure**: HTML moves from public/ to root, index.js → main.jsx
- **Import syntax**: process.env → import.meta.env throughout codebase
- **Docker compatibility**: Development and build processes need verification

*Add additional notes about specific issues encountered, solutions found, or plan modifications here.*

---

**Last Updated**: 2025-08-20
**Current Phase**: Phase 8 (React Router Upgrade) - Ready to Start  
**Next Action**: Begin Phase 8 React Router upgrade following 9-step protocol