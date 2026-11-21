# Kitaplık Sözlük — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Learnish'in Sözlük sekmesini (kart listesi + sayfalama) etkileşimli bir kitaplıkla değiştirmek: tek raf = tek harf, harf çarkı, raf cetveli, çift sayfa açılan kitap, öneri tabanlı arama, raf etiketi filtre paneli.

**Architecture:** Her şey mevcut yapıda kalır: kod `app.js` içindeki "VIEW 4" (sözlük) bölümünün yerine yeni bir "KİTAPLIK" bölümü olarak, stiller `app.css` sonuna yeni bir bölüm olarak eklenir. Ayrı dosya açılmaz (böylece `build.py` paketleyicisi, service worker önbellek listesi ve test ortamı değişmez). Saf yardımcı fonksiyonlar (`buildLibraryIndex`, `librarySuggest` …) `window.APP` üzerinden dışa açılır ve doğrudan test edilir; render fonksiyonları `#view-directory` içeriğini string HTML ile üretir (projenin mevcut deseni).

**Tech Stack:** Saf JS (ES2020), CSS custom properties, scroll-snap, `IntersectionObserver` (yoksa kaydırma olayına geri düşer). Test: `node tests/e2e_test_runner.js` (bağımlılıksız, vm sandbox + MockElement). Paket: `python3 build.py --bundle` / `--check`.

**Spec:** `docs/superpowers/specs/2026-11-21-kitaplik-sozluk-design.md`

## Global Constraints

- Renkler yalnızca şunlar ve bunların `color-mix` karışımları: `#171e19`, `#47524c`, `#899690`, `#b7c6c2`, `#d8d3c5`, `#f5f3ed`, `#eeebe3`, `#ffffff`, `#ca0013`. Yeni hex yok.
- `#ca0013` (kırmızı) yalnızca favori kurdelesinde.
- Kütüphane renkleri `#view-directory` altında `--lib-*` değişkenleriyle tanımlanır; genel `--dp-color-*` token'ları kullanılmaz (karanlık temada tersine dönüyorlar, `app.css:107`).
- Yazı tipi `var(--dp-typography-face)` (Nunito). Köşe yarıçapları `--dp-radius-*`.
- Geçişler ≤ 0,3 s, `cubic-bezier(0.4, 0, 0.2, 1)`; `@media (prefers-reduced-motion: reduce)` altında 0 s. 3D dönüş, sürekli/otomatik hareket yok.
- Dokunma hedefleri ≥ 44 px (kitap sırtları hariç: genişlik 32–38 px, yükseklik telafi eder). Metin kontrastı WCAG AA.
- Yeni bağımlılık yok; yeni dosya yok (yalnızca `app.js`, `app.css`, `tests/e2e_test_runner.js`, `Learnish_Tek_Dosya_Web_App.html` paket çıktısı değişir).
- Kullanıcıya görünen metinler Türkçe; mevcut çip etiketleri aynen korunur ("TÜM KÜTÜPHANELER", "MAARİF MODELİ", "YDS & YÖKDİL", "KÜTÜPHANE", "TÜM DÜZEYLER", "ÖĞRENİLENLER", "TEKRAR EDİLECEKLER", "FAVORİLER", YDS kelime türü çipleri).
- Kullanıcı verisi (kelime, arama terimi) HTML'e her zaman `escapeHtml` ile girer; satır içi `onclick` içinde kelime metni taşınmaz, `data-id` kullanılır.
- Kitap diyaloğu, arama paneli ve filtre paneli `#view-directory` içinde çizilir. Test ortamının `getElementById`'si yalnızca `index.html`'deki öğeleri tanır (`tests/e2e_test_runner.js:364`); bu yüzden kısmi güncelleme yapan her fonksiyon, hedef öğe (`#lib-shelf`, `#lib-book` …) bulunamazsa `renderDirectoryView()` ile tam çizime düşer (mevcut `renderDirectoryView(cardsOnly)` deseni) ve testler `#view-directory` innerHTML'ini doğrular. `renderDirectoryView()` açık kitap/panel durumunu `STATE.library`'den okuyup yeniden çizer.

## Review Focus

1. **Filtre, açık harfi boşaltır** (ör. "D" rafındayken "Favoriler" seçilir, D'de favori yok) → raf boş gösterilmez; ilk dolu harfe geçilir. *Test: Task 6 `test_library_filter_moves_off_empty_letter`.*
2. **Filtre hiç kitap bırakmaz** → "Bu filtrelerle rafta kitap yok" boş durumu + "Filtreleri temizle" düğmesi; çarktaki tüm harfler soluk. *Test: Task 6 `test_library_filter_empty_state`.*
3. **Kitap açıkken "Öğrendim"/"Tekrar" değiştirilir ve durum filtresi aktiftir** → kitap açık kalır; kapatınca raf yenilenir, artık uymayan kitap raftan düşer. *Test: Task 4 `test_library_status_toggle_refreshes_on_close`.*
4. **Eksik alanlı kelime** (tr/phonetic/alt/example/definition yok) → kitapta "undefined", "null" ya da boş başlık görünmez; ilgili bölüm hiç çizilmez. *Test: Task 4 `test_library_book_handles_missing_fields`.*
5. **Özel karakterli arama/eş anlam** (`it's`, `"<b>x`) → metin kaçışlanır, işaretleme bozulmaz, öneri yine seçilebilir. *Test: Task 5 `test_library_search_escapes_markup`.*

---

### Task 0: Test ortamını onar (matchMedia)

Bugün 88 testin 80'i `window.matchMedia is not a function` ile düşüyor; sonraki görevlerin test döngüsü için önce bu düzelmeli.

**Files:**
- Modify: `tests/e2e_test_runner.js` (~455–480, `windowMock` nesnesi ve `sandbox`)

**Interfaces:**
- Produces: `windowMock.matchMedia(query) -> { matches: boolean, media: string, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }`; `createFreshAppEnvironment({ reducedMotion: true })` seçeneği `matches`'i `prefers-reduced-motion` sorguları için `true` yapar (varsayılan `false`).

- [ ] **Step 1:** Mevcut durumu kaydet: `node tests/e2e_test_runner.js 2>&1 | grep -cE "✔ PASS"` → beklenen `8`.
- [ ] **Step 2:** `windowMock`'a `matchMedia` ekle (yukarıdaki imza), `sandbox`'a `matchMedia: windowMock.matchMedia` ekle.
- [ ] **Step 3:** `node tests/e2e_test_runner.js 2>&1 | grep -E "✖ FAIL"` çalıştır. Beklenen: `matchMedia` hatası kalmaz. Kalan başarısızlıkları ve sebeplerini planın altına "Task 0 sonrası taban çizgisi" notu olarak yaz; sonraki görevler bu listeyi kötüleştirmemeli.
- [ ] **Step 4: Commit**
```bash
git add tests/e2e_test_runner.js docs/superpowers/plans/2026-11-21-kitaplik-sozluk.md
git commit -m "test: e2e ortamina matchMedia mock'u ekle"
```

---

### Task 1: Kitaplık veri yardımcıları

**Files:**
- Modify: `app.js` — `getFilteredDirectoryWords` (~5599) ve yeni "KİTAPLIK: VERİ" bölümü hemen altına; `window.APP` (~7761)
- Test: `tests/e2e_test_runner.js` — yeni bölüm "1.5b Kitaplık Veri" (mevcut 1.5 bölümünün yerine geçecek testler Task 3'te)

**Interfaces:**
- Produces (hepsi `window.APP` üzerinde):
  - `libraryLetterOf(word) -> string` — `word.en`'in ilk harfi; NFD ile aksan atılmış, büyük harf; `A–Z` dışındaysa `'#'`.
  - `buildLibraryIndex(words) -> { letters: string[], byLetter: Record<string, Word[]> }` — her harfte kelimeler `en`'e göre `localeCompare(…, 'en', { sensitivity: 'base' })` sıralı; `letters` yalnızca dolu harfler, `A…Z` sırasında, `'#'` en sonda.
  - `spineToneClass(cefr) -> 'tone-a1'|'tone-a2'|'tone-b1'|'tone-b2'|'tone-c1'|'tone-c2'` — `C2+` → `tone-c2`; boş/bilinmeyen → `tone-a2`.
  - `spineHeightPx(word) -> number` — `130 + min(en.length, 14) * 4 + (id % 3) * 2`; sonuç her zaman 130–190.
  - `spineLabel(en) -> string` — 22 karakteri aşarsa ilk 21 karakter + `'…'`.
  - `shelfRulerGroups(words) -> Array<{ label: string, index: number }>` — `words` sıralı tek harf rafı; 60'tan az kitapta `[]`.
- `getFilteredDirectoryWords()` artık `filters.search`'e bakmaz (spec §6.6: arama rafı süzmez). Diğer filtreler ve tekilleştirme aynen kalır.

- [ ] **Step 1: Failing testleri yaz**
```js
registerTest(1, 'Library Data', 'test_library_letter_of', () => {
  const { APP } = createFreshAppEnvironment();
  assertEqual(APP.libraryLetterOf({ en: 'abandon' }), 'A');
  assertEqual(APP.libraryLetterOf({ en: ' Éclair' }), 'E');
  assertEqual(APP.libraryLetterOf({ en: '1st' }), '#');
  assertEqual(APP.libraryLetterOf({ en: 'Ƒoo' }), '#');
});
registerTest(1, 'Library Data', 'test_library_index_groups_and_sorts', () => {
  const { APP } = createFreshAppEnvironment();
  const idx = APP.buildLibraryIndex([{ id:1,en:'dog' },{ id:2,en:'apple' },{ id:3,en:'Desk' },{ id:4,en:'1st' }]);
  assertDeepEqual(idx.letters, ['A','D','#']);
  assertDeepEqual(idx.byLetter.D.map(w => w.en), ['Desk','dog']);
});
registerTest(1, 'Library Data', 'test_library_spine_tone_and_size', () => {
  const { APP } = createFreshAppEnvironment();
  assertEqual(APP.spineToneClass('A1'), 'tone-a1');
  assertEqual(APP.spineToneClass('C2+'), 'tone-c2');
  assertEqual(APP.spineToneClass(undefined), 'tone-a2');
  assertEqual(APP.spineHeightPx({ id: 3, en: 'go' }), 138);
  assertEqual(APP.spineHeightPx({ id: 5, en: 'x'.repeat(68) }), 190);
  assertEqual(APP.spineLabel('be in charge of something important'), 'be in charge of somet…');
  assertEqual(APP.spineLabel('decide'), 'decide');
});
registerTest(1, 'Library Data', 'test_library_ruler_groups', () => {
  const { APP } = createFreshAppEnvironment();
  const mk = (p, n) => Array.from({ length: n }, (_, i) => ({ id: i, en: p + String.fromCharCode(97 + (i % 26)) + i }));
  assertDeepEqual(APP.shelfRulerGroups(mk('da', 59)), []);
  const words = [...mk('da',20),...mk('de',20),...mk('di',20),...mk('do',20)];
  assertDeepEqual(APP.shelfRulerGroups(words), [
    { label:'DA', index:0 }, { label:'DE', index:20 }, { label:'DI', index:40 }, { label:'DO', index:60 }]);
  const many = 'abcdefghij'.split('').flatMap(c => mk('d' + c, 10));
  const g = APP.shelfRulerGroups(many);
  assert(g.length <= 8, 'en fazla 8 grup');
  assertEqual(g[0].index, 0);
  assert(g.some(x => x.label.includes('–')), 'birleşen gruplar "DA–DB" biçiminde');
});
registerTest(1, 'Library Data', 'test_filtered_words_ignore_search', () => {
  const env = createFreshAppEnvironment();
  const before = env.APP.getFilteredDirectoryWords().length;
  env.APP.getState().directoryFilters.search = 'abandon';
  assertEqual(env.APP.getFilteredDirectoryWords().length, before);
});
```
(`getFilteredDirectoryWords` `window.APP`'e eklenir.)

- [ ] **Step 2:** `node tests/e2e_test_runner.js --filter=library` → beklenen: 5 FAIL (`APP.libraryLetterOf is not a function` vb.).
- [ ] **Step 3:** Fonksiyonları yukarıdaki imzalarla yaz. `shelfRulerGroups` algoritması (spec "fazlaysa komşu gruplar birleştirilir"):
```js
// 1) Ardışık kelimeleri ilk iki harfe göre kova yap: { first:'DA', last:'DA', index, count }
// 2) kovalar.length > 8 olduğu sürece: count toplamı en küçük olan komşu çifti birleştir
//    (first = soldaki.first, last = sağdaki.last, index = soldaki.index, count = toplam)
// 3) label = first === last ? first : first + '–' + last
```
İki harf: `en`'in ilk iki harfi, NFD + büyük harf; ikinci harf harf değilse tek harf kullan.
- [ ] **Step 4:** `node tests/e2e_test_runner.js --filter=library` → 5 PASS; tam koşuda Task 0 taban çizgisinden yeni FAIL yok.
- [ ] **Step 5: Commit** — `feat(kitaplik): raf indeksi, sirt tonu ve raf cetveli yardimcilari`

---

### Task 2: Arama önerileri

**Files:**
- Modify: `app.js` — "KİTAPLIK: VERİ" bölümü; `window.APP`
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `getFilteredDirectoryWords()` (Task 1).
- Produces: `librarySuggest(query, filteredWords, allWords, limit = 6) -> Array<{ word: Word, outsideFilter: boolean }>`
  - `query` kırpılır, küçük harfe çevrilir; boşsa `[]`.
  - Eşleşme alanları: `en`, `alt`, `tr`, `synonym`, `definition` (`includes`).
  - Sıra: (1) `en` sorguyla başlayanlar, (2) `en` içinde geçenler, (3) diğer alanlarda geçenler; her kademede `en` alfabetik.
  - Önce `filteredWords` içinden doldurulur (`outsideFilter:false`); `limit`'e ulaşılmadıysa `allWords`'ten filtre dışı eşleşmeler aynı sırayla eklenir (`outsideFilter:true`). Aynı `id` iki kez dönmez.

- [ ] **Step 1: Failing testler**
```js
registerTest(1, 'Library Search', 'test_library_suggest_ranking', () => {
  const { APP } = createFreshAppEnvironment();
  const ws = [{id:1,en:'abandon',tr:'terk etmek'},{id:2,en:'ban',tr:'yasak'},{id:3,en:'urban',tr:'kentsel'},{id:4,en:'leave',tr:'ayrılmak',alt:'abandon'}];
  assertDeepEqual(APP.librarySuggest('ban', ws, ws).map(s => s.word.id), [2,1,3,4]); // 4: alt='abandon' içinde geçer
  assertDeepEqual(APP.librarySuggest('abandon', ws, ws).map(s => s.word.id), [1,4]);
  assertDeepEqual(APP.librarySuggest('terk', ws, ws).map(s => s.word.id), [1]);
  assertDeepEqual(APP.librarySuggest('   ', ws, ws), []);
});
registerTest(1, 'Library Search', 'test_library_suggest_outside_filter_and_limit', () => {
  const { APP } = createFreshAppEnvironment();
  const all = Array.from({ length: 10 }, (_, i) => ({ id: i, en: 'deal' + i }));
  const r = APP.librarySuggest('deal', all.slice(0, 2), all);
  assertEqual(r.length, 6);
  assertDeepEqual(r.map(s => s.outsideFilter), [false,false,true,true,true,true]);
});
```
- [ ] **Step 2:** `--filter=library_suggest` → 2 FAIL.
- [ ] **Step 3:** `librarySuggest`'i yaz.
- [ ] **Step 4:** `--filter=library_suggest` → 2 PASS.
- [ ] **Step 5: Commit** — `feat(kitaplik): arama onerileri`

---

### Task 3: Raf ekranı (iskelet, raf, harf çarkı, raf cetveli)

**Files:**
- Modify: `app.js` — `renderDirectoryView` (~5842–5996) baştan yazılır; `generateWordCardsHtml`, `generateDirectoryPaginationHtml`, `setDirectoryPage`, `toggleWordCard`, `wordCardKey`, `updateDirSearchChrome` silinir ve `window.APP`'ten çıkarılır; `STATE` (~468–500) `library` alanı eklenir.
- Modify: `app.css` — dosya sonuna `/* ===== KİTAPLIK ===== */` bölümü; eski sözlük kartı/sayfalama sınıfları (`.words-grid`, `.word-card`, `.dir-page-btn`, `.directory-controls` …) başka ekranda kullanılmıyorsa silinir (`grep` ile doğrula).
- Test: `tests/e2e_test_runner.js` — "1.5 Word Directory" bölümündeki `test_directory_search_by_english_word`, `test_directory_search_by_turkish_translation`, `test_directory_pagination_controls` silinir (davranış spec ile kalktı); `test_directory_absence_of_redundant_grade_filter` Task 6'ya taşınır.

**Interfaces:**
- Consumes: Task 1 yardımcıları.
- Produces:
  - `STATE.library = { letter: null, rendered: 0, bookId: null, searchOpen: false, filtersOpen: false, dirty: false }` (`dirty`: kitap açıkken durum değişti, kapatınca raf yenilenecek — Task 4; `searchOpen`/`filtersOpen` Task 5/6'da kullanılır)
  - `renderDirectoryView()` — tüm iskeleti çizer: başlık ("KELİME KÜTÜPHANESİ", `<h2>` = "`{L}` Rafı", sayaç "`{n}` KİTAP"), 🔍 düğmesi `#lib-search-btn`, raf etiketi `#lib-filter-label` (Task 6 doldurur; şimdilik özet metni "Tüm kütüphaneler · Tüm düzeyler"), raf `#lib-shelf` (`role="list"`), cetvel `#lib-ruler`, çark `#lib-wheel` (`role="tablist"`, her harf `role="tab"`, `aria-selected`, `data-letter`). `STATE.library.letter` boş ya da indekste yoksa ilk dolu harf seçilir.
  - `selectLibraryLetter(letter: string) -> void` — harfi ayarlar, `rendered = 0`, rafı + cetveli + sayacı yeniden çizer, çarkı ortalar; ekran okuyucuya `"{L} rafı, {n} kitap"` duyurur (mevcut `announceStatus`).
  - `appendLibraryBooks() -> void` — sıradaki 80 kitabı rafa ekler (`rendered += 80`). İlk çizimde 80. Rafın sonundaki gözcü öğeyi `IntersectionObserver` izler; `IntersectionObserver` yoksa rafın `scroll` olayında sona < 400 px kaldıysa çağrılır.
  - `jumpLibraryRuler(index: number) -> void` — gerekirse `rendered`'i `index`'i kapsayana kadar artırır, o kitabı `scrollIntoView({ inline: 'start' })` yapar.
  - Kitap sırtı işaretlemesi: `<button class="lib-book {tone}" data-id="{id}" style="height:{h}px" aria-label="{en} — {cefr}">` içinde `<span class="lib-spine-text">{spineLabel}</span>`; favoride `.is-starred` (kurdele `::after`), öğrenildiyse `.is-learned`, tekrardaysa `.is-review`.
  - Çark: yatay `scroll-snap-type: x mandatory`, harfler `scroll-snap-align: center`; kaydırma 120 ms durunca ortadaki harf seçilir; harfe tıklama ve `ArrowLeft/ArrowRight` da seçer. Boş harfler (Task 6) `.is-empty` + `aria-disabled="true"`.
  - Raf: yatay kaydırma, `scroll-snap-type: x proximity`; kitaba tıklama `openLibraryBook(id)` çağırır (Task 4'te tanımlanır; bu görevde yoksa no-op koruması).
- CSS `--lib-*` değişkenleri (açık / `[data-theme="dark"] #view-directory`), spec §6.2 ve §6.8'deki değerlerle: `--lib-floor`, `--lib-board`, `--lib-ink`, `--lib-ink-soft`, `--lib-tone-a1…c2` (+ her biri için `-text`), `--lib-ribbon: #ca0013`, `--lib-page`.

- [ ] **Step 1: Failing testler**
```js
registerTest(1, 'Library Shelf', 'test_library_renders_first_letter_shelf', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const html = env.document.getElementById('view-directory').innerHTML;
  assertIncludes(html, 'KELİME KÜTÜPHANESİ');
  assertIncludes(html, 'A Rafı');
  assertIncludes(html, 'class="lib-book tone-');
  assert(!html.includes('dir-page-btn'), 'sayfalama kalktı');
});
registerTest(1, 'Library Shelf', 'test_library_select_letter_updates_shelf', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.selectLibraryLetter('D');
  const html = env.document.getElementById('view-directory').innerHTML;
  const n = env.APP.buildLibraryIndex(env.APP.getFilteredDirectoryWords()).byLetter.D.length;
  assertIncludes(html, 'D Rafı');
  assertIncludes(html, `${n.toLocaleString('tr-TR')} KİTAP`);
  assertEqual(env.APP.getState().library.letter, 'D');
});
registerTest(1, 'Library Shelf', 'test_library_renders_in_chunks_of_80', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.selectLibraryLetter('S');
  assertEqual(env.APP.getState().library.rendered, 80);
  env.APP.appendLibraryBooks();
  assertEqual(env.APP.getState().library.rendered, 160);
});
registerTest(1, 'Library Shelf', 'test_library_starred_book_has_ribbon', () => {
  const env = createFreshAppEnvironment();
  const w = env.APP.buildLibraryIndex(env.APP.getFilteredDirectoryWords()).byLetter.A[0];
  env.APP.toggleStarred(w.id);
  env.APP.switchView('directory');
  env.APP.selectLibraryLetter('A');
  assertIncludes(env.document.getElementById('view-directory').innerHTML, `is-starred" data-id="${w.id}"`);
});
```
(Son assert sınıf sırası `class="lib-book {tone} …is-starred" data-id=` olacak şekilde sabittir; işaretlemeyi buna göre üret.)
- [ ] **Step 2:** `--filter=library` → yeni 4 test FAIL.
- [ ] **Step 3:** STATE, render fonksiyonları ve CSS'i yaz; eski fonksiyon/test/CSS'i sil.
- [ ] **Step 4:** `--filter=library` → hepsi PASS; tam koşuda taban çizgisinden yeni FAIL yok (silinen testler hariç).
- [ ] **Step 5:** Görsel kontrol: `Uygulamayı_Başlat.command` ile uygulamayı aç (veya `python3 -m http.server` ile kök dizini sun), Sözlük sekmesi, 375 px genişlik: raf, çark, cetvel (A rafında görünür, Z'de görünmez) açık ve karanlık temada palete uygun.
- [ ] **Step 6: Commit** — `feat(kitaplik): raf, harf carki ve raf cetveli`

---

### Task 4: Kitap (çift sayfa)

**Files:**
- Modify: `app.js` — "KİTAPLIK: KİTAP" bölümü; `window.APP`; geri tuşu/Esc işleyicisi (mevcut `closeModals` / `popstate` akışına bağlan, `goBack` ~ "Navigation" bölümü)
- Modify: `app.css` — KİTAPLIK bölümü
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: Task 3 (`STATE.library`, `selectLibraryLetter`), mevcut `speakWord`, `toggleStarred`, `toggleLearned`, `toggleReview`, `openSpeechCoach`, `openClassifierForWord`, `extractPreposition`, `getWordSynonym`.
- Produces:
  - `openLibraryBook(id: number) -> void` — `STATE.library.bookId = id`; `#lib-book` (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` kelime başlığı) çizilir; odak kitaba taşınır; açıldığı rafın harfi seçili değilse önce `selectLibraryLetter`.
  - `closeLibraryBook() -> void` — diyaloğu kaldırır, odağı ilgili sırta geri verir; kitap açıkken durum değiştiyse rafı yeniden çizer (Review Focus 3).
  - `turnLibraryPage(delta: -1 | 1) -> void` — aynı raftaki komşu kitaba geçer; rafın başında/sonunda yerinde kalır (sarmaz).
  - Sol sayfa: CEFR · tür etiketi, kelime, okunuş, 🔊 (`speakWord`), ♥ (`toggleStarred`), kütüphane çipleri (MAARİF/OXFORD/YDS — `isMaarifWord/isOxfordWord/isYDSWord`), ikon sırası `data-act="learned|review|coach|context"` (her biri ≥44 px, `aria-pressed` durumla).
  - Sağ sayfa: anlam (`tr`), edat ipucu (`extractPreposition`) ve `desc`/`cat` satırı varsa küçük not, eş anlam çipleri (`<button class="lib-syn" data-term="…">`, tıklayınca `searchDirectory(term)`), `definition`, `example` (YDS modülünde `ydsExample` varsa o). Boş alanın bölümü hiç çizilmez.
  - Etkileşim: kitap üzerinde yatay sürükleme |dx| > 40 px ve |dx| > |dy| → `turnLibraryPage`; `ArrowLeft/Right` sayfa çevirir; `Escape`, karartmaya tıklama, aşağı sürükleme dy > 80 px, tarayıcı geri tuşu kapatır.
  - Genişlik ≤ 360 px: sayfalar alt alta. `prefers-reduced-motion` altında açılış/geçiş animasyonsuz.

- [ ] **Step 1: Failing testler**
```js
registerTest(1, 'Library Book', 'test_library_open_book_shows_both_pages', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const w = env.window.WORDS_DATA.find(x => x.en === 'abandon');
  env.APP.openLibraryBook(w.id);
  const html = env.document.getElementById('view-directory').innerHTML;
  assertIncludes(html, 'role="dialog"');
  assertIncludes(html, '>abandon<');
  assertIncludes(html, w.tr);
  ['learned','review','coach','context'].forEach(a => assertIncludes(html, `data-act="${a}"`));
  assertEqual(env.APP.getState().library.letter, 'A');
});
registerTest(1, 'Library Book', 'test_library_turn_page_moves_to_neighbor_and_stops_at_ends', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const shelf = env.APP.buildLibraryIndex(env.APP.getFilteredDirectoryWords()).byLetter.Z;
  env.APP.openLibraryBook(shelf[0].id);
  env.APP.turnLibraryPage(-1);
  assertEqual(env.APP.getState().library.bookId, shelf[0].id);
  env.APP.turnLibraryPage(1);
  assertEqual(env.APP.getState().library.bookId, shelf[1].id);
  env.APP.openLibraryBook(shelf[shelf.length - 1].id);
  env.APP.turnLibraryPage(1);
  assertEqual(env.APP.getState().library.bookId, shelf[shelf.length - 1].id);
});
registerTest(1, 'Library Book', 'test_library_book_handles_missing_fields', () => {
  const env = createFreshAppEnvironment();
  const data = env.window.WORDS_DATA; // ortamlar arası paylaşılan dizi: mutlaka geri al
  data.push({ id: 999999, en: 'zzzbare', tr: 'çıplak' });
  try {
    env.APP.switchView('directory');
    env.APP.openLibraryBook(999999);
    const html = env.document.getElementById('view-directory').innerHTML;
    ['undefined', 'null', 'Örnek</', 'Eş anlam</'].forEach(s => assert(!html.includes(s), `kitapta "${s}" olmamalı`));
  } finally { data.pop(); }
});
registerTest(3, 'Library Book', 'test_library_status_toggle_refreshes_on_close', () => {
  const env = createFreshAppEnvironment();
  const w = env.window.WORDS_DATA.find(x => x.en === 'abandon');
  env.APP.toggleReview(w.id);
  env.APP.switchView('directory');
  env.APP.getState().directoryFilters.status = 'review';
  env.APP.renderDirectoryView();
  env.APP.openLibraryBook(w.id);
  env.APP.toggleReview(w.id);
  assertEqual(env.APP.getState().library.bookId, w.id, 'kitap açık kalır');
  env.APP.closeLibraryBook();
  assert(!env.document.getElementById('view-directory').innerHTML.includes(`data-id="${w.id}"`), 'artık uymayan kitap raftan düşer');
});
registerTest(1, 'Library Book', 'test_library_close_book', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.openLibraryBook(env.window.WORDS_DATA.find(x => x.en === 'abandon').id);
  env.APP.closeLibraryBook();
  assertEqual(env.APP.getState().library.bookId, null);
  assert(!env.document.getElementById('view-directory').innerHTML.includes('role="dialog"'));
});
```
(`zzzbare` için `Örnek`/`Eş anlam` başlıkları kitapta tam bu metinlerle yazılır: "Örnek", "Eş anlam".)
- [ ] **Step 2:** `--filter=library_` → 5 yeni FAIL.
- [ ] **Step 3:** Kitap fonksiyonlarını, olay bağlamayı ve CSS'i yaz.
- [ ] **Step 4:** `--filter=library` → hepsi PASS; tam koşuda yeni FAIL yok.
- [ ] **Step 5:** Görsel kontrol (375 px ve 340 px, açık/karanlık): kitap açılır, sürükleyerek sayfa çevrilir, Esc/geri kapatır, ikon sırası dokunulabilir.
- [ ] **Step 6: Commit** — `feat(kitaplik): cift sayfa kitap`

---

### Task 5: Arama

**Files:**
- Modify: `app.js` — "KİTAPLIK: ARAMA" bölümü; `searchDirectory` (~5812) yeniden tanımlanır; `clearDirectorySearch` silinir; `window.APP`
- Modify: `app.css`
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `librarySuggest` (Task 2), `openLibraryBook`, `selectLibraryLetter`.
- Produces:
  - `openLibrarySearch(term = '') -> void` — üstte `#lib-search` paneli + `<input id="lib-search-input">` (placeholder "İngilizce, Türkçe veya eş anlam ara…"); 250 ms gecikmeyle `renderLibrarySuggestions()`.
  - `renderLibrarySuggestions() -> void` — `#lib-suggest` (`role="listbox"`), her öneri `<button role="option" class="lib-suggest-item[ is-outside]" data-id="{id}">` içinde kelime + anlam; filtre dışındakilerde "filtre dışında" küçük etiketi. Sonuç yoksa "Eşleşen kelime yok".
  - `pickLibrarySuggestion(id: number) -> void` — kelime aktif filtrelerin dışındaysa `STATE.directoryFilters`'ı `{ dataset:'all', cefr:'all', status:'all', pos:'all', theme:'all' }` yapar (YDS modülü YDS havuzunda kalır); aramayı kapatır, `openLibraryBook(id)`.
  - `Enter` → `en` sorguyla tam eşleşen (büyük/küçük harf duyarsız) öneri varsa onu, yoksa ilk öneriyi seçer.
  - `searchDirectory(term: string) -> void` — `en`'i `term` ile tam eşleşen kelime varsa doğrudan `pickLibrarySuggestion`, yoksa `openLibrarySearch(term)`. (Eş anlam çipleri ve diğer ekranlar bunu kullanır.)
  - `STATE.directoryFilters.search` yalnızca giriş değerini tutar; hiçbir yerde süzme için okunmaz.

- [ ] **Step 1: Failing testler**
```js
registerTest(1, 'Library Search', 'test_library_search_picks_and_opens_book', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.searchDirectory('abandon');
  const id = env.window.WORDS_DATA.find(x => x.en === 'abandon').id;
  assertEqual(env.APP.getState().library.letter, 'A');
  assertEqual(env.APP.getState().library.bookId, id);
});
registerTest(1, 'Library Search', 'test_library_search_turkish_lists_suggestion', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.openLibrarySearch('terk etmek');
  env.APP.renderLibrarySuggestions();
  assertIncludes(env.document.getElementById('view-directory').innerHTML, 'abandon');
});
registerTest(3, 'Library Search', 'test_library_pick_outside_filter_resets_filters', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const s = env.APP.getState();
  s.directoryFilters.status = 'starred';
  env.APP.renderDirectoryView();
  const id = env.window.WORDS_DATA.find(x => x.en === 'abandon').id;
  env.APP.pickLibrarySuggestion(id);
  assertEqual(s.directoryFilters.status, 'all');
  assertEqual(s.library.bookId, id);
});
registerTest(2, 'Library Search', 'test_library_search_escapes_markup', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.openLibrarySearch(`"<b>it's`);
  env.APP.renderLibrarySuggestions();
  const html = env.document.getElementById('view-directory').innerHTML;
  assert(!html.includes('<b>it'), 'ham işaretleme girmemeli');
  assertIncludes(html, '&quot;&lt;b&gt;it&#39;s');
});
```
(Son testin beklenen kaçış biçimi mevcut `escapeHtml` çıktısına göre; farklıysa testi `escapeHtml('"<b>it\'s')` ile karşılaştıracak şekilde yaz, değer sabit kalır.)
- [ ] **Step 2:** `--filter=library_search` → 4 FAIL.
- [ ] **Step 3:** Arama panelini, önerileri ve `searchDirectory`'yi yaz; `grep -n "clearDirectorySearch\|dir-search-input" app.js index.html` → boş.
- [ ] **Step 4:** `--filter=library` → hepsi PASS; tam koşuda yeni FAIL yok.
- [ ] **Step 5: Commit** — `feat(kitaplik): oneri tabanli arama`

---

### Task 6: Raf etiketi ve filtre paneli

**Files:**
- Modify: `app.js` — "KİTAPLIK: FİLTRE" bölümü; `clearDirectoryFilters`; `window.APP`
- Modify: `app.css`
- Test: `tests/e2e_test_runner.js` — `test_directory_filter_by_pos`, `test_directory_filter_by_cefr`, `test_directory_absence_of_redundant_grade_filter`, `test_combo_directory_filter_then_mark_starred` yeni panele göre güncellenir (aynı adlarla, aynı niyetle).

**Interfaces:**
- Consumes: `getFilteredDirectoryWords`, `buildLibraryIndex`, `selectLibraryLetter`.
- Produces:
  - `libraryFilterSummary() -> string` — örnek: "Tüm kütüphaneler · Tüm düzeyler"; aktif değerler kısa adlarla: "Maarif", "YDS & YÖKDİL", "Kütüphane"; "B2"; "Favoriler"/"Öğrenilenler"/"Tekrar edilecekler"; YDS türü "Fiiller"/"İsimler"/"Sıfat & zarf". Parçalar " · " ile.
  - `openLibraryFilters() / closeLibraryFilters() -> void` — alttan panel `#lib-filters` (`role="dialog"`), içinde mevcut çip grupları aynı etiket ve `data-val` değerleriyle (`#dataset-chips` veya YDS modülünde `#yds-pos-chips`, `#cefr-chips`, `#status-chips`), "Filtreleri temizle" düğmesi.
  - `setLibraryFilter(group: 'dataset'|'cefr'|'status'|'pos', value: string) -> void` — `STATE.directoryFilters[group] = value`, indeksi yeniden kurar, raf etiketini/sayacı/çarkı günceller; seçili harf boşaldıysa ilk dolu harfe geçer; hiç kitap yoksa boş durum.
  - Boş durum: `#lib-shelf` içinde "Bu filtrelerle rafta kitap yok" + `onclick="window.APP.clearDirectoryFilters()"` düğmesi "Filtreleri temizle"; tüm çark harfleri `.is-empty`.
  - `clearDirectoryFilters()` filtreleri sıfırlar ve `renderDirectoryView()` çağırır (mevcut adıyla kalır).

- [ ] **Step 1: Failing testler**
```js
registerTest(1, 'Library Filters', 'test_library_filter_summary', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  assertEqual(env.APP.libraryFilterSummary(), 'Tüm kütüphaneler · Tüm düzeyler');
  env.APP.setLibraryFilter('cefr', 'B2');
  env.APP.setLibraryFilter('status', 'starred');
  assertEqual(env.APP.libraryFilterSummary(), 'Tüm kütüphaneler · B2 · Favoriler');
});
registerTest(2, 'Library Filters', 'test_library_filter_moves_off_empty_letter', () => {
  const env = createFreshAppEnvironment();
  const a = env.window.WORDS_DATA.find(x => x.en === 'abandon');
  env.APP.toggleStarred(a.id);
  env.APP.switchView('directory');
  env.APP.selectLibraryLetter('D');
  env.APP.setLibraryFilter('status', 'starred');
  assertEqual(env.APP.getState().library.letter, 'A');
  assertIncludes(env.document.getElementById('view-directory').innerHTML, 'is-empty');
});
registerTest(2, 'Library Filters', 'test_library_filter_empty_state', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.setLibraryFilter('status', 'starred');
  const html = env.document.getElementById('view-directory').innerHTML;
  assertIncludes(html, 'Bu filtrelerle rafta kitap yok');
  assertIncludes(html, 'Filtreleri temizle');
});
```
Güncellenen eski testler: `filter_by_cefr` → `setLibraryFilter('cefr','A1')` sonrası raftaki her `lib-book` `tone-a1`; `filter_by_pos` → YDS modülünde `setLibraryFilter('pos','verb')` sonrası indeksteki tüm kelimeler `getWordPOS === 'verb'` (APP'e açılmıyorsa `getFilteredDirectoryWords()` üzerinden); `absence_of_redundant_grade_filter` → `openLibraryFilters()` sonrası panelde "TÜM KÜTÜPHANELER", "KÜTÜPHANE", "YDS & YÖKDİL" var, "MEB: 5. SINIF MAARİF" yok; combo test → `setLibraryFilter('dataset','oxford')`.
- [ ] **Step 2:** `--filter=library_filter` ve `--filter=directory` → yeni/güncel testler FAIL.
- [ ] **Step 3:** Filtre panelini, özeti ve boş durumu yaz.
- [ ] **Step 4:** `node tests/e2e_test_runner.js` tamamı → taban çizgisinden yeni FAIL yok; tüm `library`/`directory` testleri PASS.
- [ ] **Step 5: Commit** — `feat(kitaplik): raf etiketi ve filtre paneli`

---

### Task 7: Paket, doğrulama ve son görsel kontrol

**Files:**
- Modify: `Learnish_Tek_Dosya_Web_App.html` (üretilen), `service-worker.js` (`CACHE_NAME` paketleyici güncelliyorsa ona bırakılır)

- [ ] **Step 1:** `python3 build.py --bundle` → hata yok.
- [ ] **Step 2:** `python3 build.py --check` → exit 0.
- [ ] **Step 3:** `node tests/e2e_test_runner.js` → `test_scenario_single_file_bundle_integrity` dahil, taban çizgisinden yeni FAIL yok.
- [ ] **Step 4:** Uygulamada uçtan uca kontrol (375 px, açık + karanlık, "hareketi azalt" açık/kapalı): Sözlük → A rafı; çarkla S'ye geç, cetvelle "ST"ye atla; bir kitabı aç, iki sayfa çevir, ♥ ile kurdele çıksın, kapat; 🔍 "terk" → abandon; Favoriler filtresi → yalnız kurdeleli kitaplar; filtreleri temizle. Konsolda hata yok. Ekran görüntülerini kullanıcıya gönder.
- [ ] **Step 5: Commit** — `build: kitaplik sozluk paketi`

---

## Task 0 sonrası taban çizgisi
(Task 0 Step 3'te doldurulur.)

Task 0 sonrası (2026-11-21): 88 testten 83 PASS, 5 FAIL. Kalan 5'i kitaplıkla ilgisiz, önceden var olan uygulama hataları:
- `test_nav_home_view_orientation_and_modules_guide` — "Home view should contain module guide section"
- `test_grade_modal_all_modules_clickable_and_scrollable` — tanımsız `--dp-color-ink-secondary` (`app.css:6368`)
- `test_pdf_worksheet_generation_curriculum` — "5th grade curriculum target words should not be empty"
- `test_pdf_worksheet_generation_quiz_with_answer_key` — "Quiz worksheet with 20 limit should generate exactly 20 questions"
- `test_pdf_worksheet_generation_cut_fold_flashcards` — "Flashcard worksheet should contain cut card elements"
Sonraki görevlerin kuralı: bu listeye yeni test eklenmez.
