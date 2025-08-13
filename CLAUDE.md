# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Important**: This project uses Docker for development. All commands should be run through Docker containers.

### Docker Development (Primary)
- **Setup Docker environment**: `./docker/setup.sh` (creates .env.local with Docker-compatible settings)
- **Start Docker development**: `docker-compose up` (builds and starts container on port 3000)
- **Stop Docker containers**: `docker-compose down`
- **Rebuild Docker containers**: `docker-compose build`
- **Add packages**: `docker-compose exec app yarn add <package-name>`
- **Add dev packages**: `docker-compose exec app yarn add -D <package-name>`
- **Run tests**: `docker-compose exec app yarn test`
- **Run tests (watch mode)**: `docker-compose exec app yarn test --watchAll`
- **Run tests (coverage)**: `docker-compose exec app yarn test --coverage --watchAll=false`
- **Build for production**: `docker-compose exec app yarn run build-production`
- **Build for development**: `docker-compose exec app yarn run build`
- **Lint code**: `docker-compose exec app yarn run lint`
- **Run any command**: `docker-compose exec app <command>`

### Local Development (Alternative)
- **Start development server**: `yarn start` (uses .env.local with sourcemaps disabled)
- **Build for production**: `yarn run build-production` (uses .env.production)
- **Build for development**: `yarn run build`
- **Run tests**: `yarn test`
- **Lint code**: `yarn run lint`
- **Deploy**: `yarn run deploy` (runs custom deployment script)

## Architecture Overview

This is a React blog frontend built with Create React App. The application uses a modern React stack with:

- **State Management**: Zustand for global state management
- **Data Fetching**: TanStack React Query (v4) with Axios for API calls
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom scrollbar utilities
- **Internationalization**: React Intl with locale stores
- **Rich Text**: Toast UI React Editor with markdown support

### Key Directory Structure

- `src/APIs/` - API client functions organized by domain (auth, posts, categories, tags)
- `src/Components/` - Reusable UI components (Nav, Footer, Modal, Layout, etc.)
- `src/Pages/` - Route-level page components (Posts, About, CreatePost, EditPost, SinglePost)
- `src/stores/` - Zustand stores for global state (locale, auth, categories, pagination)
- `src/locales/` - i18n translation files (en.json, zh-TW.json)

### State Management Pattern

Uses Zustand stores for:
- `useLocaleStore` - Current language/locale with localStorage persistence
- `useAuthStore` - Authentication state
- `useCategoryStore` - Selected category filtering
- `usePaginationStore` - Pagination state
- `usePostSortStore` - Post sorting preferences
- `usePostTagsStore` - Tag filtering
- `useLoginModalStore` - Login modal visibility
- `useMetaMaskModalStore` - MetaMask installation modal

### API Integration

- Base API client in `src/APIs/axios.js` using environment variables
- API URL configured via `REACT_APP_API_URL` environment variable
- Credentials included for authentication (`withCredentials: true`)
- Organized by domain: `auth.js`, `posts.js`, `categories.js`, `tags.js`

### Authentication Flow

Protected routes use `ProtectedRoute` component wrapper. Authentication modal managed via `useLoginModalStore` and rendered in the main `Layout` component.

### Deployment

Custom deployment script (`scripts/deploy.sh`) that:
1. Builds production version
2. Creates tarball
3. Deploys to remote server via SCP/SSH
4. Extracts and replaces live version

### Docker Development Environment

The project includes Docker support for consistent development environments:

- **Dockerfile**: Multi-stage build with development and production targets
- **docker-compose.yml**: Development setup with hot reloading and volume mounting
- **Network Configuration**: Uses `host.docker.internal` to access backend API from container
- **Environment Setup**: `.env.docker.template` provides Docker-compatible environment variables

**Important**: For Docker development, the API URL must use `host.docker.internal` instead of `localhost` to access the backend server running on the host machine.

Environment files (.env.local, .env.production) are not tracked in git - ensure these exist for proper builds. Use `./docker/setup.sh` to create Docker-compatible environment files.