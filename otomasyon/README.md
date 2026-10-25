# 📚 5. Sınıf İngilizce - Maarif Modeli Günlük Kelime Otomasyonu

Bu otomasyon, **5. Sınıf İngilizce (Ünite 1: School Life)** kelimelerini her gün 10'ar adet sırayla alarak her sabah saat **06:30**'da e-posta adresinize şık bir bülten formatında iletir.

---

### ⚙️ Sistem Özellikleri
- **Gönderici:** `Erenlearn@gmail.com`
- **Alıcı:** `Erencekin1@gmail.com`
- **Gönderim Saati:** Her sabah `06:30` (macOS `launchd` arka plan servisi)
- **Kelime Dağılımı:** Günde 10 kelime (Toplam 114 kelime, 12 günde tamamlanır).
- **Format:** Türkçe anlamları, türleri, kategorileri ve ilerleme çubuğu içeren modern HTML bülteni.
- **Döngü Yönetimi:** Ünite bittiğinde otomatik olarak sıfırlanıp 2. döngüye geçer ve hiçbir kelime kaçırılmaz.

---

### 🚀 Hızlı Komutlar (Terminal)

Klasör içindeki yardımcı betikleri tek tıkla veya terminalden çalıştırabilirsiniz:

```bash
# 1. Mevcut ilerleme durumunu ve servis durumunu gör
./durum.sh

# 2. Test amaçlı önizleme e-postası gönder (ilerlemeyi kaydetmez)
./test_gonder.sh

# 3. Günün kelimelerini hemen şimdi gönder ve bugünü tamamla
./hemen_gonder.sh

# 4. Sabah 06:30 otomatik servisini başlat
./servisi_baslat.sh

# 5. Otomatik servisi durdur / devre dışı bırak
./servisi_durdur.sh
```

---

### 📁 Dosya Yapısı
* `kelime_gonderici.py`: Kelimeleri okuyup e-postayı hazırlayan ve gönderen ana Python betiği.
* `.env`: E-posta ve şifre yapılandırma ayarları.
* `ilerleme.json`: Hangi kelimelerin gönderildiğini, son gönderim tarihini ve döngü sayısını tutan veri dosyası.
* `com.erenlearn.kelimeotomasyonu.plist`: Her sabah 06:30'da çalışmasını sağlayan macOS launchd yapılandırması.
* `otomasyon.log`: Gönderim geçmişi ve sistem kayıtları.
