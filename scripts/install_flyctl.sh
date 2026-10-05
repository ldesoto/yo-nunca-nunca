#!/usr/bin/env bash
# Installs flyctl to ~/.fly/bin (official installer). Re-run safe.
set -euo pipefail

if command -v flyctl >/dev/null 2>&1; then
  echo "flyctl already installed: $(command -v flyctl)"
  flyctl version
  exit 0
fi

curl -L https://fly.io/install.sh | sh
echo
echo "Add to PATH (zsh):"
echo '  export FLYCTL_INSTALL="$HOME/.fly"'
echo '  export PATH="$FLYCTL_INSTALL/bin:$PATH"'
