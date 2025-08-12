# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `yarn start` (uses .env.local with sourcemaps disabled)
- **Build for production**: `yarn run build-production` (uses .env.production)
- **Build for development**: `yarn run build`
- **Run tests**: `yarn test`
- **Lint code**: `yarn run lint`
- **Deploy**: `yarn run deploy` (runs custom deployment script)

## Architecture Overview

This is a React blog frontend built with Create React App. The application uses a modern React stack with:

- **State Management**: Recoil for global state management
- **Data Fetching**: TanStack React Query (v4) with Axios for API calls
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom scrollbar utilities
- **Internationalization**: React Intl with locale atoms
- **Rich Text**: Toast UI React Editor with markdown support

### Key Directory Structure

- `src/APIs/` - API client functions organized by domain (auth, posts, categories, tags)
- `src/Components/` - Reusable UI components (Nav, Footer, Modal, Layout, etc.)
- `src/Pages/` - Route-level page components (Posts, About, CreatePost, EditPost, SinglePost)
- `src/States/` - Recoil atoms for global state (locale, login, categories, pagination)
- `src/locales/` - i18n translation files (en.json, zh-TW.json)

### State Management Pattern

Uses Recoil atoms for:
- `localeAtom` - Current language/locale with localStorage persistence
- `loginAtom` - Authentication state
- `categoryAtom` - Selected category filtering
- `currentPageAtom` - Pagination state
- `postSortAtom` - Post sorting preferences

### API Integration

- Base API client in `src/APIs/axios.js` using environment variables
- API URL configured via `REACT_APP_API_URL` environment variable
- Credentials included for authentication (`withCredentials: true`)
- Organized by domain: `auth.js`, `posts.js`, `categories.js`, `tags.js`

### Authentication Flow

Protected routes use `ProtectedRoute` component wrapper. Authentication modal managed via `loginModalAtom` and rendered in the main `Layout` component.

### Deployment

Custom deployment script (`scripts/deploy.sh`) that:
1. Builds production version
2. Creates tarball
3. Deploys to remote server via SCP/SSH
4. Extracts and replaces live version

Environment files (.env.local, .env.production) are not tracked in git - ensure these exist for proper builds.