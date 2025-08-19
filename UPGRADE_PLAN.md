# Package Upgrade Plan - My Blog Frontend

## Overview
This document tracks the comprehensive package upgrade plan for the blog frontend project. Each upgrade follows a standardized 8-step process to ensure safety and functionality preservation.

## Workflow Pattern (Applied to Each Package)
1. **Backup**: Create dedicated backup branch 
2. **Research**: Analyze breaking changes from official docs
3. **Scan**: Find all usage patterns in codebase
4. **Upgrade**: Install new package version
5. **Refactor**: Fix breaking changes and update code
6. **Auto Test**: Run test suite, lint, and build (with proper container management)
7. **Manual Test**: Show affected pages for verification
8. **Confirmation**: Wait for approval before next upgrade

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

### Phase 0.5: CRITICAL - Vite Migration (Build System Overhaul)
**CRITICAL**: React 19.1.1 is incompatible with react-scripts 5.0.1 - requires complete build system migration

#### Step-by-Step Vite Migration Process:
- [ ] Create backup branch for Vite migration
- [ ] Research Vite breaking changes and compatibility requirements
- [ ] Scan codebase for all react-scripts dependencies and configurations
- [ ] Create detailed migration checklist for 11 affected files
- [ ] Remove react-scripts dependencies
- [ ] Install Vite and required plugins
- [ ] Create vite.config.js with proper configuration
- [ ] Move and update index.html (public/ → root)
- [ ] Rename and update src/index.js → src/main.jsx
- [ ] Update all environment variable usage (process.env → import.meta.env)
- [ ] Update package.json scripts and dependencies
- [ ] Update Docker configuration for Vite compatibility
- [ ] Fix any import/path issues that arise
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Test development server works (yarn dev)
- [ ] Test production build works (yarn build)
- [ ] Test all environment configurations (.env.local, .env.production)
- [ ] Verify hot reload functionality
- [ ] Run comprehensive test suite
- [ ] Show affected pages/functionality to user for manual testing
- [ ] Wait for user manual testing confirmation

**Risk Level**: VERY HIGH (Complete build system change)
**Affected Areas**: Entire build system, all file imports, environment variables, Docker setup, all testing workflows
**Manual Test Focus**: Complete application functionality, development workflow, build process, deployment

### Phase 1: gh-pages Upgrade (4.0.0 → 6.3.0) - Security Fix
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (4.0.0 → 6.3.0)
- [ ] Scan codebase for gh-pages usage patterns
- [ ] Perform package upgrade (yarn add gh-pages@^6.3.0)
- [ ] Check for breaking changes and refactor affected code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d` 
- [ ] Run automated tests (test, lint, build, deploy)
- [ ] Show affected pages/functionality to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: Deployment scripts
**Manual Test Focus**: Deployment process

### Phase 2: React Query Upgrade (5.85.3 → 5.85.5) - Minor Update
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (5.85.3 → 5.85.5)
- [ ] Scan codebase for React Query usage patterns
- [ ] Perform package upgrade
- [ ] Check for breaking changes and refactor affected code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show affected pages/functionality to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: Data fetching, API calls
**Manual Test Focus**: All pages with data loading

### Phase 3: Testing Libraries Upgrade - Medium Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (@testing-library packages)
- [ ] Scan codebase for testing library usage patterns
- [ ] Perform package upgrades
- [ ] Check for breaking changes and refactor test files
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show test results to user for verification
- [ ] Wait for user manual testing confirmation

**Affected Areas**: Test files only
**Manual Test Focus**: Verify test results

### Phase 4: Utility Libraries Upgrade - Medium Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (query-string, uuid, web-vitals)
- [ ] Scan codebase for utility library usage patterns
- [ ] Perform package upgrades
- [ ] Check for breaking changes and refactor affected code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show affected pages/functionality to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: URL handling, ID generation, performance
**Manual Test Focus**: Navigation, form submissions

### Phase 5: Mermaid Upgrade (10.9.3 → 11.10.0) - Medium Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (10.9.3 → 11.10.0)
- [ ] Scan codebase for Mermaid usage patterns
- [ ] Perform package upgrade (yarn add mermaid@^11.10.0)
- [ ] Check for breaking changes and refactor affected code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show affected pages with diagrams to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: Diagram rendering in posts
**Manual Test Focus**: Posts with diagrams/charts

### Phase 6: React Icons Upgrade (4.12.0 → 5.5.0) - Medium Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (4.12.0 → 5.5.0)
- [ ] Scan codebase for React Icons usage patterns
- [ ] Perform package upgrade (yarn add react-icons@^5.5.0)
- [ ] Check for breaking changes and refactor affected code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show all pages with icons to user for visual verification
- [ ] Wait for user manual testing confirmation

**Affected Areas**: All UI icons
**Manual Test Focus**: Visual verification of all pages

### Phase 7: Headless UI Upgrade (1.7.19 → 2.2.7) - High Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (1.7.19 → 2.2.7)
- [ ] Scan codebase for Headless UI component usage
- [ ] Perform package upgrade (yarn add @headlessui/react@^2.2.7)
- [ ] Check for breaking changes and refactor affected components
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show pages with dropdowns/modals/dialogs to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: Dropdowns, modals, interactive components
**Manual Test Focus**: All interactive UI elements

### Phase 8: React Router Upgrade (6.30.1 → 7.8.1) - High Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (6.30.1 → 7.8.1)
- [ ] Scan codebase for React Router usage patterns
- [ ] Perform package upgrade (yarn add react-router-dom@^7.8.1)
- [ ] Check for breaking changes and refactor routing code
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show all navigation/routing functionality to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: All routing and navigation
**Manual Test Focus**: Complete site navigation flow

### Phase 9: React Markdown Upgrade (8.0.7 → 10.1.0) - Very High Risk
- [ ] Create backup branch for this upgrade
- [ ] Research breaking changes (8.0.7 → 10.1.0)
- [ ] Scan codebase for React Markdown usage and custom renderers
- [ ] Perform package upgrade with related plugins
- [ ] Check for breaking changes and refactor markdown components
- [ ] Stop containers: `docker-compose down`
- [ ] Start fresh: `docker-compose up -d`
- [ ] Run automated tests (test, lint, build)
- [ ] Show all pages with markdown content to user for manual testing
- [ ] Wait for user manual testing confirmation

**Affected Areas**: All markdown content rendering
**Manual Test Focus**: All posts, markdown content, code blocks

### Final Phase: Verification and Cleanup
- [ ] Run comprehensive test suite on all upgrades
- [ ] Performance comparison with baseline
- [ ] Security audit verification
- [ ] Create upgrade documentation and lessons learned
- [ ] Clean up temporary branches and finalize changes

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

**If any upgrade fails:**
1. `docker-compose down`
2. `git checkout [backup-branch-name]`
3. `docker-compose up -d`
4. `docker-compose exec app yarn install`
5. Test functionality restoration
6. Reassess upgrade approach

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

**Last Updated**: 2025-08-19
**Current Phase**: Phase 0.5 (Vite Migration) - Ready to Start
**Next Action**: Begin systematic Vite migration with full backup and testing protocol