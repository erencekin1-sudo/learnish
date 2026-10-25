# ☁️ Google Apps Script (Bulut Otomasyonu) Kurulum Rehberi

Bu yöntem sayesinde **bilgisayarınız tamamen kapalı olsa bile** her sabah Google'ın kendi sunucuları kelimeleri `Erenlearn@gmail.com` üzerinden `Erencekin1@gmail.com` adresinize gönderir.

Kurulum sadece **2 dakikanızı** alır:

---

### Adım 1: Google Apps Script Sayfasına Gidin
1. Tarayıcınızda **`Erenlearn@gmail.com`** hesabınızın açık olduğundan emin olun.
2. [script.google.com](https://script.google.com) adresine gidin.
3. Sol üstteki **"Yeni Proje"** (+ New project) butonuna tıklayın.
4. Sol üstteki "Adsız proje" yazısına tıklayıp projenin adını **`5. Sınıf İngilizce Kelime Botu`** yapın.

---

### Adım 2: Kodu Yapıştırın
1. Editörde varsayılan olarak gelen `function myFunction() { ... }` kodunu tamamen silin.
2. Aynı klasördeki **[Google_Apps_Script_Kod.js](file:///Users/erencekin/Desktop/İntegral/Müfredatım/İdeal%20Öğretmenin%20Maarif%20Seti/5.%20Sınıf/İngilizce/Kelime%20Otomasyonu/Google_Apps_Script_Kod.js)** dosyasının **tüm içeriğini kopyalayıp** buraya yapıştırın.
3. Üstteki **Disk (Kaydet - 💾)** simgesine basın (veya `Cmd + S`).

---

### Adım 3: Test Edin (Önizleme Maili Alın)
1. Üstteki fonksiyon açılır menüsünden **`testGonder`** fonksiyonunu seçin.
2. Yanındaki **Çalıştır (Run - ▶️)** butonuna basın.
3. İlk çalıştırmada Google sizden **Yetkilendirme (İzin)** isteyecektir:
   - *"İzinleri İncele"* (Review permissions) butonuna tıklayın.
   - `Erenlearn@gmail.com` hesabınızı seçin.
   - Uyarı ekranı gelirse sol alttaki **"Gelişmiş" (Advanced)** linkine tıklayın.
   - En alttaki **"5. Sınıf İngilizce Kelime Botu (güvenli değil) adlı uygulamaya git"** yazısına tıklayın.
   - **"İzin Ver" (Allow)** butonuna tıklayın.
4. `Erencekin1@gmail.com` gelen kutunuzu kontrol edin, test maili hemen ulaşacaktır!

---

### Adım 4: Otomatik Sabah Görevini Aktif Edin (Tek Tıkla)
1. Üstteki fonksiyon menüsünden **`zamanlayiciyiKur`** fonksiyonunu seçin.
2. **Çalıştır (Run - ▶️)** butonuna basın.
3. **Bitti!** Google Cloud arka plan tetikleyicisi otomatik kuruldu. Artık her sabah 06:00 - 07:00 aralığında bilgisayarınız kapalı olsa bile 10'ar kelime sırayla iletilecektir.

---

### 💡 Ekstra Bilgiler
* **İlerlemeyi Başa Sarmak:** Üniteyi tekrar 1. kelimeden başlatmak isterseniz menüden **`ilerlemeyiSifirla`** fonksiyonunu seçip Çalıştır'a basmanız yeterlidir.
* **Tetikleyicileri Görmek:** Sol menüdeki **Saat simgesine (Tetikleyiciler - Triggers)** tıklayarak sabah alarmının kurulu olduğunu görebilirsiniz.
