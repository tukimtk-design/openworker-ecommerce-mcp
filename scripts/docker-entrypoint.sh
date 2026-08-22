#!/bin/bash
set -e

# Start Xvfb in the background for headless browser support
echo "Starting Xvfb..."
Xvfb :99 -screen 0 1280x1024x24 &
export DISPLAY=:99

# Give Xvfb time to start
sleep 1

echo "Starting MCP Server..."
# Run the node process
exec node dist/index.js
