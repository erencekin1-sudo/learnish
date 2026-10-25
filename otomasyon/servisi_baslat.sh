#!/bin/bash
# Kelime Otomasyonu - Servisi Başlat (launchd)

PLIST_NAME="com.erenlearn.kelimeotomasyonu.plist"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/Library/LaunchAgents"

mkdir -p "$TARGET_DIR"

# Eski servis varsa durdur
launchctl unload "$TARGET_DIR/$PLIST_NAME" 2>/dev/null

# Plist dosyasını kopyala
cp "$SCRIPT_DIR/$PLIST_NAME" "$TARGET_DIR/$PLIST_NAME"

# Servisi yükle ve aktif et
launchctl load "$TARGET_DIR/$PLIST_NAME"

echo "✅ Servis başarıyla kuruldu ve başlatıldı!"
echo "⏰ Her sabah saat 06:30'da otomatik olarak kelime e-postası gönderilecek."
echo "📋 Servis durumu: $(launchctl list | grep com.erenlearn.kelimeotomasyonu || echo 'Aktif')"
