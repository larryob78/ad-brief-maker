#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install root dependencies
npm install

# Install client dependencies
cd packages/client
npm install
cd ../..

# Install server dependencies
cd packages/server
npm install
cd ../..

# Install shared package typescript (needed for builds)
cd packages/shared
npm install --save-dev typescript@^5.5.0
cd ../..
