#!/usr/bin/env bash

set -euo pipefail

claude_bin="${CLAUDE_BIN:-$HOME/.local/bin/claude}"

if [[ ! -x "$claude_bin" ]]; then
  printf 'Claude Code CLI is not executable at %s\n' "$claude_bin" >&2
  exit 127
fi

args=()
for arg in "$@"; do
  # Spec Kit Assistant 0.1.4 emits legacy dotted commands, while current
  # Claude Code skills use hyphenated names.
  args+=("${arg//speckit./speckit-}")
done

exec "$claude_bin" --ax-screen-reader --no-chrome --model claude-opus-5 --effort high "${args[@]}"
