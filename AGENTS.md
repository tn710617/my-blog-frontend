# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (feature folders like `APIs/`, `Components/`, `Pages/`, `stores/`, `locales/`, `Images/`).
- Public assets: `public/`. Build output: `build/` (tarball at `build.tar.gz`).
- Tests: colocated `*.test.js` (e.g., `src/App.test.js`) and `__tests__/` folders (e.g., `src/stores/__tests__/`).

## Build, Test, and Development Commands
- Local dev: `yarn start` (uses `.env.local`).
- Build (dev): `yarn build`. Build (prod env): `yarn run build-production`.
- Tests: `yarn test` (watch). Coverage: `yarn test --coverage --watchAll=false`.
- Lint: `yarn run lint`.
- Docker dev (preferred): `docker-compose up`; run commands in container, e.g., `docker-compose exec app yarn test`.
- Deploy: `yarn run deploy` (see `scripts/deploy.sh`).

## Coding Style & Naming Conventions
- JavaScript (CRA + React 19). Use functional components and hooks.
- Indentation: 2 spaces; include semicolons; import order: libs → internal modules → styles.
- Components/files: PascalCase (e.g., `Components/Nav/`); helpers/hooks camelCase; Zustand stores named `useXxxStore`.
- Linting via CRA ESLint config (`react-app`). Fix or disable sparingly; prefer fixes.

## Testing Guidelines
- Frameworks: Jest + React Testing Library.
- Place tests next to code as `*.test.js` or under `__tests__/`.
- Keep SSR-safety tests passing (see `src/stores/__tests__/ssr-safety.test.js`).
- Favor user-centric queries (`getByRole`, `findByText`); include minimal mocks.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`) as used in history (upgrade/migration commits).
- PRs must include: clear description, linked issues, screenshots/GIFs for UI changes, test plan, and any env/config notes.
- Require: tests green, `yarn run lint` clean, successful build.

## Security & Configuration Tips
- Environment: provide `.env.local` for dev and `.env.production` for builds. For Docker, run `./docker/setup.sh` and prefer `host.docker.internal` for backend URLs.
- Common vars: `REACT_APP_API_URL`. Never commit secrets.
- Axios sends credentials; ensure server CORS allows `credentials` and correct origins.

