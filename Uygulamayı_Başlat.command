#!/bin/bash
# ==============================================================================
# 5. SINIF MAARİF İNGİLİZCE KELİME DÜNYASI - BAŞLATICI
# Çift tıklayarak hem bilgisayarınızda hem telefonunuzda açabilirsiniz.
# ==============================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Yerel IP adresini tespit et (Telefondan aynı Wi-Fi üzerinden bağlanmak için)
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")
PORT=8080

echo "================================================================="
echo " 📚 5. SINIF MAARİF İNGİLİZCE KELİME DÜNYASI BAŞLATILDI"
echo "================================================================="
echo "💻 Bilgisayarınızda Açılıyor: http://localhost:$PORT"
echo "📱 Cep Telefonunuzda Açmak İçin: http://$LOCAL_IP:$PORT"
echo "   (Telefonunuz aynı Wi-Fi ağına bağlıyken Safari/Chrome'a yazın)"
echo "================================================================="
echo "Uygulamayı durdurmak için bu Terminal penceresini kapatabilirsiniz."
echo ""

# Port meşgulse temizle
lsof -ti:$PORT | xargs kill -9 2>/dev/null

# Sunucuyu başlat ve tarayıcıda aç
python3 -m http.server $PORT &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT"

wait $SERVER_PID
