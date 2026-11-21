# Kitaplık Sözlük — Tasarım Dokümanı

Tarih: 2026-11-21 · Durum: Onay bekliyor (kullanıcı kararları işlendi)
Mockup'lar: `.superpowers/brainstorm/9522-1795262463/content/` (shelf-navigation-v2.html seçenek B, open-book.html seçenek A)

## 1. Niyet ve neden

Learnish'in "Sözlük" sekmesi (`renderDirectoryView`, `app.js`) bugün bir arama kutusu, dört sıra filtre çipi ve sayfa başına 60 kartlık bir ızgaradan oluşuyor. İşlevsel ama yorucu: uzun bakınca göz yoruyor, kelimeye ulaşmak "filtre + sayfa numarası" işi.

Hedef, sözlüğü **etkileşimli bir kütüphaneye** çevirmek: her harf bir raf, her kelime sırtında adı yazan bir kitap, kitap açılınca anlamı. Kullanıcı parmağıyla harf çarkını çevirerek harfe, rafı kaydırarak kelimeye ulaşır. Deneyim **göz yormayan**, **estetik** ve **mevcut paletin dışına çıkmayan** olmalı.

## 2. Hedefler, kapsam dışı, başarısızlık sayılacaklar

**Hedefler**
- Sözlük sekmesi açılınca doğrudan kitaplık görünür; eski liste/ızgara ve sayfalama kalkar (yerini alır, yanında durmaz).
- Tek büyük raf = tek harf. Raf yatay kaydırılır.
- Alttaki **harf çarkı** parmakla çevrilerek harfler arasında geçilir.
- Kitaba dokununca **çift sayfa** açılır; sayfa çevirerek raftaki komşu kitaplara geçilir.
- Arama ve tüm mevcut filtreler korunur, rafın diline taşınır.
- Açık ve karanlık temada çalışır.

**Kapsam dışı**
- Yeni veri alanı eklemek veya kelime verisini (`words-data.js`) değiştirmek.
- Sözlük dışındaki ekranlar (günlük, flashcard, quiz, istatistik).
- Yeni bir çerçeve/kütüphane (React vb.) eklemek.

**Başarısızlık sayılır (çalışsa bile)**
- Palet dışı renk (ahşap kahvesi, parlak renkler vb.) veya kırmızının vurgu dışında kullanılması.
- Göz yoran hareket: uzun/3D dönen animasyonlar, sürekli hareket eden öğeler.
- Bir kelimeye ulaşmanın bugünkü aramadan daha yavaş olması.
- Mevcut bir filtrenin (CEFR, favoriler, tekrar, öğrenilenler, Maarif/YDS/Oxford, YDS kelime türü) kaybolması.
- Ekran okuyucu/klavye ile kullanılamaz hale gelmesi.

## 3. Kısıtlar ve veriden çıkan gerçekler

- **Yığın:** Saf JS + `app.css`, çevrimdışı PWA (`service-worker.js`), derleme yok. Yeni dosya eklenirse service worker önbellek listesine (`ASSETS_TO_CACHE`) girmeli.
- **Palet (yalnızca bunlar):** `--dp-color-ink #171e19`, `--dp-color-ink-muted #47524c`, `--dp-color-ink-subtle #899690`, `--dp-color-sage #b7c6c2`, `--dp-color-sand #d8d3c5`, `--dp-color-surface-subtle #f5f3ed`, `--dp-color-paper #eeebe3`, `#ffffff`, `--dp-color-red #ca0013` (yalnızca favori kurdelesi ve kritik vurgu). Yazı tipi Nunito. Köşe yarıçapları `DESIGN.md`'deki ölçekten.
- **Veri:** 9.994 kelime/kalıp. Harf başına dağılım dengesiz: S 1.070, C 1.046, A 799, P 773, D 649 … Q 27, Z 9. Harf olmayan başlangıçlar var ("1", "Ƒ").
- **Kelime uzunluğu:** medyan 8, %95'lik dilim 14, en uzun 68 karakter (kalıplar/ifadeler).
- **Kelime alanları:** `en, tr, phonetic, pos, cefr, definition, example, alt (eş anlam), isMaarif/isOxford/isYds, ydsExample`.
- **Karanlık mod:** `[data-theme="dark"]` ile mevcut.
- **Hareket:** Uygulama zaten `prefers-reduced-motion` kontrol ediyor (`app.js` ~6655, `app.css` ~7259).

## 4. Yaklaşımlar

| Yol | Özet | Artı | Eksi |
|---|---|---|---|
| **1. DOM + parça parça yükleme** *(seçilen)* | Her kitap gerçek bir öğe; raf doğal yatay kaydırma + scroll-snap; kitaplar kaydırdıkça 80'erli gruplar halinde eklenir | Mevcut yığına birebir uyar, erişilebilir, doğal kaydırma hissi | En kalabalık rafta (~1.000 kitap) sonuna kadar kaydırılırsa çok öğe birikir |
| 2. Sanal raf (yalnız görünenler) | ~30 öğe geri dönüştürülerek çizilir | Zayıf cihazda en akıcı | Daha karmaşık; doğal kaydırma/momentum hissini bozabilir |
| 3. Canvas | Raf tuvale çizilir | Çok akıcı | Ekran okuyucuya görünmez, yazı bulanıklığı → elendi |

**Seçim: Yol 1.** Kullanıcı sonuca odaklandı, yöntemi bize bıraktı; Yol 1 projenin mevcut yapısıyla en uyumlu ve erişilebilir olan.

## 5. Kullanıcının karar verdikleri

1. **Gezinme:** Tek büyük raf + alttaki harf çarkı (mockup B).
2. **Kitap açılışı:** Ortada çift sayfa; sayfa çevirerek komşu kitaba geçiş (mockup A).
3. **Eski görünüm:** Kütüphane listenin **yerini alır**; arama ve filtreler rafın içine taşınır.
4. **Yöntem:** Yol 1.

## 6. Tasarım

### 6.1 Ekran iskeleti (açık tema)

```
┌──────────────────────────────┐
│ KELİME KÜTÜPHANESİ      🔍  │  ← başlık + arama büyüteci
│ D Rafı                       │
│ [🏷 Tüm kütüphaneler · B2 ▾] │  ← raf etiketi (aktif filtre özeti)
│                              │
│  ▐desk▌▐decide▌▐danger▌▐deli… │  ← tek büyük raf, yatay kaydırma
│ ═════════════════════════════ │  ← raf tahtası (sand)
│  DA · DE · DI · DO · DR · DU  │  ← raf cetveli (harf içi atlama)
│                              │
│      A  B  C (D)  E  F  G     │  ← harf çarkı
└──────────────────────────────┘
```

### 6.2 Raf ve kitaplar
- Ekranda tek bir raf; arka plan `--dp-color-paper`. Raf tahtası `--dp-color-sand`, 6px kalınlık, hafif yuvarlak.
- Başlık: büyük harf (ör. "D", 40px/900) + "412 KİTAP" etiketi (10px, büyük harf, `ink-subtle`).
- **Kitap sırtı:** dikey yazı (`writing-mode: vertical-rl` + 180° döndürme, aşağıdan yukarı okunur), 13px/800 Nunito.
  - **Genişlik:** 32–38px; **yükseklik:** kelime uzunluğuna göre 130–190px arası, tavanı aşan kelime üç noktayla kısalır (tam metin `aria-label`'da ve açılan sayfada).
  - Kelimeye göre sabit küçük bir boy sapması (kelime id'sinden türetilen, her açılışta aynı) — raf canlı ama rastgele titremeyen görünsün.
- **Sırt rengi = CEFR:** A1 `#ffffff` (sage çerçeve), A2 `--surface-subtle`, B1 `--sand`, B2 `--sage`, C1 `--ink-muted` (açık yazı), C2/C2+ `--ink` (açık yazı). CEFR'i olmayan: A2 tonu.
- **Durum işaretleri:** favori → sırtın üstünde küçük kırmızı kurdele (tek kırmızı kullanım). Öğrenildi → sırt altında küçük sage tik. Tekrar edilecek → sırt altında küçük sage nokta.
- Raf yatay kaydırılır; `scroll-snap-type: x proximity` (yumuşak, zorlayıcı olmayan oturma).

### 6.3 Harf çarkı
- Alt kısımda yatay, kaydırılabilir harf şeridi; ortadaki harf büyük beyaz daire içinde (seçili), yanındakiler kademeli küçülür ve soluklaşır.
- Parmakla sürüklenir, bırakınca en yakın harfe oturur (scroll-snap center) ve raf o harfe geçer. Harfe dokunmak da geçirir.
- Raf değişimi: kısa çapraz solma (~0,25s). Tüm harfler: A–Z + harf olmayanlar için "#" rafı (en sonda).
- Aktif filtreyle **boş kalan harfler** soluk gösterilir ve atlanır.
- Klavye: sol/sağ ok harf değiştirir; ekran okuyucu için `role="tablist"` benzeri yapı ve "D rafı, 412 kitap" duyurusu.

### 6.4 Raf cetveli (harf içi hızlı atlama)
- Rafın hemen altında ince şerit: o harfte gerçekten bulunan ilk iki harf grupları (DA, DE, DI, DO, DR, DU…). En fazla ~8 grup; fazlaysa komşu gruplar birleştirilir.
- Dokununca raf o grubun ilk kitabına kayar (gerekirse o noktaya kadar parçalar yüklenir). Kaydırırken aktif grup vurgulanır.
- 60 kitaptan az olan raflarda gösterilmez.

### 6.5 Kitap açılması (çift sayfa)
- Kitaba dokununca: arka plan `rgba(23,30,25,.35)` ile kararır, kitap ortada açılan iki sayfaya dönüşür (kâğıt rengi `#fbfaf6` benzeri — palet içindeki `--surface-subtle`'a yakın tutulur; builder bunu mevcut token'larla eşleştirir), cilt çizgisinde iç gölge.
- **Sol sayfa:** CEFR · tür etiketi, kelime (28px/900), okunuş, ses (🔊 `speakWord`) ve favori düğmesi, kütüphane çipleri (MAARİF / OXFORD / YDS). Sayfanın altında sakin bir ikon sırası (her biri ≥44px): **Öğrendim**, **Tekrar et**, **Telaffuz Koçu** (`openSpeechCoach`), **Bağlam** (`openClassifierForWord`). Bugünkü genişletilmiş karttaki (`generateWordCardsHtml`) eylemlerin hiçbiri kaybolmaz (kullanıcı kararı).
- **Sağ sayfa:** Türkçe anlam (17px/800); anlamın altında küçük not olarak **edat ipucu** ve desc/cat satırı (varsa); **eş anlam çipleri** (`alt`) dokunulabilir — dokununca o kelimenin kitabı açılır (yoksa arama önerisine düşer); tanım (`definition`, varsa); örnek cümle (`example`, YDS'de `ydsExample`).
- Uzun içerik sayfa içinde dikey kayar; sayfa boyutu sabit.
- **Sayfa çevirme:** yatay kaydırma/ok tuşları → raftaki önceki/sonraki kitap. Kısa kayma geçişi, 3D dönüş yok.
- **Kapatma:** dışarı dokunma, aşağı kaydırma, Esc, geri tuşu. Kitap rafa döner, raf açılan kitabın konumunda kalır.
- Küçük ekranda (≤360px) sayfalar alt alta istiflenir (kelime üstte, anlam altta) — çift sayfa tek kolonlu "kitap" olur.
- Odak açılan kitaba taşınır, kapatınca kitaba geri döner; `role="dialog"`, `aria-modal`.

### 6.6 Arama (yalnızca götürür, rafı süzmez — kullanıcı kararı)
- Başlıktaki 🔍 dokununca üstte arama alanı açılır; 250ms gecikme korunur.
- Eşleştirme bugünkü mantıkla aynı alanlarda yapılır (en, tr, alt/eş anlam, tanım), ama sonuç **rafı ve harf çarkını değiştirmez**: yazarken altta en fazla 6 öneri listelenir (önce baştan eşleşen İngilizce, sonra diğerleri).
- Öneri seçilince ilgili harfin rafına gidilir, kitap kaydırılarak görünür yapılır ve açılır. Tam eşleşmede Enter doğrudan kitabı açar.
- Arama kapatılınca iz bırakmaz; `STATE.directoryFilters.search` artık rafı süzmek için kullanılmaz (arama terimi yalnızca öneri listesini besler). Raf yalnızca §6.7 filtreleriyle daralır.
- Öneri önce aktif filtrelere uyan kelimelerden yapılır. Filtre dışında kalan eşleşmeler listede soluk gösterilir; biri seçilirse ilgili filtre otomatik "Tümü"ne döner ve raf etiketi bunu gösterir (*karar: Claude*).
- Testler: `tests/e2e_test_runner.js` ~1088–1110 aralığındaki arama-filtre testleri bu yeni davranışa göre yeniden yazılır.

### 6.7 Filtreler ("raf etiketi")
- Rafın üstündeki etiket aktif filtrelerin özetini gösterir ("Tüm kütüphaneler · Tüm düzeyler").
- Dokununca alttan panel: mevcut çip grupları aynen (Kütüphane: Tümü/Maarif/YDS&YÖKDİL/Oxford; CEFR; Durum: Tümü/Öğrenilen/Tekrar/Favoriler; YDS modülünde kelime türü). `STATE.directoryFilters` ve `getFilteredDirectoryWords()` olduğu gibi kullanılır.
- Filtre değişince raf, sayaç ve harf çarkındaki boş harfler güncellenir.

### 6.8 Karanlık tema ("gece kütüphanesi")
- **Dikkat (karar: Claude):** `app.css:107` karanlık temada `--dp-color-ink`, `--ink-muted`, `--sand` token'larını yeniden tanımlıyor (ink açık renge döner). Bu yüzden kütüphane genel token adlarını değil, **kendi kapsamlı değişkenlerini** kullanır: `#view-directory` altında `--lib-*` değişkenleri, değerleri yalnızca açık tema palet hex'lerinden (`#171e19`, `#47524c`, `#899690`, `#b7c6c2`, `#d8d3c5`, `#f5f3ed`, `#eeebe3`, `#ffffff`, `#ca0013`) ve bunların `color-mix` karışımlarından gelir. Yeni hex yok.
- Karanlıkta: zemin `#171e19`, raf tahtası `#47524c`. Sırtlar koyu aralıkta: A1/A2 `#47524c` (açık yazı), B1/B2 `color-mix(#171e19, #b7c6c2)` tonları, C1/C2 `#d8d3c5`/`#eeebe3` üzerine koyu yazı. Kurdele kırmızı kalır.
- Sayfalar karanlıkta `#47524c` zemin + `#eeebe3` yazı. Tüm sırt/sayfa kombinasyonları AA kontrastla doğrulanır.

### 6.9 Hareket ve göz konforu
- Tüm geçişler ≤0,3s, `cubic-bezier(0.4, 0, 0.2, 1)`. Sürekli/otomatik hareket yok.
- `prefers-reduced-motion: reduce` → geçişler anında.
- Metin kontrastı WCAG AA (sırtlarda da). Dokunma hedefleri ≥44px (kitaplar 32px genişlikte olduğundan dokunma alanı dikey uzunlukla telafi edilir; harf çarkı ve düğmeler ≥44px).

### 6.10 Performans
- Raf ilk açılışta 80 kitap; son kitaba yaklaşınca (IntersectionObserver) sıradaki 80 eklenir. Raf değişince DOM temizlenir.
- Harf→kitap listesi filtre değişince bir kez hesaplanır ve önbelleğe alınır.

## 7. Builder'a bırakılanlar
- Dosya düzeni: `renderDirectoryView` yerine yeni render fonksiyonları (`app.js` içinde veya ayrı `library.js` — ayrı dosya olursa service worker önbelleğine eklenmeli).
- Kâğıt ve karanlık-sage tonlarının mevcut token'lardan nasıl türetileceği (yeni hex eklenmeyecek).
- Mevcut `bindDirectoryCardAudio`, `speakWord`, favori/öğrenildi işlemlerinin yeniden kullanımı.
- Testler: `tests/e2e_test_runner.js` mevcut; kitaplık için duman testleri (raf açılıyor, harf değişiyor, arama kitabı açıyor, filtre rafı daraltıyor).

## 8. Claude'un verdiği kararlar (kontrol için)
- Kalıplar (68 karaktere kadar) sırtta üç noktayla kısalır; tam metin açılan sayfada ve `aria-label`'da.
- Harf olmayanla başlayanlar en sonda "#" rafında.
- Sırt rengi = CEFR (açıktan koyuya); favori = kırmızı kurdele (tek kırmızı kullanım); öğrenildi/tekrar = küçük sage işaret.
- Raf cetveli (harf içi atlama), yalnızca 60+ kitaplı raflarda.
- Kütüphanenin kendi `--lib-*` renk değişkenleri (karanlık temada token'lar ters döndüğü için); yeni hex yok.
- Filtre dışı arama sonucu soluk görünür; seçilirse ilgili filtre "Tümü"ne döner.
- Küçük ekranda (≤360px) çift sayfa tek kolona istiflenir.
