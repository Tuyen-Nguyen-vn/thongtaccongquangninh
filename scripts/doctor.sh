#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

print_section "Doctor dự án thongtaccongquangninh"
check_command git
check_command bash
check_command make
check_command rg
check_command fzf
check_command node "Node" "node -v"
check_command python3 "Python3" "python3 --version"
check_command docker "Docker" "docker --version"

print_section "Kiểm tra file workflow"
for file in \
  "$PWD/AGENTS.md" \
  "$PWD/CODEX_CONTEXT.md" \
  "$PWD/TASKS.md" \
  "$PWD/docs/PROJECT_STATE.md" \
  "$PWD/docs/SEO_CHECKLIST.md"; do
  if [[ -f "$file" ]]; then
    echo "OK   $(basename "$file")"
  else
    echo "MISS $(basename "$file")"
  fi
done
