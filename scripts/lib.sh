#!/usr/bin/env bash
set -euo pipefail

print_section() { printf '\n== %s ==\n' "$1"; }

check_command() {
  local cmd="$1"
  local label="${2:-$1}"
  local version_cmd="${3:-}"

  if command -v "$cmd" >/dev/null 2>&1; then
    if [[ -n "$version_cmd" ]]; then
      local version
      version="$($version_cmd 2>/dev/null | head -n 1)"
      echo "OK   ${label}: ${version}"
    else
      echo "OK   ${label}"
    fi
  else
    echo "MISS ${label}"
  fi
}
