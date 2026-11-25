# Renkli Defterler Modülü — Tasarım Dokümanı

**Tarih:** 2026-11-25
**Durum:** Taslak (onay bekliyor)
**Yaklaşım:** A — Mevcut SRS + `STATE.userData` üzerine ince katman

---

## 1. Amaç ve Neden

Öğrenciye, kendi sınıf müfredatındaki kelimeleri **zorluk kademesine göre** (trafik ışığı mantığı) çalıştıran kişisel bir modül. Düz müfredat listesini; görünür ilerlemesi, kademe atlaması ve "ustalaştıkça kolaylaşan" bir oyuna çevirir.

- 🔴 **Kırmızı = Zor**, 🟡 **Sarı = Orta**, 🟢 **Yeşil = Kolay** olmak üzere üç "defter".
- Kelimeler öğrencinin **aktif modülünde o güne dek açılmış (birikmiş)** kelimelerden gelir. Maarif'te sınıf müfredatının açılmış günleri; YDS/Oxford'da o güne dek ulaşılmış partiler.
- Başlangıç rengi **performanstan (mevcut SRS ustalık durumundan) otomatik tohumlanır**: ustalaşılmamış kelime kırmızı başlar, bilindikçe yeşile tırmanır. CEFR yalnızca ilk kademeyi hafif etkiler. Öğrenci tek tek triyaj yapmaz.
- Kelimeler **mevcut flash kart modülü** gibi çalışılır. Öğrenci ustalaştıkça kelime **tek adım** daha kolay renge terfi eder (🔴→🟡→🟢).
- Terfi, "en az 5 kez iyi hatırlama" + bir **"Seviye Geçme Testi"** geçmekle gerçekleşir.
- Hepsi **"Renkli Defterler" koleksiyonunda** (üç ayrı defter) birikir — yeni bir kategori.

**Neden şimdi:** Öğrenciye kendi ilerlemesi üzerinde ajans ve motive edici, somut bir "kademe atlama" hissi vermek; tekrarı hem algılanan hem gerçek zorluk etrafında yoğunlaştırmak.

## 2. Hedefler

1. Yeni bir modül/görünüm: **"Renkli Defterler"** — üç defter sekmesi.
2. Kaynak = **aktif modülde o güne dek açılmış** kelimeler (maarif: `getActiveGradePool` + açılmış günler; YDS/Oxford: ulaşılmış partiler). **Kelime havuzuna / korpusa sıfır dokunuş.** Tüm modlarda (MEB + YDS + Oxford) çalışır.
3. Başlangıç rengi **performanstan tohumlanır** (aşağıda 7.1): ustalaşılmamış → kırmızı, öğreniliyor → sarı, ustalaşılmış → yeşil. CEFR yalnızca geçmişi olmayan kelimeler için hafif bir ipucu.
4. Günlük çalışma: öğrenci **"bugün kaç kelime"** ayarını yapar (sınıfa göre varsayılan, ayarlanabilir); kelimeler **mevcut flash kart akışıyla** sunulur.
5. "İyi hatırlama" sinyali = **mevcut SRS başarısı** (SM-2'de quality ≥ 4: "İyi" / "KOLAY–ZİHNİMDE"). Yeni sayaç uydurulmaz; SRS olayına bağlanır.
6. Bir kelime **toplam ≥ 5 iyi hatırlama** topladığında "terfiye uygun" olur.
7. Terfiye uygun kelimeler **20'ye** ulaşınca **"Seviye Geçme Testi"** önerilir; test **yalnızca o uygun kelimelerden** oluşur. Geçen kelime **bir renk** terfi eder.
8. 🟢 yeşile ulaşan kelime **rotasyonda kalır** (B seçeneği): en kolay kademe olarak uzun aralıklarla tekrar için akışta görünmeye devam eder (mevcut SRS `nextReview` ile).
9. Koleksiyon görünümü: her defter kütüphane-stili kartlarla ayrı ayrı gezilebilir.

## 3. Hedef Olmayanlar (Non-Goals)

- Kelime korpusunu/verisini değiştirmek. Korpus **11000**'de sabit, sıfır düzenleme.
- İkinci bir SRS motoru yazmak. Mevcut SM-2 yeniden kullanılır.
- Öğrencinin elle kelime yazması / havuz dışı kelime eklemesi (kaynak yalnızca müfredat).
- Renklerin elle sürükle-bırakla değiştirilmesi (renk yalnızca terfi mekanizmasıyla değişir).

## 4. Hedefe Karşı Olanlar (Anti-Goals) — bunlar olursa başarısız sayılır

- Renk değişimi hak edilmemiş/rastgele hissettirirse.
- Seviye Geçme Testi ya hiç tetiklenmeyecek kadar yüksek eşikli, ya da rahatsız edecek kadar sık olursa.
- Ustalaşılan kelime gözden kaybolursa (B seçeneğiyle önlendi).
- Tek bir korpus kelimesi bile kaybolursa/bozulursa.

## 5. Kısıtlar

- Tamamen çevrimdışı, çalışma anında yapay zekâ / halüsinasyon yok.
- Vanilla JS, tek dev IIFE (`app.js`); `app.css`; `words-data.js` dokunulmaz.
- Kalıcılık yalnızca `localStorage` → `STATE.userData`.
- Yalnızca `claude/modest-cerf-cahp9u` dalında geliştirme.
- e2e paketi (`node tests/e2e_test_runner.js`) **yeşil** kalmalı; `python3 build.py --check` **senkron** olmalı.

## 6. Değerlendirilen Yaklaşımlar

- **A — Mevcut SRS + userData üzerine ince katman (SEÇİLDİ).** Renk + iyi-hatırlama durumu `STATE.userData`'ya iki alan olarak eklenir; günlük çalışma mevcut flash kartı, test mevcut quiz motorunu kullanır; koleksiyon görünümü kütüphane render'ından ödünç alır. *Artı:* en az kod, korpusa dokunmaz, mevcut tekrar verisiyle tutarlı. *Eksi:* ilerleme genel SRS sinyalini paylaşır (istenen davranış).
- **B — Bağımsız kendi çalışma döngüsü olan modül.** *Red:* ikinci SRS motoru, kod ikiye katlanır, sapma riski; "mevcut ilerlemeden besle" isteğine ters.
- **C — Her şeyi Kütüphane koleksiyon sistemine ekle.** *Red:* kütüphane göz atma yüzeyi; günlük adet ayarı, günlük akış ve Seviye Geçme Testi oraya zorlama olur. (Yalnızca koleksiyon *görünümü* için render fikri A'ya ödünç alınır.)

## 7. Kararlaştırılan "Nasıl"

### 7.1 Veri modeli (`STATE.userData.notebooks`)
Yeni map: `notebooks[wordId] = { color, good, lastGoodDate, enrolledAt, promotedAt }`
- `color`: `'red' | 'yellow' | 'green'` — kayıt anında performanstan tohumlanır (7.1), sonra yalnızca test ile değişir.
- `good`: o anki renkte biriken **iyi hatırlama** sayısı (günde en fazla +1). Terfi edince **0'a sıfırlanır**.
- `lastGoodDate`: `good`'un son arttığı yerel gün (günlük +1 kapağı için).
- `enrolledAt`, `promotedAt`: tarih damgaları (telemetri/sıralama için).
- Bir kelime "modüle kayıtlı" ise `notebooks[id]` vardır; değilse yok.

**Başlangıç rengi (performanstan tohumlama, kayıt anında bir kez):**
Kelime modüle ilk girdiğinde renk, o anki SRS durumundan türetilir ve **saklanır**:
- SRS kaydı yok **ya da** `state === 'new'/'learning'` → `red`
- `state === 'reviewing'` → `yellow`
- `state === 'mastered'` (interval ≥ 14) → `green`
- **CEFR hafif ipucu:** geçmişi (SRS kaydı) olmayan kelimelerde A1/A2 ise `red` yerine `yellow` başlar (nesnel kolay kelimeyi gereksiz yere en dibe atmamak için). Diğer tüm no-history kelimeler `red`.

Böylece ustalaşılmamış kelimelerin çoğu kırmızı/sarı başlar → her sınıf ve modülde gerçek bir tırmanış olur. Renk bu tohumlamadan sonra **yalnızca Seviye Geçme Testi ile** değişir.

**Terfiye uygunluk:** `color !== 'green' && good >= 5`.

### 7.2 Kalıcılık
`notebooks` şu listelere eklenir: `saveUserData` payload'ı, `handleImportFile` yükleme, yedek dışa aktarma, `resetProgress` temizleme, varsayılan `STATE.userData` init.

### 7.3 Günlük akış
1. Modüle girince aktif modül/sınıfa göre **varsayılan günlük adet** gösterilir, öğrenci ayarlar (`STATE.userData.notebookDailyCount`).
2. Aday havuz = **aktif modülde o güne dek açılmış** kelimeler (`getUnlockedModuleWords()` yardımcısı: maarif → grade pool ∩ açılmış günler; yds/oxford → modül havuzu ∩ ulaşılmış partiler). O günün çalışma kümesi: önce **SRS'e göre bugün tekrarı gelen** kayıtlı kelimeler, sonra **henüz kayıtlı olmayanlar** (lazy kayıt → performanstan renk tohumu), adet dolana dek.
3. Küme **mevcut flash kart motoruyla** sunulur (`renderFlashcardView` altyapısı / `filteredFlashcards`).

### 7.3.1 `good` sayacının artması (çözülen incelik)
- `calculateSRS` içine tek merkezî kanca: bir **kayıtlı** kelime için quality ≥ 4 gerçekleştiğinde `good += 1`.
- **Günde kelime başına en fazla +1** (son artış tarihi saklanır; aynı kelime aynı gün tekrar işaretlense artmaz → oyun bozma engellenir).
- **Seviye Geçme Testi'nin kendi cevapları `good`'u artırmaz** (test bayrağı ile dışlanır). Test terfiyi ölçer, beslemez.
- Not: kayıtlı bir kelimenin başarısı normal flash kart/quiz'de de sayılır — bu, "mevcut ilerlemeden besle" isteğiyle uyumludur (bilinçli karar).

### 7.4 Seviye Geçme Testi
- Terfiye uygun (`color!=='green' && good>=5`) kelime sayısı — **tüm renkler toplamında** (renk başına değil; çözülen incelik) — **20'ye** ulaşınca öğrenciye test **önerilir** (dayatılmaz). Renk başına eşik olsaydı (ör. kırmızı) bazı modlarda hiç tetiklenmezdi.
- Test içeriği = yalnızca o anda terfiye uygun kelimeler (kırmızı + sarı karışık olabilir); **mevcut quiz motoru** (`startQuiz` / `renderQuizView`) bu kaynakla beslenir.
- Testte **doğru** bilinen kelime **bir renk terfi eder** (🔴→🟡→🟢), `good` sıfırlanır, `promotedAt` güncellenir. Yanlış bilinen aynı renkte kalır, `good` korunur (ve mevcut Hata Defteri mantığı devreye girer).
- Test sonrası, geride kalan uygun kelimeler yeniden **20**'ye ulaşınca test tekrar önerilir.

### 7.5 Koleksiyon görünümü
- Yeni `view-notebooks` section + `renderNotebooksView()` + nav düğmesi (`data-view="notebooks"`) + `executeSwitchView` kancası + başlık etiketleri.
- Üç defter sekmesi (🔴/🟡/🟢); her biri kütüphane-stili kartlarla kelimeleri listeler, kelime başına `good`/terfi durumunu gösterir.

## 8. İnşaatçıya Bırakılanlar

- Üç defterin görsel tasarımı (DESIGN.md paleti, `--dp-color-*` / defter tonları), kart düzeni.
- Tüm kullanıcı metinleri/mikrokopi.
- Sınıf başına kesin varsayılan günlük adet değerleri.
- Seviye Geçme Testi'nde geçme eşiğinin ince ayarı (kelime başına tek doğru mu, oran mı).
- Nav düğmesinin yerleşimi ve ikon seçimi.

## 9. Doğrulama

- Yeni davranışlar için TDD regresyon testleri (CEFR→renk eşlemesi, uygunluk eşiği, terfi tek-adım, 20-eşiği test tetikleme, yeşil rotasyonda kalma, kalıcılık round-trip).
- Tam e2e paketi yeşil; `build.py --check` senkron; korpus 11000; örnekler korunur.

---

## Çözülen Kararlar (denetim sonrası)

- **Başlangıç rengi:** saf CEFR değil — **performanstan tohumlanır** (gerçek veride CEFR, düşük sınıflarda kelimelerin ~%70-85'ini baştan yeşil yapıp terfi oyununu boşa çıkarıyordu). CEFR yalnızca geçmişi olmayan kelimelerde hafif ipucu. *(Kullanıcı kararı)*
- **Kapsam:** tüm modlar — MEB + YDS + Oxford. Kaynak "aktif modülde açılmış kelimeler" olarak genelleştirildi. *(Kullanıcı kararı)*
- **Test eşiği:** renk başına değil, **toplam** 20 uygun kelime; test sonrası 20'ye yeniden ulaşınca tekrar önerilir. *(Benim kararım)*
- **`good` artışı:** kayıtlı kelimenin herhangi bir SRS başarısı sayılır (mevcut ilerlemeden besleme); **günde kelime başına +1 kapağı**; **Seviye Geçme Testi'nin kendi cevapları sayılmaz.** *(Benim kararım)*

Geriye yalnızca bölüm 8'deki inşaatçı kararları kalıyor (görsel, metin, sınıf/mod bazlı varsayılan adetler, geçme eşiği ince ayarı, nav yerleşimi).
