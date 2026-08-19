#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXTENSION_DIR="$ROOT_DIR/extension"
STORE_DIR="$ROOT_DIR/store"

echo "=== Building Hearth extension packages ==="

mkdir -p "$STORE_DIR/chrome" "$STORE_DIR/firefox" "$STORE_DIR/edge"

rm -f "$STORE_DIR/chrome/hearth-chrome.zip"

cd "$EXTENSION_DIR"
zip -r "$STORE_DIR/chrome/hearth-chrome.zip" . \
  -x "*.git*" "store/*" "docs/*" "*.md"
cd "$ROOT_DIR"

echo "  -> store/chrome/hearth-chrome.zip"

for browser in firefox edge; do
  cp "$STORE_DIR/chrome/hearth-chrome.zip" "$STORE_DIR/$browser/hearth-$browser.zip"
  echo "  -> store/$browser/hearth-$browser.zip"
done

echo "=== Build complete ==="
echo "Chrome/Brave/Opera: store/chrome/hearth-chrome.zip"
echo "Firefox:            store/firefox/hearth-firefox.zip"
echo "Edge:               store/edge/hearth-edge.zip"
