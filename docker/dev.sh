#!/usr/bin/env bash
set -euo pipefail

# Simple helper to run common tasks inside Docker Compose service `app`.

SERVICE=${SERVICE:-app}

dc() {
  docker-compose "$@"
}

exec_in_app() {
  dc exec "$SERVICE" "$@"
}

case "${1:-}" in
  up)
    shift
    dc up "$@"
    ;;
  build)
    dc build --no-cache
    ;;
  shell)
    exec_in_app sh -lc "${*:-sh}"
    ;;
  test)
    exec_in_app yarn test --watchAll=false
    ;;
  coverage)
    exec_in_app yarn test --coverage --watchAll=false
    ;;
  lint)
    exec_in_app yarn run lint
    ;;
  start)
    dc up
    ;;
  install)
    shift
    # usage: ./docker/dev.sh install <pkg> [--dev]
    if [[ "${2:-}" == "--dev" || "${2:-}" == "-D" ]]; then
      exec_in_app yarn add -D "$1"
    else
      exec_in_app yarn add "$1"
    fi
    ;;
  upgrade-plan)
    # Show available upgrades (does not change package.json)
    exec_in_app sh -lc "npx npm-check-updates"
    ;;
  upgrade-apply)
    # Apply upgrades to package.json using npm-check-updates, then install
    exec_in_app sh -lc "npx npm-check-updates -u && yarn install"
    ;;
  build-prod)
    exec_in_app yarn run build-production
    ;;
  *)
    cat <<'USAGE'
Usage: docker/dev.sh <command>

Commands (run entirely inside Docker):
  up                 Start containers (same as docker-compose up)
  build              Rebuild containers with no cache
  shell [cmd]        Open shell or run a command in the app container
  test               Run Jest tests once (non-watch)
  coverage           Run Jest with coverage
  lint               Run ESLint
  start              Start dev server via docker-compose up
  install <pkg> [-D] Yarn add dependency (or dev dep)
  upgrade-plan       Show available dependency upgrades (ncu dry-run)
  upgrade-apply      Apply upgrades with ncu -u and yarn install
  build-prod         Production build using env.production

Environment:
  SERVICE=app        Override compose service name (default: app)
USAGE
    exit 1
    ;;
esac

