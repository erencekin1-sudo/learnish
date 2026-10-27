#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================================="
echo "🚀 Learnish Projesi Otomatik Olarak Canlıya Alınıyor..."
echo "=========================================================="
echo ""

# 1. Tüm güncellenen ve yeni dosyaları ekle
git add -A

# 2. Değişiklik varsa commit oluştur
if git diff --staged --quiet; then
    echo "ℹ️  Yeni bir değişiklik bulunamadı, mevcut kodlar zaten güncel."
else
    ZAMAN=$(date '+%d.%m.%Y %H:%M')
    COMMIT_MSG="feat: veritabani ve uygulama guncellemesi (817 kelime - $ZAMAN)"
    git commit -m "$COMMIT_MSG"
    echo "✅ Değişiklikler commit edildi: $COMMIT_MSG"
fi

# 3. GitHub'a Gönder (Vercel otomatik derler ve anında yayına alır)
echo ""
echo "📤 GitHub'a yükleniyor (Vercel otomatik yayına alacak)..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================================="
    echo "🎉 TEBRİKLER! Kodlar GitHub'a başarıyla yüklendi!"
    echo "⚡ Vercel yaklaşık 10-15 saniye içinde canlıda güncellenecektir."
    echo "🌐 Canlı siteniz güncel 817 kelimelik veritabanıyla hazır!"
    echo "=========================================================="
else
    echo ""
    echo "❌ Bir sorun oluştu. İnternet bağlantınızı kontrol edin."
fi
echo ""
read -p "Kapatmak için Enter'a basın..."
