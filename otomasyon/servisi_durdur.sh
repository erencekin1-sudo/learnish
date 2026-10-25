#!/bin/bash
# Kelime Otomasyonu - Servisi Durdur (launchd)

PLIST_NAME="com.erenlearn.kelimeotomasyonu.plist"
TARGET_DIR="$HOME/Library/LaunchAgents"

if [ -f "$TARGET_DIR/$PLIST_NAME" ]; then
    launchctl unload "$TARGET_DIR/$PLIST_NAME" 2>/dev/null
    rm -f "$TARGET_DIR/$PLIST_NAME"
    echo "🛑 Servis durduruldu ve kaldırıldı."
else
    echo "ℹ️ Servis zaten kurulu değil veya çalışmıyor."
fi
