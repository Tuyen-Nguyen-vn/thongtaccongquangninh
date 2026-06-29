#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/install.sh [--yes]

Cài công cụ cơ bản cho WSL/Linux, chuẩn hóa terminal và chạy doctor.
EOF
}

log() { printf '\n[%s] %s\n' "$1" "$2"; }
info() { log INFO "$1"; }
warn() { log WARN "$1"; }
err() { log ERR "$1" >&2; }

have() { command -v "$1" >/dev/null 2>&1; }
confirm() {
  [[ "${ASSUME_YES:-0}" == "1" ]] && return 0
  read -r -p "$1 [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}
install_pkg() { if have apt-get; then sudo apt-get update && sudo apt-get install -y "$@"; elif have dnf; then sudo dnf install -y "$@"; elif have yum; then sudo yum install -y "$@"; else err "Không tìm thấy apt/dnf/yum."; exit 1; fi; }

ensure_bash_aliases() {
  local aliases_file="$HOME/.bash_aliases"
  if [[ ! -f "$aliases_file" ]]; then
    cat >"$aliases_file" <<'EOF'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias c='clear'
alias ..='cd ..'
alias ...='cd ../..'
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline --decorate --graph --max-count=20'
EOF
  fi
}

ensure_shell_profile() {
  local profile="$1"
  local snippet_file="$2"
  local begin="# >>> ttcqn workflow >>>"
  local end="# <<< ttcqn workflow <<<"
  mkdir -p "$(dirname "$profile")"
  touch "$profile"
  grep -qF "$begin" "$profile" && return 0
  cat >>"$profile" <<EOF

$begin
if [ -f "$snippet_file" ]; then
  . "$snippet_file"
fi
$end
EOF
}

main() {
  ASSUME_YES=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --yes) ASSUME_YES=1 ;;
      -h|--help) usage; exit 0 ;;
      *) err "Tham số không hợp lệ: $1"; usage; exit 1 ;;
    esac
    shift
  done

  if ! confirm "Tiếp tục cài công cụ cho dự án này?"; then
    info "Đã hủy."
    exit 0
  fi

  install_pkg git curl wget ca-certificates build-essential unzip zip tar ripgrep fzf tmux python3 python3-pip python3-venv
  if ! have node; then
    if have apt-get; then
      curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
      sudo apt-get install -y nodejs
    else
      warn "Bỏ qua cài Node.js tự động trên distro này."
    fi
  fi

  ensure_bash_aliases
  ensure_shell_profile "$HOME/.bashrc" "$PWD/terminal/bashrc-snippet.sh"
  [[ -f "$HOME/.zshrc" ]] && ensure_shell_profile "$HOME/.zshrc" "$PWD/terminal/bashrc-snippet.sh"

  "$PWD/scripts/doctor.sh"
  info "Hoàn tất."
}

main "$@"
