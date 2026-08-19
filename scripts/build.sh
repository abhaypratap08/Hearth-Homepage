#!/bin/bash
set -e

EXTENSION_DIR="$(cd "$(dirname "$0")/../extension" && pwd)"
STORE_DIR="$(cd "$(dirname "$0")/../store" && pwd)"

echo "=== Building Hearth extension packages ==="
mkdir -p "$STORE_DIR"/{chrome,firefox,edge}
rm -f "$STORE_DIR/chrome/hearth-chrome.zip"

cd "$EXTENSION_DIR"
zip -r "$STORE_DIR/chrome/hearth-chrome.zip" . \
  -x "*.git*" "store/*" "docs/*" "*.md"
echo "  -> store/chrome/hearth-chrome.zip"

for browser in firefox edge; do
  cp "$STORE_DIR/chrome/hearth-chrome.zip" "$STORE_DIR/$browser/hearth-$browser.zip"
  echo "  -> store/$browser/hearth-$browser.zip"
done

echo ""
echo "=== Build complete ==="
echo "Chrome/Brave/Opera: store/chrome/hearth-chrome.zip"
echo "Firefox:            store/firefox/hearth-firefox.zip"
echo "Edge:               store/edge/hearth-edge.zip"
