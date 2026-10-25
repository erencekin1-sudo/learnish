# ☁️ Google Cloud Shell ile Mobilden (iPhone) Vibe-Coding Rehberi

Bu rehber sayesinde Mac bilgisayarınız **tamamen kapalıyken** bile iPhone'unuzdan Google Cloud üzerinden Learnish uygulamanızı geliştirebilir ve Vercel'e canlıya alabilirsiniz.

---

## 🚀 1. Adım: İlk Kurulum (Yalnızca 1 Kez Yapılır)

1. Tarayıcınızdan **[shell.cloud.google.com](https://shell.cloud.google.com)** adresine gidin (Google hesabınızla oturum açın).
2. Şartları onaylayıp devam edin. Google sizin için bulutta ücretsiz bir ortam hazırlayacaktır (~15 saniye).
3. Ekranda açılan siyah terminal ekranına şu **tek satırlık komutu** yapıştırıp Enter'a basın:

```bash
git clone https://github.com/ErenLearn/learnish.git && cd learnish
```

4. Üst araç çubuğundaki **"Editörü Aç" (Open Editor)** butonuna tıklayın.
5. Karşınıza bulutta çalışan tam donanımlı görsel kod editörü (VS Code altyapısı) gelecektir!

---

## 📱 2. Adım: iPhone'dan Kullanım (Mac Kapalıyken)

1. iPhone Safari'den **[shell.cloud.google.com](https://shell.cloud.google.com)** adresini açın.
2. Safari'den **"Paylaş" ➔ "Ana Ekrana Ekle"** diyerek telefonunuza `Google Cloud Shell` simgesi ekleyin.
3. Artık otobüste, okulda, yoldayken tek dokunuşla bulut geliştirme ortamınız açılır.

---

## ⚡ 3. Adım: Yapılan Değişikliği Canlıya Alma (Vercel'e İtme)

Bulutta herhangi bir dosyayı güncellediğinizde veya yapay zekaya kod yazdırdığınızda, terminale şu komutu yazmanız yeterlidir:

```bash
git add . && git commit -m "iPhone guncellemesi" && git push
```

**Sonuç:**
* Kodlar GitHub'a gider.
* Vercel 10 saniye içinde algılar ve iPhone'unuzdaki Learnish uygulamasını canlıda günceller!
