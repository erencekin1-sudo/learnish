# Renkli Defterler Modülü — Tasarım Dokümanı

**Tarih:** 2026-11-25
**Durum:** Taslak (onay bekliyor)
**Yaklaşım:** A — Mevcut SRS + `STATE.userData` üzerine ince katman

---

## 1. Amaç ve Neden

Öğrenciye, kendi sınıf müfredatındaki kelimeleri **zorluk kademesine göre** (trafik ışığı mantığı) çalıştıran kişisel bir modül. Düz müfredat listesini; görünür ilerlemesi, kademe atlaması ve "ustalaştıkça kolaylaşan" bir oyuna çevirir.

- 🔴 **Kırmızı = Zor**, 🟡 **Sarı = Orta**, 🟢 **Yeşil = Kolay** olmak üzere üç "defter".
- Kelimeler öğrencinin **kendi sınıfının müfredatından** gelir: hem şu an işlediği gün hem de geçmişte açılmış (birikmiş) günler. 5. sınıf öğrencisi → 5. sınıf müfredatından o güne dek açılmış kelimeler.
- Başlangıç rengi **CEFR seviyesinden otomatik** atanır (öğrenci tek tek triyaj yapmaz).
- Kelimeler **mevcut flash kart modülü** gibi çalışılır. Öğrenci ustalaştıkça kelime **tek adım** daha kolay renge terfi eder (🔴→🟡→🟢).
- Terfi, "en az 5 kez iyi hatırlama" + bir **"Seviye Geçme Testi"** geçmekle gerçekleşir.
- Hepsi **"Renkli Defterler" koleksiyonunda** (üç ayrı defter) birikir — yeni bir kategori.

**Neden şimdi:** Öğrenciye kendi ilerlemesi üzerinde ajans ve motive edici, somut bir "kademe atlama" hissi vermek; tekrarı hem algılanan hem gerçek zorluk etrafında yoğunlaştırmak.

## 2. Hedefler

1. Yeni bir modül/görünüm: **"Renkli Defterler"** — üç defter sekmesi.
2. Kaynak = aktif sınıf müfredat havuzu (`getActiveGradePool`), yalnızca **açılmış** günlerin kelimeleriyle sınırlı. **Kelime havuzuna / korpusa sıfır dokunuş.**
3. Başlangıç rengi CEFR'den: **A1/A2 → yeşil**, **B1/B2 → sarı**, **C1/C2/C2+ → kırmızı**.
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
Yeni map: `notebooks[wordId] = { color, good, enrolledAt, promotedAt }`
- `color`: `'red' | 'yellow' | 'green'` — kelime modüle ilk girdiğinde CEFR'den atanır.
- `good`: o anki renkte biriken **iyi hatırlama** sayısı (SRS quality ≥ 4 her gerçekleştiğinde +1). Terfi edince **0'a sıfırlanır**.
- `enrolledAt`, `promotedAt`: tarih damgaları (telemetri/sıralama için).
- Bir kelime "modüle kayıtlı" ise `notebooks[id]` vardır; değilse yok.

**Başlangıç rengi (CEFR → renk):**
`A1,A2 → green` · `B1,B2 → yellow` · `C1,C2,C2+ → red` · (CEFR boşsa → `yellow`, varsayılan orta).

**Terfiye uygunluk:** `color !== 'green' && good >= 5`.

### 7.2 Kalıcılık
`notebooks` şu listelere eklenir: `saveUserData` payload'ı, `handleImportFile` yükleme, yedek dışa aktarma, `resetProgress` temizleme, varsayılan `STATE.userData` init.

### 7.3 Günlük akış
1. Modüle girince sınıfa göre **varsayılan günlük adet** gösterilir, öğrenci ayarlar (`STATE.userData.notebookDailyCount` ya da ayar alanı).
2. O günün çalışma kümesi = açılmış müfredat kelimelerinden: önce **SRS'e göre bugün tekrarı gelenler**, sonra **henüz modüle kayıtlı olmayanlar** (yeni kayıt → CEFR rengiyle), adet dolana dek.
3. Küme **mevcut flash kart motoruyla** sunulur (`renderFlashcardView` altyapısı / `filteredFlashcards`). Her "İyi/Kolay" işaretlemesi hem SRS'i günceller hem ilgili kayıtlı kelimenin `good` sayacını artırır.

### 7.4 Seviye Geçme Testi
- Terfiye uygun kelime sayısı **20'ye** ulaşınca öğrenciye test **önerilir** (dayatılmaz).
- Test içeriği = yalnızca terfiye uygun kelimeler; **mevcut quiz motoru** (`startQuiz` / `renderQuizView`) bu kaynakla beslenir.
- Testte **doğru** bilinen kelime **bir renk terfi eder** (🔴→🟡→🟢), `good` sıfırlanır, `promotedAt` güncellenir. Yanlış bilinen aynı renkte kalır (ve mevcut Hata Defteri mantığı devreye girer).

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

## Açık Noktalar (denetim sonrası netleşecek)

- Modül yalnızca sınıf/müfredat (maarif) modunda mı görünür, yoksa YDS/Oxford modunda da mı? (v1 kapsamı)
- "20 uygun kelime" eşiği renk başına mı, toplam mı?
- Günlük varsayılan adetlerin sınıf bazlı değerleri.
