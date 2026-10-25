#!/bin/bash
# Kelime Otomasyonu - Durum Görüntüleyici
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/kelime_gonderici.py" --status

echo ""
echo "🕒 Arka Plan Servis Durumu (launchd):"
if launchctl list | grep -q "com.erenlearn.kelimeotomasyonu"; then
    echo "🟢 Servis AKTİF. Her sabah 06:30'da çalışacak."
else
    echo "🔴 Servis şuan AKTİF DEĞİL. Başlatmak için: ./servisi_baslat.sh"
fi
