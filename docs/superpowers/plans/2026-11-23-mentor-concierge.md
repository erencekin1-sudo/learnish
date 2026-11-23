# Mentor Concierge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Köşedeki mentor'u (`Buddy`), çevrimdışı ve uydurma yapmayan; ilerlemeye duyarlı akıllı öneriler ve aranabilir bir komut paleti sunan bir concierge'e dönüştürmek.

**Architecture:** Mentor'un "beyni" (metin normalleştirme + kelime indeksi, komut kataloğu + eşleştirici, öneri üreticisi) DOM'dan ve zamanlayıcılardan bağımsız **saf fonksiyonlar** olarak `Buddy` içine yazılır ve test için dışarı açılır. Panel UI bu saf fonksiyonların döndürdüğü veriyi çizen ince bir katmandır. Hiçbir yeni iş mantığı eklenmez; komutlar yalnızca var olan `window.APP` fonksiyonlarını çağırır. Tüm eşleştirme yerel, kural tabanlı dizge işidir (ağ/model yok).

**Tech Stack:** Saf JavaScript (tek IIFE, `app.js` içindeki `Buddy` modülü), `app.css`; test: bağımlılıksız Node VM koşucusu (`tests/e2e_test_runner.js`); çevrimdışı PWA.

**Spec:** `docs/superpowers/specs/2026-11-23-mentor-concierge-design.md`

## Global Constraints

- **Çevrimdışı / API'siz:** Hiçbir ağ çağrısı, API anahtarı, üretken model veya harici NLP kütüphanesi eklenmez. Tüm mantık yereldir.
- **Uydurma yok:** Mentor yalnızca bilinen komut kataloğundan ve kullanıcının yerel verisinden konuşur. Serbest metin yalnızca sabit listeyi süzer; eşleşme yoksa güvenli geri dönüş metni gösterilir.
- **Yeni iş mantığı yok:** Komutlar yalnızca mevcut `APP` fonksiyonlarını çağırır (`switchView`, `switchModule`, `startDailyQuiz`, `startDailyFlashcards`, `startSRSDueQuiz`, `startSRSDueFlashcards`, `startMistakeQuiz`, `startMistakeFlashcards`, `goToTodayMEBDay`, `openSpeechCoach`, `openPdfStudio`, `openModesModal`, `openCurriculumModal`, `openSettingsModal`, `searchDirectory`, `openFeedbackModal`). İlerleme sinyalleri yalnızca mevcut `getSRSStats`, `getMistakeStats`, `getMEBCalendarInfo` ve `STATE` üzerinden okunur.
- **Yeni dosya yok:** Tüm JS `app.js`'teki `Buddy` modülüne, tüm CSS `app.css`'e eklenir. Böylece `service-worker.js` önbellek listesi (`ASSETS_TO_CACHE`) değişmez ve `build.py` ek iş gerektirmez.
- **Palet:** Yalnızca DESIGN.md'deki token'lar: `--dp-color-ink #171e19`, `-ink-muted #47524c`, `-ink-subtle #899690`, `-sage #b7c6c2`, `-sand #d8d3c5`, `-surface-subtle #f5f3ed`, `-paper #eeebe3`, `#ffffff`, `-red #ca0013` (yalnızca kritik vurgu). Nunito.
- **Dil:** Arayüz Türkçe. Eşleştirme hem Türkçe hem İngilizce token'ları (quiz, flashcard vb.) kapsar; büyük/küçük harf ve Türkçe karakter (İ/ı, ş, ç, ğ, ü, ö) normalize edilir.
- **Erişilebilirlik / hareket:** Concierge paneli `aria-live` olmayan ayrı bir kapta (`role=dialog` + `role=listbox`) kurulur; klavye ile gezilebilir (ok/Enter/Esc). `prefers-reduced-motion` (mevcut `reduce()`) animasyonları kapatır.
- **Kapsam kararı (kullanıcı):** Öneriler aktif modüle göre hesaplanır; aktif modülde aksiyon yoksa diğer modüller taranıp modül-değiştiren öneri sunulur.
- **Mevcut davranış korunur:** İlk karşılama, tanıtım turu (`startTour`), olay tepkileri (`react`), telaffuz (`pronounce`), `say`/`onView` çalışmaya devam eder.

## Review Focus

Spec'in ima ettiği ama hiçbir görevin açıkça test etmediği, kullanıcıyı en çok etkileyecek beş durum. Her biri sahibi göreve test olarak eklenir:
1. **Karışık Türkçe girdi:** "ŞINAV", "İstatistik", "telaffüz" gibi büyük harf/diakritik girdiler doğru komutlara eşleşmeli. → Task 2 testleri.
2. **Komut kelimesi aynı zamanda gerçek bir sözcük olduğunda** (örn. "test"): körlemesine kelime aramasına değil, komut listesine düşmeli; kelime araması yalnızca kalan token gerçek bir sözcükken eklenir. → Task 2 testi.
3. **Boş / yalnızca boşluk / yalnızca noktalama girdi:** çökmeden öneri durumunu göstermeli; matcher boş dizi döndürmeli. → Task 2 + Task 4 testleri.
4. **Oxford modülündeyken Maarif'te tekrar birikmesi:** "her şey güncel" değil, "X modülüne geç" önerisi çıkmalı. → Task 3 testi.
5. **Panelin tekrar tekrar açılıp kapanması ve reduced-motion:** çift DOM düğümü oluşmamalı, zamanlayıcı/aralık sızmamalı. → Task 4 testi.

---

### Task 1: Metin normalleştirme + kelime arama indeksi

**Files:**
- Modify: `app.js` — `Buddy` modülü (~8454–8569), dönüş nesnesine ekleme (~8568).
- Test: `tests/e2e_test_runner.js` (yeni `registerTest` blokları, kategori `Mentor Concierge`).

**Interfaces:**
- Produces:
  - `normalize(str: string) -> string` — küçük harf, Türkçe karakter sadeleştirme (İ/ı→i, ş→s, ç→c, ğ→g, ü→u, ö→o), diakritik/noktalama temizliği, tek boşluğa indirgeme.
  - `resolveWordLookup(query: string) -> { word: string } | null` — sorgudaki token'lar normalize edilip, açılışta bir kez kurulan normalize edilmiş İngilizce kelime `Set`'inde (kaynak: `WORDS_DATA`'nın `en` alanı) birebir eşleşen ilk token'ı `{ word }` olarak döndürür; eşleşme yoksa `null`. İndeks tembel (ilk çağrıda) kurulur ve `Buddy` kapsamında önbelleklenir.
- `Buddy` dönüş nesnesine `normalize` ve `resolveWordLookup` eklenir (test için).

- [ ] **Step 1: Write the failing tests**

```javascript
registerTest(1, 'Mentor Concierge', 'test_mentor_normalize_turkish', () => {
  const env = createFreshAppEnvironment();
  const n = env.APP.buddy.normalize;
  assertEqual(n('ŞINAV'), 'sinav', 'Türkçe büyük harf ve ş normalize edilmeli');
  assertEqual(n('İstatistik'), 'istatistik', 'İ küçük i olmalı');
  assertEqual(n('  Çok   Güzel! '), 'cok guzel', 'diakritik/noktalama/boşluk temizlenmeli');
});

registerTest(2, 'Mentor Concierge', 'test_mentor_word_lookup_real_vs_fake', () => {
  const env = createFreshAppEnvironment();
  const realWord = env.sandbox.WORDS_DATA[0].en;
  const hit = env.APP.buddy.resolveWordLookup(realWord + ' anlamı');
  assert(hit && env.APP.buddy.normalize(hit.word) === env.APP.buddy.normalize(realWord), 'gerçek kelime çözülmeli');
  assertEqual(env.APP.buddy.resolveWordLookup('zzzqwxnotaword'), null, 'olmayan kelime null dönmeli');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: FAIL (`env.APP.buddy.normalize is not a function`).

- [ ] **Step 3: Implement `normalize` and `resolveWordLookup` in the `Buddy` module**

`normalize`: tek `String.prototype.replace` zinciri + `toLocaleLowerCase('tr')` yerine önce Türkçe harf eşlemesi sonra `toLowerCase()` (İ/I tutarlılığı için eşlemeyi lowercase'den önce uygula). İndeks: `let wordIndex = null; function wordSet(){ if(!wordIndex){ wordIndex = new Set(); WORDS_DATA.forEach(w => w && w.en && wordIndex.add(normalize(w.en))); } return wordIndex; }`. `WORDS_DATA` zaten `Buddy` kapsamında erişilebilir (IIFE global).

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: PASS (bu iki test).

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(mentor): metin normalleştirme ve kelime arama indeksi"
```

---

### Task 2: Komut kataloğu + eşleştirici

**Files:**
- Modify: `app.js` — `Buddy` modülü.
- Test: `tests/e2e_test_runner.js`.

**Interfaces:**
- Consumes: Task 1 `normalize`, `resolveWordLookup`.
- Produces:
  - `MENTOR_COMMANDS: Array<{ id, label, keywords: string[], group, type: 'action'|'guide', run?: ()=>void, help?: string }>` — statik katalog; her `run` yalnızca bir `APP` çağrısı. Global Constraints'teki aksiyonları kapsar; "ilerlemeyi sıfırla" gibi geri alınamaz işlemler **yalnızca** `openSettingsModal`'a götürür, doğrudan çalıştırmaz.
  - `getCommands() -> MENTOR_COMMANDS` (test için).
  - `matchCommands(query: string) -> Array<{ id, label, type, score, run?, help? }>` — boş/boşluk/noktalama-only sorgu → `[]`. Aksi halde sorgu token'ları ile her komutun `normalize(label)+keywords` token'ları arasında skor (tam token eşleşmesi > alt-dize eşleşmesi); eşik üstü sonuçlar skora göre azalan, en çok 6 sonuç. `resolveWordLookup(query)` doluysa, sonuç listesinin başına dinamik bir `{ id:'word-'+word, label:'"'+word+'" kelimesini sözlükte aç', type:'action', run:()=>APP.searchDirectory(word) }` öğesi eklenir (yalnızca o token gerçek bir kelimeyse).

- [ ] **Step 1: Write the failing tests**

```javascript
registerTest(1, 'Mentor Concierge', 'test_mentor_catalog_has_core_commands', () => {
  const env = createFreshAppEnvironment();
  const ids = env.APP.buddy.getCommands().map(c => c.id);
  ['daily-quiz','srs-quiz','mistakes-flashcards','open-directory','speech-coach','pdf-studio','open-stats'].forEach(id =>
    assert(ids.includes(id), 'katalog ' + id + ' içermeli'));
  // geri alınamaz işlem doğrudan çalıştırılmaz
  const reset = env.APP.buddy.getCommands().find(c => c.id === 'reset-progress');
  if (reset) assert(/openSettingsModal/.test(reset.run.toString()), 'sıfırlama yalnızca ayarlara götürmeli');
});

registerTest(1, 'Mentor Concierge', 'test_mentor_match_basic_and_turkish', () => {
  const env = createFreshAppEnvironment();
  const m = (q) => env.APP.buddy.matchCommands(q).map(r => r.id);
  assert(m('quiz').includes('daily-quiz') || m('quiz').some(id => /quiz/.test(id)), 'quiz eşleşmeli');
  assert(m('ŞINAV').length > 0, 'büyük harf/Türkçe girdi eşleşmeli');
  assert(m('tekrar').some(id => /srs|tekrar/.test(id)), 'tekrar SRS komutuna eşleşmeli');
});

registerTest(2, 'Mentor Concierge', 'test_mentor_match_empty_and_unmatched', () => {
  const env = createFreshAppEnvironment();
  assertEqual(env.APP.buddy.matchCommands('   ').length, 0, 'boşluk sorgusu boş dönmeli');
  assertEqual(env.APP.buddy.matchCommands('!!!').length, 0, 'noktalama sorgusu boş dönmeli');
  assertEqual(env.APP.buddy.matchCommands('zzzqwxnomatch').length, 0, 'eşleşmeyen sorgu boş dönmeli');
});

registerTest(3, 'Mentor Concierge', 'test_mentor_word_lookup_injected_result', () => {
  const env = createFreshAppEnvironment();
  const realWord = env.sandbox.WORDS_DATA[0].en;
  const res = env.APP.buddy.matchCommands(realWord);
  assert(res.length > 0 && res[0].id.indexOf('word-') === 0, 'gerçek kelime için ilk sonuç sözlük araması olmalı');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: FAIL (`getCommands`/`matchCommands` tanımsız).

- [ ] **Step 3: Implement `MENTOR_COMMANDS`, `getCommands`, `matchCommands`**

Skorlama: sorguyu `normalize` edip boşluktan böl; her komut için token kümesi = `normalize(label)` token'ları ∪ `keywords` (normalize). Skor = (tam eşleşen token sayısı × 2) + (alt-dize eşleşen token sayısı × 1). Skor 0 ise ele. Eşik: en az bir token eşleşmesi. `resolveWordLookup` sonucunu listeye önden ekle. Dönüş nesnesine `getCommands`, `matchCommands` ekle.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(mentor): komut katalogu ve yerel eslestirici"
```

---

### Task 3: İlerlemeye duyarlı öneri üreticisi

**Files:**
- Modify: `app.js` — `Buddy` modülü.
- Test: `tests/e2e_test_runner.js`.

**Interfaces:**
- Consumes: mevcut `getSRSStats(moduleFilter?)`, `getMistakeStats(moduleFilter?)`, `getMEBCalendarInfo()`, `STATE`; Task 2 komut `run` kalıpları.
- Produces:
  - `buildSuggestions() -> Array<{ id, text, actionLabel, run: ()=>void }>` (en çok 4). Öncelik: (1) aktif modülde `getSRSStats().dueCount>0` → tekrar; (2) `getMistakeStats` aktif yanlış>0 → yanlışlarım; (3) günlük çalışma: Maarif ise `mk_buddy_dayDone_maarif_<gün>` bayrağı yoksa "bugünün çalışması", YDS/Oxford ise "kaldığın yerden devam et (gün N)"; (4) 1–3 boşsa diğer modülleri (`'maarif'|'yds'|'oxford'`) `getSRSStats('<modül>')`/`getMistakeStats('<modül>')` ile tara, en acil olana `switchModule`+başlatıcı öneri; o da boşsa olumlu "her şey güncel" + keşif önerisi.
- Dönüş nesnesine `buildSuggestions` eklenir.

- [ ] **Step 1: Write the failing tests**

```javascript
registerTest(3, 'Mentor Concierge', 'test_mentor_suggestions_due_review', () => {
  // aktif modül maarif; birkaç kelimeyi 'review' işaretle → tekrar önerisi çıkmalı
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif' } });
  const pool = env.APP.getActiveGradePool();
  const ids = pool.slice(0, 3).map(w => w.id);
  env.APP.getState().userData.review = new Set(ids);
  const sug = env.APP.buddy.buildSuggestions();
  assert(sug.some(s => /tekrar/i.test(s.text) || /tekrar/i.test(s.actionLabel)), 'tekrar önerisi çıkmalı');
});

registerTest(3, 'Mentor Concierge', 'test_mentor_suggestions_all_clear_positive', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif' } });
  // hiç ilerleme yok; en az bir öneri (keşif/olumlu) dönmeli, çökmemeli
  const sug = env.APP.buddy.buildSuggestions();
  assert(Array.isArray(sug) && sug.length >= 1, 'her durumda en az bir öneri dönmeli');
});

registerTest(3, 'Mentor Concierge', 'test_mentor_suggestions_cross_module_switch', () => {
  // oxford'dayken maarif'te review birikmiş → modül değiştiren öneri çıkmalı
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'oxford' } });
  env.APP.switchModule('maarif');
  const maarifIds = env.APP.getActiveGradePool().slice(0, 4).map(w => w.id);
  env.APP.switchModule('oxford');
  env.APP.getState().userData.review = new Set(maarifIds);
  const sug = env.APP.buddy.buildSuggestions();
  assert(sug.some(s => /geç|maarif/i.test(s.actionLabel + ' ' + s.text)), 'başka modüle yönlendiren öneri çıkmalı');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: FAIL (`buildSuggestions` tanımsız).

- [ ] **Step 3: Implement `buildSuggestions`**

Öncelik sırasını uygula; sayıları ilgili stat fonksiyonundan al; metinleri Türkçe yaz. Cross-module taramada aktif modül hariç diğer ikisini sırayla kontrol et, ilk aksiyon bulunanı öner (`run` = `()=>{ APP.switchModule(mod); APP.startSRSDueQuiz(); }` gibi). Gün tamamlanma kontrolü yalnızca Maarif'te `localStorage`'daki `mk_buddy_dayDone_maarif_<STATE.currentDay>` bayrağına bakar (yeni mantık yok).

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(mentor): ilerlemeye duyarli oneri uretici"
```

---

### Task 4: Concierge paneli (UI) + mevcut mentor'a bağlama

**Files:**
- Modify: `app.js` — `Buddy` modülü (`build`, `open`, dönüş nesnesi).
- Modify: `app.css` — mentor (`.lb-*`) bölümünün yanına concierge stilleri.
- Test: `tests/e2e_test_runner.js`.

**Interfaces:**
- Consumes: Task 2 `matchCommands`, `getCommands`; Task 3 `buildSuggestions`; mevcut `build`, `say`, `hide`, `reduce`.
- Produces:
  - `openConcierge()` — baloncuğun içinde `aria-live` olmayan ayrı kap `#lb-concierge` (`role=dialog`) kurar/gösterir: üstte `buildSuggestions()` çipleri, bir arama `input` (`aria-label`), altında `role=listbox` sonuç listesi. Boş inputta öneriler + en sık komutlar; input değişince `matchCommands` ile listeyi süzer; eşleşme yoksa geri dönüş metni. Öğe seçince `type==='action'` ise `run()` + `hide()`; `type==='guide'` ise `help` metni + "Götür beni" aksiyonu. Klavye: ↑/↓ listede gezer, Enter seçer, Esc kapatır. `reduce()` true ise animasyonsuz.
  - Buddy butonunun tıklama davranışı: eski kısa ipucu yerine `openConcierge()` (ilk karşılama ve `startTour` korunur; `open()` artık concierge'i açar).
- Dönüş nesnesine `openConcierge` eklenir; `open` yeni davranışı gösterir.

- [ ] **Step 1: Write the failing tests**

```javascript
registerTest(1, 'Mentor Concierge', 'test_mentor_panel_opens_non_live', () => {
  const env = createFreshAppEnvironment({ immediateTimers: true });
  env.APP.buddy.openConcierge();
  const panel = env.document.getElementById('lb-concierge');
  assert(panel, 'concierge paneli oluşmalı');
  assertEqual(panel.getAttribute('role'), 'dialog', 'panel role=dialog olmalı');
  assert(panel.getAttribute('aria-live') == null, 'panel canlı bölge olmamalı');
  const input = panel.querySelector('input');
  assert(input, 'arama kutusu olmalı');
});

registerTest(1, 'Mentor Concierge', 'test_mentor_panel_lists_suggestions', () => {
  const env = createFreshAppEnvironment({ immediateTimers: true, initialStorage: { learnish_active_module: 'maarif' } });
  env.APP.buddy.openConcierge();
  const panel = env.document.getElementById('lb-concierge');
  assert(panel.innerHTML.length > 0, 'panel öneri/komut içeriği çizmeli');
});

registerTest(5, 'Mentor Concierge', 'test_mentor_panel_reopen_no_duplicate', () => {
  const env = createFreshAppEnvironment({ immediateTimers: true });
  env.APP.buddy.openConcierge();
  env.APP.buddy.hide();
  env.APP.buddy.openConcierge();
  const all = env.document.querySelectorAll('#lb-concierge');
  assert(all.length <= 1, 'tekrar açılışta çift panel oluşmamalı');
});

registerTest(2, 'Mentor Concierge', 'test_mentor_preserves_tour_and_react', () => {
  const env = createFreshAppEnvironment({ immediateTimers: true });
  assert(typeof env.APP.buddy.startTour === 'function', 'tur korunmalı');
  assert(typeof env.APP.buddy.react === 'function', 'tepkiler korunmalı');
  env.APP.buddy.react('quizPass'); // çökmemeli
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: FAIL (`openConcierge` tanımsız / `#lb-concierge` yok).

- [ ] **Step 3: Implement `openConcierge()` + CSS + butonu bağla**

Panel kabını `build()` içinde (ya da ilk `openConcierge`'te) bir kez oluştur; tekrar açılışta yeniden oluşturma (çift düğüm testi). Listeyi `matchCommands`/`buildSuggestions` verisinden çiz. CSS yalnızca palet token'ları ve mevcut `.lb-*` ölçekleriyle; yeni renk yok. Buddy buton `onclick` → `open()` → `openConcierge()`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/e2e_test_runner.js --filter=mentor`
Expected: PASS (tüm mentor testleri).

- [ ] **Step 5: Commit**

```bash
git add app.js app.css tests/e2e_test_runner.js
git commit -m "feat(mentor): concierge paneli UI ve mevcut mentora baglama"
```

---

### Task 5: Tam paket, bundle ve çevrimdışı doğrulama

**Files:**
- Verify: tüm depo (kod değişikliği beklenmiyor; çıkarsa ilgili önceki task'a geri dönülür).

- [ ] **Step 1: Run the full e2e suite**

Run: `node tests/e2e_test_runner.js`
Expected: Tüm testler PASS (yeni Mentor Concierge testleri dâhil; mevcut testlerde regresyon yok).

- [ ] **Step 2: Rebuild single-file bundle and verify concierge survives**

Run: `python3 build.py`
Then: `node tests/e2e_test_runner.js` (bundle senkron testi dâhil) ve bundle'da `openConcierge` dizesinin varlığını doğrula:
Run: `grep -c "openConcierge" Learnish_Tek_Dosya_Web_App.html`
Expected: `>= 1`.

- [ ] **Step 3: Offline sanity note**

`service-worker.js` ve `ASSETS_TO_CACHE` değişmediğini doğrula (yeni dosya eklenmedi):
Run: `git status --short service-worker.js`
Expected: çıktı boş (değişmemiş).

- [ ] **Step 4: Commit any build artifacts**

```bash
git add -A
git commit -m "build: mentor concierge sonrasi tek-dosya surumu guncelle"
```
