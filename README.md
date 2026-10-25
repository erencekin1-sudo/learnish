# 🌟 Learnish • 5. Sınıf Maarif İngilizce Ekosistemi

**Learnish**, 5. Sınıf Türkiye Yüzyılı Maarif Modeli müfredatına ve uluslararası CEFR standartlarına göre hazırlanmış **506 kelimelik** eksiksiz bir dijital öğrenme, otomasyon ve çalışma merkezidir.

---

## 📁 Klasör Mimarisi

```
Learnish/
├── 📱 Web Uygulaması & PWA (Kök Dizin)
│   ├── index.html                   -> Ana web uygulaması (Çift tıklayarak hemen açılır)
│   ├── app.css                      -> Modern glassmorphic tasarım sistemi
│   ├── app.js                       -> Web Speech telaffuz, ses sentezleyici ve test motoru
│   ├── words-data.js                -> 506 kelimelik çevrimdışı JavaScript veri tabanı
│   ├── Uygulamayı_Başlat.command    -> Tek tıkla Mac & Mobil Wi-Fi sunucusu başlatıcı
│   ├── manifest.json & worker       -> PWA çevrimdışı mobil yükleme yapılandırması
│   └── favicon, icon-192, icon-512  -> Uygulama logoları ve simgeleri
│
├── ⚙️ otomasyon/                    -> Günlük E-posta ve Arka Plan Görevleri
│   ├── Google_Apps_Script_Kod.js    -> Google Cloud (bilgisayar kapalıyken çalışan kod)
│   ├── Google_Apps_Script_Kurulum_Rehberi.md -> Adım adım Google kurulum rehberi
│   ├── kelime_gonderici.py          -> Yerel Python e-posta gönderici
│   ├── kelimeler_havuzu.json        -> 506 kelimelik birleşik JSON veri havuzu
│   ├── unite1_kelimeler.json        -> Ünite 1 kelime listesi
│   ├── .env                         -> E-posta ve SMTP kimlik bilgileri
│   ├── ilerleme.json                -> Günlük ilerleme ve gönderim geçmişi
│   ├── durum.sh                     -> Otomasyon durumunu gösteren terminal kısayolu
│   ├── test_gonder.sh               -> Test e-postası gönderen kısayol
│   ├── hemen_gonder.sh              -> Günün kelimelerini anında gönderen kısayol
│   └── servisi_baslat.sh            -> Mac launchd sabah 06:30 servisini başlatan kısayol
│
└── 📄 belgeler/                     -> PDF Kitapçıkları ve Kaynak Planlar
    ├── 2025-2026_Ingilizce_Kelime_Listesi_CEFR.pdf (11 Sayfa, CEFR A1-C2 sıralı)
    ├── 2025-2026_Ingilizce_Kelime_Listesi_Maarif_Tema_Sirali.pdf (11 Sayfa, 8 Tema sıralı)
    ├── 5. Sınıf İngilizce - Ünite 1 - School Life.xlsx
    └── İNGİLİZCE (2-8. SINIF) TASLAK YILLIK ÇERÇEVE PLAN.xlsx
```

---

## 🚀 Hızlı Başlangıç

### 1. Web Uygulamasını Çalıştırmak:
* **Bilgisayarda:** [index.html](file:///Users/erencekin/Desktop/İntegral/Learnish/index.html) dosyasına çift tıklayın.
* **Telefonda (iPhone/Android):** [Uygulamayı_Başlat.command](file:///Users/erencekin/Desktop/İntegral/Learnish/Uygulamayı_Başlat.command) dosyasını çalıştırın ve ekranda çıkan IP adresini aynı Wi-Fi'deki telefonunuzun tarayıcısına yazıp **"Ana Ekrana Ekle"** deyin.

### 2. E-posta Otomasyonunu Kontrol Etmek:
* `Learnish/otomasyon` klasöründeki [durum.sh](file:///Users/erencekin/Desktop/İntegral/Learnish/otomasyon/durum.sh) dosyasını terminalden `./durum.sh` ile çalıştırarak gönderim durumunu kontrol edebilirsiniz.
