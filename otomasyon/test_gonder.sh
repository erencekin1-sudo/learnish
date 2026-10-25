#!/bin/bash
# Kelime Otomasyonu - Test E-postası Gönder (İlerlemeyi Değiştirmez)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/kelime_gonderici.py" --preview
