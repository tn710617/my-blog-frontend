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
is_service_running() {
  local cid
  cid=$(dc ps -q "$SERVICE" 2>/dev/null || true)
  if [ -n "$cid" ]; then
    return 0
  fi
  return 1
}
exec_or_run() {
  if is_service_running; then
    exec_in_app "$@"
  else
    dc run --rm -T "$SERVICE" "$@"
  fi
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
    if is_service_running; then
      exec_in_app sh -lc "${*:-sh}"
    else
      dc run --rm -it "$SERVICE" sh -lc "${*:-sh}"
    fi
    ;;
  test)
    exec_or_run yarn test --watchAll=false
    ;;
  coverage)
    exec_or_run yarn test --coverage --watchAll=false
    ;;
  lint)
    exec_or_run yarn run lint
    ;;
  start)
    dc up
    ;;
  install)
    shift
    # usage: ./docker/dev.sh install <pkg> [--dev]
    if [[ "${2:-}" == "--dev" || "${2:-}" == "-D" ]]; then
      exec_or_run yarn add -D "$1"
    else
      exec_or_run yarn add "$1"
    fi
    ;;
  upgrade-plan)
    # Show available upgrades (does not change package.json)
    exec_or_run sh -lc "npx npm-check-updates"
    ;;
  upgrade-apply)
    # Apply upgrades to package.json using npm-check-updates, then install
    exec_or_run sh -lc "npx npm-check-updates -u && yarn install"
    ;;
  upgrade-apply-minor)
    # Safer apply: only minor/patch upgrades
    exec_or_run sh -lc "npx npm-check-updates -u -t minor && yarn install"
    ;;
  build-prod)
    exec_or_run yarn run build-production
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
  upgrade-apply-minor Apply only minor/patch upgrades with ncu -u -t minor
  build-prod         Production build using env.production

Environment:
  SERVICE=app        Override compose service name (default: app)
USAGE
    exit 1
    ;;
esac
