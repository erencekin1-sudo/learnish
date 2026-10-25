#!/bin/bash
# Kelime Otomasyonu - Günün Kelimelerini Hemen Gönder ve İlerlemeyi Kaydet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/kelime_gonderici.py" --now
