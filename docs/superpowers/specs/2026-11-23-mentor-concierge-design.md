# Mentor Concierge — Tasarım Dokümanı

Tarih: 2026-11-23 · Durum: Onay bekliyor
Yaklaşım: C (Melez — akıllı kısayollar + aranabilir komut paleti), kullanıcı tarafından seçildi.

## 1. Niyet ve neden

Learnish'in köşedeki mentor'u (`app.js` içindeki `Buddy` modülü, ~satır 8454) bugün **senaryolu** bir yardımcı: her ekran için sabit bir ipucu, tek seferlik tanıtım turu, olay tepkileri (kelime öğrenince/quiz geçince kutlama) ve kelime telaffuzu. İpuçları önceden yazılmış, kullanıcının o anki ihtiyacına cevap vermiyor.

Hedef, mentor'u **kullanıcının "şunu yapmak istiyorum / bu nerede" ihtiyacına cevap verebilen, siteye etki eden (admin gibi) bir concierge**'e çevirmek. Kullanıcı yazarak ya da öneriye dokunarak bir niyet seçer; mentor ya kullanıcıyı doğru yere **götürür** (uygulamanın `APP` aksiyonları), ya da "nasıl yapılır"ı **anlatır**.

**Neden bu şekilde (en kritik kısıt):** Mentor **çevrimdışı ve API'siz** kalmalı. İnternet yokluğu değil, asıl mesele **güvenilirlik**: hiçbir cevap dışarıdan/üretken bir modelden gelmez, dolayısıyla halüsinasyon ya da kopma olmaz. Mentor'un bilgisi **Learnish'in sunduğu modüllerle sınırlıdır**; bilmediğini uydurmaz, "bunu yapamıyorum ama şunlarda yardımcı olurum" der. Bu yüzden C yaklaşımı seçildi: kullanıcı serbest metin yazsa bile mentor aslında **bilinen, sabit bir komut listesini süzer** — yani yazı chatbot hissi verir ama üretim yoktur, sadece eşleştirme ve seçim vardır.

## 2. Hedefler, kapsam dışı, başarısızlık sayılacaklar

**Hedefler**
- Mentor'a **aranabilir bir komut paleti** eklenir: kullanıcı yazdıkça, bilinen yeteneklerden (komut kataloğu) eşleşenler listelenir.
- Mentor açılışında **ilerlemeye duyarlı akıllı öneriler** gösterir (örn. "12 kelimen tekrara düştü", "Bugünün çalışması bekliyor"). Bunlar kullanıcının yerel verisinden (`STATE`/`localStorage`) deterministik olarak üretilir.
- Her komut/öneri iki türden biridir: **Aksiyon** (seni bir yere götürür / bir şey başlatır, mevcut `APP` fonksiyonunu çağırır) veya **Rehber** ("nasıl yapılır"ı kısaca anlatır, çoğu zaman sonunda bir aksiyon butonuyla).
- Eşleşme yoksa **güvenli geri dönüş**: "Bunu tam anlamadım; şunlarda yardımcı olabilirim: …" + en sık kullanılan birkaç komut.
- Mevcut mentor davranışları (tur, olay tepkileri, telaffuz, ilk karşılama) **korunur**; palet üstüne bu yeni panel eklenir.
- Açık ve karanlık temada, klavye ve ekran okuyucu ile çalışır.

**Kapsam dışı**
- Herhangi bir ağ çağrısı, API anahtarı, üretken model, LLM, gömülü NLP kütüphanesi. (Eşleştirme tamamen yerel, kural tabanlı dizge işidir.)
- Kelime verisini (`words-data.js`, `curriculum-data.js`) değiştirmek.
- Yeni çerçeve/kütüphane (React vb.) eklemek.
- Mentor'a serbest-metin "sohbet" / çok-adımlı diyalog belleği eklemek. (Tek niyet → tek cevap.)
- Mentor'un kullanıcı adına geri alınamaz işlemler yapması (ilerleme sıfırlama vb. **yalnızca** kullanıcıyı ilgili ekrana/onaya götürür, kendisi tetiklemez).

**Başarısızlık sayılır (çalışsa bile)**
- Mentor'un uydurma/yanlış bir yönlendirme vermesi (var olmayan bir ekran/özellik önermesi).
- Palet dışı renk ya da kırmızının vurgu dışında kullanılması (bkz. DESIGN.md).
- Göz yoran/sürekli hareket, uzun animasyon.
- Mevcut mentor davranışlarının (tur, tepkiler, telaffuz) bozulması.
- Çevrimdışıyken panelin çalışmaması (service worker önbelleğine girmeyen yeni dosya).
- Klavye/ekran okuyucu ile kullanılamaz hale gelmesi.

## 3. Kısıtlar ve veriden çıkan gerçekler

- **Yığın:** Saf JS + `app.css`, çevrimdışı PWA (`service-worker.js`), derleme adımı `build.py` ile tek-dosya sürümü de üretir. Kodun büyük kısmı tek IIFE içinde; mentor `Buddy` modülü de bu kapsamda, `STATE` ve `APP` aynı kapsamda erişilebilir.
- **Mentor bugünkü API'si (`Buddy`, ~8454):** `init`, `onView(viewName)`, `open`, `startTour`, `pronounce(word)`, `react(kind)`, `say(text, acts, opts)`, `hide`. `say` bir baloncuk + buton listesi gösterir; her buton `{label, pri?, on}`. Yüz kareleri `assets/mentor-*.png`. Dışarıya `window.APP.buddy` olarak açık.
- **Erişilebilir durum (`STATE`, ~464):** `activeModule` ('maarif'|'yds'|'oxford'|'all'), `currentView`, `currentDay`, `selectedGrade`, `userData.{learned, review, favorite, srs, mistakes}` (Set/obje), `settings.{accent, speed, theme}`.
- **Hazır ilerleme sinyali fonksiyonları (yeniden kullanılacak):** `getSRSStats()` → `{dueCount, newCount, learningCount, reviewingCount, masteredCount}`; `getMistakeStats()`; `getSRSDueWords()`; `getActiveMistakeWords()`; `getMEBCalendarInfo()`.
- **Hazır aksiyonlar (yeniden kullanılacak, `APP`'te açık):** `switchView`, `switchModule`, `startDailyQuiz`, `startDailyFlashcards`, `startSRSDueQuiz`, `startSRSDueFlashcards`, `startMistakeQuiz`, `startMistakeFlashcards`, `goToTodayMEBDay`, `openSpeechCoach`, `openPdfStudio`, `openModesModal`, `openCurriculumModal`, `openSettingsModal`, `searchDirectory`, `openFeedbackModal`. (Komut kataloğu bunların üstüne kurulur; yeni iş mantığı yazılmaz, var olan çağrılır.)
- **Palet (yalnızca bunlar):** `--dp-color-ink #171e19`, `-ink-muted #47524c`, `-ink-subtle #899690`, `-sage #b7c6c2`, `-sand #d8d3c5`, `-surface-subtle #f5f3ed`, `-paper #eeebe3`, `#ffffff`, `-red #ca0013` (yalnızca kritik vurgu). Nunito. Köşe yarıçapları DESIGN.md ölçeğinden.
- **Karanlık mod:** `[data-theme="dark"]` mevcut. **Hareket:** `prefers-reduced-motion` zaten kontrol ediliyor (`Buddy.reduce()`).
- **Dil:** Arayüz Türkçe. Eşleştirme Türkçe yapılacağından; büyük/küçük harf ve Türkçe karakter (İ/ı, ş, ç, ğ, ü, ö) normalize edilmeli, ayrıca İngilizce karşılıkları da aranabilmeli (örn. "quiz", "flashcard").

## 4. Yaklaşımlar

Kullanıcı ile üç yol değerlendirildi; **C seçildi**.

- **A — Rehber menü (dokunmalı karar ağacı):** Sadece butonlarla dallanan menü. En güvenli, yazı yok; ama kullanıcı ihtiyacını menüde aramak zorunda, "her istendik beceri" menü derinliğiyle sınırlı. *Elendi:* yeterince esnek değil.
- **B — Saf soru kutusu (niyet eşleştirme):** Sadece yazı kutusu + serbest eşleştirme. Esnek ama kullanıcı ne yazacağını bilemez, boş eşleşme/yanlış eşleşme his olarak chatbot vaadi verip altını dolduramaz. *Elendi:* keşfedilebilirliği zayıf, yanlış-eşleşme riski yüksek.
- **C — Melez (SEÇİLEN):** Açılışta ilerlemeye duyarlı öneri çipleri + altında aranabilir komut listesi (komut paleti). Yazınca liste süzülür; her zaman görünür bir "yapabileceklerim" listesi olduğu için keşfedilebilir, serbest metin aslında listeyi filtrelediğinden uydurma imkânsız. A'nın güvenliği + B'nin esnekliği.

## 5. Kararlaştırılan "nasıl"

### 5.1 Komut kataloğu (tek doğ­ruluk kaynağı)
`Buddy` içinde statik bir dizi: `MENTOR_COMMANDS`. Her kayıt:

```
{
  id: 'srs-quiz',
  label: 'Tekrar zamanı gelenleri test et',
  keywords: ['tekrar', 'srs', 'test', 'sınav', 'quiz', 'gelen', 'zaman'],
  group: 'calisma',            // gruplama/ikon için
  type: 'action',              // 'action' | 'guide'
  // action: çalıştırılacak APP çağrısı
  run: () => APP.startSRSDueQuiz(),
  // guide ise: kısa açıklama + opsiyonel aksiyon butonu
  help: 'Tekrarı gelen kelimelerini kısa bir testle pekiştir.',
  // görünürlük/önem: ilerlemeye göre dinamik etiket ve sıralama
  badge: () => { const n = APP.getSRSStats().dueCount; return n ? `${n} kelime` : null; }
}
```

Katalog **yalnızca var olan `APP` fonksiyonlarını** çağırır; yeni iş mantığı yazılmaz. Başlangıç kapsamı (her biri tek `APP` çağrısı):
- **Çalışma:** bugünün çalışması (`goToTodayMEBDay`/`startDailyFlashcards`), bugünün testi (`startDailyQuiz`), tekrar (SRS) flashcard/test, yanlışlarım flashcard/test, çalışma modları (`openModesModal`).
- **Keşif/araç:** sözlük (`switchView('directory')`), belirli bir kelimeyi ara (`searchDirectory`), istatistik (`switchView('stats')`), müfredat (`openCurriculumModal`), PDF/çalışma kağıdı stüdyosu (`openPdfStudio`), telaffuz/konuşma koçu (`openSpeechCoach`).
- **Modül/ayar:** modül değiştir (`switchModule` → maarif/yds/oxford), aksan/hız/tema (`openSettingsModal`), geri bildirim (`openFeedbackModal`).
- **Rehber (type: 'guide'):** "kartı nasıl çeviririm", "telaffuzu nasıl dinlerim", "yanlışlarımı nerede görürüm", "ilerlememi nasıl yedeklerim" gibi kısa anlatım + "Götür beni" butonu.

Katalog dışı bir niyet eşleşmezse mentor **uydurmaz**, geri dönüş metnini gösterir.

### 5.2 Eşleştirme (tamamen yerel, deterministik)
- Girdi normalize edilir: küçük harf, Türkçe karakter sadeleştirme (İ→i, ş→s, ç→c, ğ→g, ü→u, ö→o), noktalama temizliği, kelimelere ayırma.
- Her komutun `label` + `keywords` alanı aynı şekilde normalize edilip, token örtüşmesi / alt-dize eşleşmesiyle puanlanır (basit skorlama; harici kütüphane yok). En yüksek puanlı birkaç sonuç listelenir.
- Hiçbir sonuç eşik puanı geçmezse → geri dönüş. **Asla** "en yakın" tek sonuç zorla seçilip körlemesine çalıştırılmaz; liste gösterilip seçim kullanıcıya bırakılır (yanlış-aksiyon riskini sıfırlar).

### 5.3 Akıllı öneriler (açılış durumu)
Panel açılınca, yazı yokken, `STATE`/stat fonksiyonlarından **deterministik** 2–4 öneri üretilir; öncelik sırası:
1. Tekrarı gelen var mı? (`getSRSStats().dueCount > 0`) → "N kelimen tekrara düştü · [Tekrar et]"
2. Aktif yanlış var mı? (`getMistakeStats`) → "N yanlışın bekliyor · [Yanlışlarım]"
3. Bugünün çalışması tamam değil mi? → "Bugünün çalışması bekliyor · [Başlat]"
4. Hiçbiri yoksa → olumlu durum + keşif önerisi ("Her şey güncel 🎉 · [Yeni kelimelere bak]").

### 5.4 Arayüz (mevcut baloncuğun içinde)
Mentor baloncuğu (`lb-bubble`) genişletilir; `say()`'in yanına yeni bir `openConcierge()` modu eklenir. Dizilim:

```
┌─ Mentor ───────────────────────── × ┐
│ 12 kelimen tekrara düştü             │   ← akıllı öneri satırı (çip)
│ Bugünün çalışması bekliyor           │
│ ┌ "ne yapmak istersin?" ──────────┐ │   ← arama kutusu (input)
│ │ ara: telaf…                     │ │
│ └──────────────────────────────────┘ │
│ ▸ Telaffuz çalış (Konuşma Koçu)      │   ← süzülen komut listesi
│ ▸ Kelime telaffuzunu dinle           │
│ ▸ Nasıl telaffuz dinlerim? (rehber)  │
└──────────────────────────────────────┘
```

- Buddy butonuna tıklayınca bugünkü kısa ipucu yerine **bu concierge paneli** açılır (eski `open()` davranışı buraya evrilir; tur ve ilk karşılama korunur).
- Liste öğesine dokununca: `action` ise çalıştırır + paneli kapatır (gerekirse kısa onay "Hadi!"); `guide` ise açıklamayı gösterir + "Götür beni" aksiyonu.
- Erişilebilirlik: input `aria-label`'lı; liste klavye ok tuşlarıyla gezilebilir, Enter seçer, Esc kapatır; `role=listbox/option` ya da eşdeğeri.
- Hareket: `reduce()` true ise animasyon yok; panel anında açılır.

### 5.5 Dosya ve önbellek
- Tüm mantık `app.js` içindeki `Buddy` modülüne eklenir (yeni dosya gerekmez → service worker değişmez). CSS `app.css` içine mentor bölümünün yanına. **Yeni asset/dosya eklenmezse `service-worker.js` dokunulmaz.** Eklenirse `ASSETS_TO_CACHE`'e girmeli.
- `build.py` tek-dosya sürümünü `app.js`/`app.css`'ten ürettiğinden ek iş gerekmez; yine de build sonrası tek-dosya sürümde panel çalışıyor mu doğrulanır.

## 6. Builder'a bırakılanlar
- Komut listesinin tam kelime/`keywords` içerikleri ve skorlama eşiğinin ince ayarı (deneyerek).
- Panelin baloncuk içindeki birebir yerleşimi/ölçüleri (palet ve DESIGN.md ölçeğine sadık kalmak şartıyla).
- Akıllı öneri metinlerinin son Türkçe ifadeleri.
- Liste öğesi ikon/grup gösterimi (opsiyonel, palet içinde).

## 7. Test / doğrulama
- `tests/` altındaki mevcut e2e düzenine uygun: mentor açılır, öneri çipleri ilerleme verisine göre doğru çıkar, arama "quiz"/"tekrar" yazınca doğru komutları süzer, bir aksiyon öğesi doğru `APP` fonksiyonunu çağırır, eşleşmeyen girdi geri dönüşü gösterir.
- Çevrimdışı: ağ kapalıyken panelin tümüyle çalıştığı elle doğrulanır.
- Regresyon: tur, ilk karşılama, olay tepkileri (`react`), telaffuz hâlâ çalışıyor.
