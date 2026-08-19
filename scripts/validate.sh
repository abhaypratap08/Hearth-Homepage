#!/bin/bash
set -e

EXTENSION_DIR="$(cd "$(dirname "$0")/../extension" && pwd)"

echo "=== Validating Hearth extension structure ==="
ERRORS=0

# Check required files
for f in manifest.json newtab.html css/style.css js/app.js js/browser-api.js js/storage.js; do
  if [ ! -f "$EXTENSION_DIR/$f" ]; then
    echo "MISSING: $f"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check icons
for s in 16 32 48 128; do
  if [ ! -f "$EXTENSION_DIR/icons/icon${s}.png" ]; then
    echo "MISSING: icons/icon${s}.png"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check manifest is valid JSON
if command -v python3 &> /dev/null; then
  if ! python3 -c "import json; json.load(open('$EXTENSION_DIR/manifest.json'))" 2>/dev/null; then
    echo "INVALID: manifest.json is not valid JSON"
    ERRORS=$((ERRORS + 1))
  else
    MV=$(python3 -c "import json; print(json.load(open('$EXTENSION_DIR/manifest.json'))['manifest_version'])")
    if [ "$MV" != "3" ]; then
      echo "WARNING: manifest_version is $MV, expected 3"
    fi
  fi
fi

# Check for eval/Function usage in JS files
echo ""
echo "Checking for security issues..."
if grep -rn "eval(" "$EXTENSION_DIR/js/" 2>/dev/null; then
  echo "WARNING: eval() found in JS files"
  ERRORS=$((ERRORS + 1))
fi
if grep -rn "new Function(" "$EXTENSION_DIR/js/" 2>/dev/null; then
  echo "WARNING: new Function() found in JS files"
  ERRORS=$((ERRORS + 1))
fi

# Check for remote scripts in HTML
if grep -n 'src="http' "$EXTENSION_DIR/newtab.html" 2>/dev/null; then
  echo "WARNING: Remote script src found in newtab.html"
fi

# Check for inline event handlers (potential CSP issues)
if grep -n 'onerror=\|onload=' "$EXTENSION_DIR/newtab.html" 2>/dev/null | grep -v 'img\|video' > /dev/null; then
  echo "NOTE: Inline event handlers found in HTML"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "=== Validation passed ==="
else
  echo "=== Validation failed with $ERRORS errors ==="
  exit 1
fi
