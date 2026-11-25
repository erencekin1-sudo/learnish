# Renkli Defterler Modülü — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Öğrencinin aktif modülünde açılmış kelimeleri zorluk kademesine (🔴/🟡/🟢) göre çalıştığı, ustalaştıkça Seviye Geçme Testi ile tek adım terfi ettiren yeni bir "Renkli Defterler" modülü eklemek.

**Architecture:** Mevcut `app.js` tek-IIFE yapısına ince bir katman. Renk + ilerleme durumu `STATE.userData.notebooks` map'inde saklanır (mevcut `srs`/`mistakes` deseniyle birebir). Başlangıç rengi mevcut SRS durumundan tohumlanır, sonra yalnızca test terfisiyle değişir. Günlük çalışma mevcut flash kart motorunu, Seviye Geçme Testi mevcut quiz motorunu yeniden kullanır. Yeni bir `view-notebooks` görünümü eklenir.

**Tech Stack:** Vanilla JS (tek IIFE `app.js`), `app.css`, `index.html`, Node vm tabanlı e2e (`tests/e2e_test_runner.js`), `build.py` bundler.

**Spec:** `docs/superpowers/specs/2026-11-25-renkli-defterler-design.md`

## Global Constraints

- Kelime havuzu/korpus **asla** değiştirilmez: `words-data.js` dokunulmaz, toplam **11000** kelime sabit kalır.
- Çevrimdışı, çalışma anında yapay zekâ/halüsinasyon yok.
- İkinci SRS motoru yazılmaz: mevcut `calculateSRS` (SM-2) ve quiz motoru yeniden kullanılır.
- Renk **saklanan** değerdir; kayıt anında bir kez tohumlanır, sonra **yalnızca Seviye Geçme Testi** ile değişir.
- Terfi **tek adım**: `red → yellow → green`. 🟢 yeşil rotasyonda kalır (terminal renk, terfi etmez).
- Terfiye uygunluk: `color !== 'green' && good >= 5`.
- Seviye Geçme Testi eşiği: terfiye uygun kelimeler **toplamı** ≥ **20** (renk başına değil).
- `good` sayacı: kayıtlı kelimenin herhangi bir SRS başarısında (quality ≥ 4) artar; **günde kelime başına en fazla +1**; Seviye Geçme Testi'nin kendi cevapları **saymaz**.
- Yalnızca `claude/modest-cerf-cahp9u` dalında geliştirme.
- Her görev sonunda e2e paketi (`node tests/e2e_test_runner.js`) **yeşil** kalmalı. Son görevde `python3 build.py --check` **senkron** olmalı (ETL değil, yalnızca `--bundle`/`--check`).
- Commit mesajı sonu:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT`.

## Review Focus

- **Zaten ustalaşılmış kelime** ilk kayıtta 🟢 tohumlanır ve terfiye uygun **olmaz** (sahte tırmanış yok) — Task 1 + Task 2 testleri.
- **Açılmış havuz günlük adetten küçükken** (ör. 1. gün) günlük küme hata vermeden eldeki kadarını döndürür — Task 3 testi.
- **Terfi sonrası** `good=0` olduğundan kelime anında yeniden uygun olmaz (uygunluk çalkantısı yok) — Task 4 testi.
- **`good` günlük kapağı** birden çok yüzeyde (aynı gün hem flash kart hem normal quiz) toplam **+1** ile sınırlı — Task 2 testi.
- **Kalıcılık**: `notebooks` map'i düz nesne olarak round-trip olur; eski kayıtta anahtar yoksa `{}` olarak yüklenir, çökmez — Task 1 testi.

---

### Task 1: Notebook veri çekirdeği — renk tohumlama, kayıt, kalıcılık

**Files:**
- Modify: `app.js` — yeni "RENKLİ DEFTERLER" bölümü (öneri: `calculateSRS`'ten hemen sonra, ~line 2112 civarı); `STATE.userData` init (~line 501-516); `saveUserData` (~line 1748); `exportProgress` payload (~line 1772-1780); `handleImportFile` (~line 1821); `resetProgress` keysToRemove (~line 1850); `resetAllProgress` (~line 8217-8229); `window.APP` export (~line 8907).
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `STATE.userData`, `STATE.userData.srs` (SM-2 kayıtları: `{ state, interval, ... }`), `WORDS_DATA`, `mkLocalDateKey()`, `getTodayDateString()`, `lsJSON(key, fallback)`.
- Produces:
  - `STATE.userData.notebooks` : `{ [wordId:number]: { color:'red'|'yellow'|'green', good:number, lastGoodDate:string|null, enrolledAt:string, promotedAt:string|null } }`
  - `seedNotebookColor(wordId:number) -> 'red'|'yellow'|'green'` (yan etkisiz)
  - `enrollNotebookWord(wordId:number) -> record` (idempotent; yoksa oluşturur, varsa mevcut kaydı döndürür)
  - `getNotebookRecord(wordId:number) -> record|null`

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_seed_color_new_word_is_red', () => {
  const env = createFreshAppEnvironment();
  const w = env.sandbox.WORDS_DATA.find(x => x.cefr && x.cefr !== 'A1' && x.cefr !== 'A2');
  assertEqual(env.APP.seedNotebookColor(w.id), 'red', 'SRS geçmişi olmayan (A1/A2 olmayan) kelime kırmızı tohumlanmalı');
});

registerTest(1, 'Renkli Defterler', 'test_seed_color_a1_nohistory_is_yellow', () => {
  const env = createFreshAppEnvironment();
  const w = env.sandbox.WORDS_DATA.find(x => x.cefr === 'A1');
  assertEqual(env.APP.seedNotebookColor(w.id), 'yellow', 'geçmişi olmayan A1 kelime sarı tohumlanmalı (hafif CEFR ipucu)');
});

registerTest(1, 'Renkli Defterler', 'test_seed_color_mastered_is_green', () => {
  const w0 = 999001;
  const env = createFreshAppEnvironment({ initialStorage: {
    mk_srs: JSON.stringify({ [w0]: { state: 'mastered', interval: 30, repetitions: 5, easeFactor: 2.6, streak: 5 } })
  }});
  // WORDS_DATA içinde var olan bir id ile sınanmalı: ilk kelimeyi mastered yap
  const realId = env.sandbox.WORDS_DATA[0].id;
  env.APP.getState().userData.srs[realId] = { state: 'mastered', interval: 30, repetitions: 5, easeFactor: 2.6, streak: 5 };
  assertEqual(env.APP.seedNotebookColor(realId), 'green', 'ustalaşılmış SRS durumu yeşil tohumlanmalı');
});

registerTest(1, 'Renkli Defterler', 'test_enroll_is_idempotent', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[0].id;
  const r1 = env.APP.enrollNotebookWord(id);
  r1.good = 3;
  const r2 = env.APP.enrollNotebookWord(id);
  assertEqual(r2.good, 3, 'tekrar kayıt mevcut kaydı korumalı (üzerine yazmamalı)');
  assert(['red','yellow','green'].includes(r2.color), 'renk geçerli olmalı');
});

registerTest(1, 'Renkli Defterler', 'test_notebooks_persist_roundtrip', () => {
  const id = 12345;
  const env = createFreshAppEnvironment({ initialStorage: {
    mk_notebooks: JSON.stringify({ [id]: { color:'yellow', good:2, lastGoodDate:null, enrolledAt:'2026-01-01', promotedAt:null } })
  }});
  assertEqual(env.APP.getNotebookRecord(id).color, 'yellow', 'kayıtlı notebooks map yüklenmeli');
  assertEqual(env.APP.getNotebookRecord(id).good, 2, 'good değeri round-trip olmalı');
});

registerTest(1, 'Renkli Defterler', 'test_notebooks_absent_key_defaults_empty', () => {
  const env = createFreshAppEnvironment(); // mk_notebooks yok
  assertEqual(env.APP.getNotebookRecord(777777), null, 'kayıt yoksa null dönmeli, çökmemeli');
  assert(typeof env.APP.getState().userData.notebooks === 'object', 'notebooks daima nesne olmalı');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node tests/e2e_test_runner.js 2>&1 | grep -i "renkli\|FAIL"`
Expected: Yeni testler `seedNotebookColor is not a function` benzeri hatalarla FAIL.

- [ ] **Step 3: Implement the data core in `app.js`**

- `STATE.userData` init'e ekle: `notebooks: lsJSON('mk_notebooks', {})`.
- `saveUserData`'ya ekle: `localStorage.setItem('mk_notebooks', JSON.stringify(STATE.userData.notebooks || {}));`
- `exportProgress` payload.userData'ya `notebooks: STATE.userData.notebooks` ekle; `handleImportFile`'a `STATE.userData.notebooks = ud.notebooks && typeof ud.notebooks === 'object' ? ud.notebooks : {};` ekle.
- `resetProgress` keysToRemove listesine `'mk_notebooks'` ekle; `resetAllProgress`'e `STATE.userData.notebooks = {};` ekle.
- `seedNotebookColor(wordId)`: SRS kaydına bak — yoksa veya `state==='new'/'learning'` → `red`; `state==='reviewing'` → `yellow`; `state==='mastered'` (veya `interval>=14`) → `green`. SRS kaydı **yoksa** kelimenin CEFR'i `A1`/`A2` ise `red` yerine `yellow` döndür.
- `enrollNotebookWord(wordId)`: `notebooks[id]` yoksa `{ color: seedNotebookColor(id), good:0, lastGoodDate:null, enrolledAt:getTodayDateString(), promotedAt:null }` oluşturup `saveUserData()`; her hâlde kaydı döndür.
- `getNotebookRecord(wordId)`: `STATE.userData.notebooks[wordId] || null`.
- `window.APP`'e ekle: `seedNotebookColor, enrollNotebookWord, getNotebookRecord`.

- [ ] **Step 4: Run to verify pass**

Run: `node tests/e2e_test_runner.js 2>&1 | tail -5`
Expected: Tüm testler PASS (yeni 6 dahil).

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(notebooks): renk tohumlama, kayıt ve kalıcılık çekirdeği

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT"
```

---

### Task 2: `good` sayacı kancası (günlük kapak + test dışlaması) ve uygunluk

**Files:**
- Modify: `app.js` — `calculateSRS` (~line 2044-2112) içine kanca; yeni `isNotebookEligible` / `getNotebookEligibleWords`; `window.APP` export.
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `calculateSRS(wordId, quality)`, `STATE.userData.notebooks`, `STATE.quizState` (`{ active, source }`), `mkLocalDateKey()`, `WORDS_DATA`, `getNotebookRecord`.
- Produces:
  - `isNotebookEligible(wordId:number) -> boolean` (`rec && rec.color!=='green' && rec.good>=5`)
  - `getNotebookEligibleWords() -> word[]` (kayıtlı + uygun kelimelerin WORDS_DATA nesneleri)
  - `calculateSRS` `window.APP`'e açılır (test erişimi için; davranış değişmez).
  - Yan etki: kayıtlı kelimeye `calculateSRS(id, >=4)` çağrıldığında `good += 1` (günde +1 kapaklı; `source==='notebook_levelup'` iken artmaz).

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_good_increments_on_success', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[0].id;
  env.APP.enrollNotebookWord(id);
  env.APP.calculateSRS(id, 4);
  assertEqual(env.APP.getNotebookRecord(id).good, 1, 'kayıtlı kelimede quality>=4 good sayacını +1 yapmalı');
});

registerTest(1, 'Renkli Defterler', 'test_good_daily_cap_once', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[1].id;
  env.APP.enrollNotebookWord(id);
  env.APP.calculateSRS(id, 4);
  env.APP.calculateSRS(id, 5); // aynı gün ikinci başarı
  assertEqual(env.APP.getNotebookRecord(id).good, 1, 'good aynı gün en fazla +1 artmalı');
});

registerTest(1, 'Renkli Defterler', 'test_good_not_incremented_for_unenrolled', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[2].id;
  env.APP.calculateSRS(id, 4); // kayıtlı değil
  assertEqual(env.APP.getNotebookRecord(id), null, 'kayıtsız kelime için notebook kaydı oluşmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_good_excluded_during_levelup_test', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[3].id;
  env.APP.enrollNotebookWord(id);
  env.APP.getState().quizState.active = true;
  env.APP.getState().quizState.source = 'notebook_levelup';
  env.APP.calculateSRS(id, 4);
  assertEqual(env.APP.getNotebookRecord(id).good, 0, 'Seviye Geçme Testi sırasındaki başarı good artırmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_eligibility_threshold_and_green', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[4].id;
  const rec = env.APP.enrollNotebookWord(id);
  rec.color = 'red'; rec.good = 4;
  assertEqual(env.APP.isNotebookEligible(id), false, 'good=4 uygun olmamalı');
  rec.good = 5;
  assertEqual(env.APP.isNotebookEligible(id), true, 'good=5 uygun olmalı');
  rec.color = 'green';
  assertEqual(env.APP.isNotebookEligible(id), false, 'yeşil kelime asla uygun olmamalı');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node tests/e2e_test_runner.js 2>&1 | grep -i "renkli\|FAIL"`
Expected: `isNotebookEligible is not a function` ve good ile ilgili FAIL'ler.

- [ ] **Step 3: Implement the hook + eligibility**

`calculateSRS` sonunda (kayıt `STATE.userData.srs[wordId]`'e yazıldıktan ve `saveUserData()` çağrılmadan hemen önce), şu bloğu ekle:

```js
const _nb = STATE.userData.notebooks && STATE.userData.notebooks[wordId];
const _inLevelUp = STATE.quizState && STATE.quizState.active && STATE.quizState.source === 'notebook_levelup';
if (_nb && quality >= 4 && !_inLevelUp) {
  const _today = mkLocalDateKey();
  if (_nb.lastGoodDate !== _today) { _nb.good = (_nb.good || 0) + 1; _nb.lastGoodDate = _today; }
}
```

- `isNotebookEligible(wordId)`: `const r = getNotebookRecord(wordId); return !!(r && r.color !== 'green' && (r.good || 0) >= 5);`
- `getNotebookEligibleWords()`: `Object.keys(STATE.userData.notebooks).map(Number).filter(isNotebookEligible).map(id => WORDS_DATA.find(w => w.id === id)).filter(Boolean)`
- `window.APP`'e ekle: `isNotebookEligible, getNotebookEligibleWords, calculateSRS` (sonuncusu yalnızca test erişimi; davranışı değişmez).

- [ ] **Step 4: Run to verify pass**

Run: `node tests/e2e_test_runner.js 2>&1 | tail -5`
Expected: Tüm testler PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(notebooks): good sayacı kancası (günlük kapak, test dışlaması) ve uygunluk

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT"
```

---

### Task 3: Açılmış havuz kaynağı, günlük küme ve flash kart entegrasyonu

**Files:**
- Modify: `app.js` — yeni kaynak yardımcıları; `renderFlashcardView` (~line 5070+) içine `'notebook'` kaynağı; yeni `startNotebookFlashcards`; `STATE.userData.notebookDailyCount` kalıcılığı (Task 1'in save/init/reset listelerine eklenir); `window.APP` export.
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `WORDS_DATA`, `isYDSWord`, `isOxfordWord`, `getActiveGradePool`, `STATE.activeModule`, `STATE.currentDay`, `getSRSDueWords`, `enrollNotebookWord`, `getNotebookRecord`, `switchView`.
- Produces:
  - `_activeModuleTargetAndBatch() -> { targetPool: word[], batchSize: number }` (renderDailyView'daki modül→havuz/batch mantığının tek yardımcıya çıkarılmışı: maarif→gradePool/10, yds→YDS/20, oxford→Oxford/25, all→WORDS_DATA/25)
  - `getUnlockedModuleWords() -> word[]` (`targetPool.slice(0, min(currentDay*batchSize, targetPool.length))`)
  - `getNotebookDailyCount() -> number` (kayıtlı `STATE.userData.notebookDailyCount`, yoksa varsayılan: maarif 10, yds 20, oxford/all 25)
  - `setNotebookDailyCount(n:number) -> void` (1..50 kıskaçlı, kalıcı)
  - `buildNotebookDailySet() -> word[]` (açılmış kelimelerden: önce SRS'e göre bugün tekrarı gelen **kayıtlı** kelimeler, sonra henüz kayıtlı olmayanlar — her birini `enrollNotebookWord` ile kaydederek — `getNotebookDailyCount()` dolana dek)
  - `startNotebookFlashcards() -> void`

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_unlocked_words_is_cumulative_slice', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '3', mk_current_day_date: '2000-01-01' }});
  // YDS: batch 20, gün 3 -> 60 kelime (havuz yeterliyse)
  const unlocked = env.APP.getUnlockedModuleWords();
  assertEqual(unlocked.length, 60, '3. günde açılmış YDS kelime sayısı 3*20=60 olmalı');
});

registerTest(1, 'Renkli Defterler', 'test_daily_set_respects_count_and_pool', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif', learnish_selected_grade: '5' }});
  env.APP.setNotebookDailyCount(8);
  const set = env.APP.buildNotebookDailySet();
  assert(set.length <= 8, 'günlük küme ayarlanan adedi aşmamalı');
  assert(set.length >= 1, 'açılmış havuzdan en az bir kelime gelmeli');
});

registerTest(1, 'Renkli Defterler', 'test_daily_set_handles_small_pool_day1', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif', learnish_selected_grade: '5', mk_current_day: '1', mk_current_day_date: '2000-01-01' }});
  env.APP.setNotebookDailyCount(50); // havuzdaki açılmış kelimeden fazla
  const set = env.APP.buildNotebookDailySet();
  assert(Array.isArray(set) && set.length <= 10, '1. günde açılmış ~10 kelimeyi aşmadan, hatasız dönmeli');
});

registerTest(1, 'Renkli Defterler', 'test_studying_enrolls_words', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif', learnish_selected_grade: '5' }});
  const set = env.APP.buildNotebookDailySet();
  assert(set.length > 0, 'küme boş olmamalı');
  assert(env.APP.getNotebookRecord(set[0].id) !== null, 'günlük kümeye giren kelime otomatik kaydedilmeli');
  assert(['red','yellow','green'].includes(env.APP.getNotebookRecord(set[0].id).color), 'kayıtta geçerli tohum rengi olmalı');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node tests/e2e_test_runner.js 2>&1 | grep -i "renkli\|FAIL"`
Expected: `getUnlockedModuleWords is not a function` vb. FAIL.

- [ ] **Step 3: Implement source + daily set + flashcard source**

- `_activeModuleTargetAndBatch()`: `renderDailyView`'daki (~line 4733-4758) modül→{targetPool,batchSize} seçim mantığını aynen döndüren yardımcı. (renderDailyView bu yardımcıyı kullanacak şekilde sadeleştirilebilir ama zorunlu değil — DRY için tercih edilir.)
- `getUnlockedModuleWords()`: yukarıdaki imza.
- `getNotebookDailyCount` / `setNotebookDailyCount`: `STATE.userData.notebookDailyCount`; Task 1'in `lsJSON('mk_notebook_daily', null)` init'i, `saveUserData` (`mk_notebook_daily`), export/import ve reset listelerine eklenir.
- `buildNotebookDailySet()`: imzadaki sıraya göre; kayıtsızları `enrollNotebookWord` ile kaydet; `getNotebookDailyCount()` kadar döndür.
- `renderFlashcardView`'da `sourceVal === 'notebook'` dalı ekle: `pool = buildNotebookDailySet();`
- `startNotebookFlashcards()`: `STATE.flashcardSource='notebook'; STATE.activeFlashcardIndex=0; STATE.flashcardFlipped=false; STATE.flashcardIsShuffled=false; switchView('flashcard');`
- `window.APP`'e ekle: `getUnlockedModuleWords, getNotebookDailyCount, setNotebookDailyCount, buildNotebookDailySet, startNotebookFlashcards`.

- [ ] **Step 4: Run to verify pass**

Run: `node tests/e2e_test_runner.js 2>&1 | tail -5`
Expected: Tüm testler PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(notebooks): açılmış havuz kaynağı, günlük küme ve flash kart entegrasyonu

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT"
```

---

### Task 4: Seviye Geçme Testi — tetik (20), özel quiz ve tek-adım terfi

**Files:**
- Modify: `app.js` — yeni `shouldOfferLevelUpTest`, `startNotebookLevelUpTest`, `promoteNotebookWord`; `handleQuizAnswer` (~line 7665 doğru-cevap dalı) içine terfi kancası; `window.APP` export.
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `getNotebookEligibleWords`, `getNotebookRecord`, `pickDistractors`, `shuffleArray`, `STATE.quizState`, `saveQuizState`, `switchView`, `getTodayDateString`, `handleQuizAnswer`.
- Produces:
  - `shouldOfferLevelUpTest() -> boolean` (`getNotebookEligibleWords().length >= 20`)
  - `startNotebookLevelUpTest() -> void` (uygun kelimelerden `startDedicatedQuiz` deseniyle quiz kurar; `quizState.source = 'notebook_levelup'`)
  - `promoteNotebookWord(wordId:number) -> record|null` (red→yellow, yellow→green, green→green; `good=0`, `promotedAt=getTodayDateString()`; `saveUserData`)
  - Yan etki: `handleQuizAnswer` doğru cevapta, `source==='notebook_levelup'` ise `promoteNotebookWord(targetWord.id)`.

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_promote_one_step', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[0].id;
  const r = env.APP.enrollNotebookWord(id); r.color = 'red'; r.good = 7;
  env.APP.promoteNotebookWord(id);
  assertEqual(env.APP.getNotebookRecord(id).color, 'yellow', 'kırmızı tek adım sarıya terfi etmeli');
  assertEqual(env.APP.getNotebookRecord(id).good, 0, 'terfi good sıfırlamalı');
  env.APP.getNotebookRecord(id).good = 6;
  env.APP.promoteNotebookWord(id);
  assertEqual(env.APP.getNotebookRecord(id).color, 'green', 'sarı tek adım yeşile terfi etmeli');
  env.APP.promoteNotebookWord(id);
  assertEqual(env.APP.getNotebookRecord(id).color, 'green', 'yeşil daha fazla terfi etmemeli');
});

registerTest(1, 'Renkli Defterler', 'test_promote_resets_eligibility_churn', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[1].id;
  const r = env.APP.enrollNotebookWord(id); r.color = 'red'; r.good = 9;
  env.APP.promoteNotebookWord(id);
  assertEqual(env.APP.isNotebookEligible(id), false, 'terfi sonrası good=0 olduğundan anında yeniden uygun olmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_levelup_offer_threshold_20', () => {
  const env = createFreshAppEnvironment();
  const ids = env.sandbox.WORDS_DATA.slice(0, 25).map(w => w.id);
  ids.forEach((id, i) => { const r = env.APP.enrollNotebookWord(id); r.color='red'; r.good = i < 19 ? 5 : 0; });
  assertEqual(env.APP.shouldOfferLevelUpTest(), false, '19 uygun kelimede test önerilmemeli');
  env.APP.getNotebookRecord(ids[19]).good = 5; // 20. uygun
  assertEqual(env.APP.shouldOfferLevelUpTest(), true, '20 uygun kelimede test önerilmeli');
});

registerTest(1, 'Renkli Defterler', 'test_levelup_test_uses_eligible_only_and_tags_source', () => {
  const env = createFreshAppEnvironment();
  const ids = env.sandbox.WORDS_DATA.slice(0, 22).map(w => w.id);
  ids.forEach(id => { const r = env.APP.enrollNotebookWord(id); r.color='red'; r.good = 5; });
  env.APP.startNotebookLevelUpTest();
  const qs = env.APP.getState().quizState;
  assertEqual(qs.source, 'notebook_levelup', 'quiz kaynağı notebook_levelup olmalı');
  assert(qs.active && qs.questions.length > 0, 'test soruları kurulmalı');
  const eligibleIds = new Set(env.APP.getNotebookEligibleWords().map(w => w.id));
  assert(qs.questions.every(q => eligibleIds.has(q.targetWord.id)), 'tüm sorular yalnızca uygun kelimelerden olmalı');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node tests/e2e_test_runner.js 2>&1 | grep -i "renkli\|FAIL"`
Expected: `promoteNotebookWord is not a function` vb. FAIL.

- [ ] **Step 3: Implement trigger + test + promotion**

- `promoteNotebookWord(wordId)`: `const r = getNotebookRecord(wordId); if (!r) return null; r.color = r.color==='red'?'yellow':(r.color==='yellow'?'green':'green'); r.good = 0; r.lastGoodDate = null; r.promotedAt = getTodayDateString(); saveUserData(); return r;`
- `shouldOfferLevelUpTest()`: imzadaki gibi.
- `startNotebookLevelUpTest()`: `getNotebookEligibleWords()` havuzundan `startDedicatedQuiz` (~line 8154) desenini izleyerek soru üret; `STATE.quizState = { active:true, questions, currentIndex:0, score:0, streak:0, mode:'en-tr', source:'notebook_levelup', answered:false, waitingFeedback:false }`; `saveQuizState(); switchView('quiz');`
- `handleQuizAnswer` doğru-cevap dalında (`selectedOpt.isCorrect` içinde, mevcut `calculateSRS(...,4)` çağrısından sonra): `if (STATE.quizState.source === 'notebook_levelup') promoteNotebookWord(currentQ.targetWord.id);`
- `window.APP`'e ekle: `shouldOfferLevelUpTest, startNotebookLevelUpTest, promoteNotebookWord`.

- [ ] **Step 4: Run to verify pass**

Run: `node tests/e2e_test_runner.js 2>&1 | tail -5`
Expected: Tüm testler PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js tests/e2e_test_runner.js
git commit -m "feat(notebooks): Seviye Geçme Testi tetiği, özel quiz ve tek-adım terfi

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT"
```

---

### Task 5: Renkli Defterler görünümü (UI), navigasyon ve stil

**Files:**
- Modify: `index.html` — `view-notebooks` section (~line 148'den sonra); desktop nav (~line 109'dan sonra) ve floating nav için `data-view="notebooks"` düğmeleri.
- Modify: `app.js` — `executeSwitchView` (~line 7392): `viewLabels`/`titleEl` girişleri + `if (viewName === 'notebooks') renderNotebooksView();` + `currentView` enum yorumu; yeni `renderNotebooksView()`; `window.APP` export.
- Modify: `app.css` — defter/kart stilleri (palet token'larıyla).
- Test: `tests/e2e_test_runner.js`

**Interfaces:**
- Consumes: `STATE.userData.notebooks`, `getNotebookRecord`, `getNotebookEligibleWords`, `shouldOfferLevelUpTest`, `getNotebookDailyCount`, `buildNotebookDailySet`, `startNotebookFlashcards`, `startNotebookLevelUpTest`, `switchView`, `renderIcon`, `escapeHtml`, `displayExample`.
- Produces:
  - `renderNotebooksView() -> void` (`#view-notebooks` içeriğini doldurur: üç renk kovası sayıları, günlük adet ayarı, "Bugünü Çalış" düğmesi, uygun≥20 iken Seviye Geçme Testi CTA'sı, renk başına kütüphane-stili kart listesi)

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_notebooks_view_section_and_nav_exist', () => {
  const env = createFreshAppEnvironment();
  assert(env.document.getElementById('view-notebooks'), 'view-notebooks section index.html içinde olmalı');
  assert(env.document.querySelector('[data-view="notebooks"]'), 'notebooks nav düğmesi olmalı');
});

registerTest(1, 'Renkli Defterler', 'test_switch_to_notebooks_activates_section', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif', learnish_selected_grade: '5' }});
  env.APP.switchView('notebooks');
  assertEqual(env.APP.getState().currentView, 'notebooks', 'currentView notebooks olmalı');
  assert(env.document.getElementById('view-notebooks').classList.contains('active'), 'section aktifleşmeli');
});

registerTest(1, 'Renkli Defterler', 'test_notebooks_view_renders_three_buckets', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif', learnish_selected_grade: '5' }});
  const a = env.sandbox.WORDS_DATA[0].id, b = env.sandbox.WORDS_DATA[1].id, c = env.sandbox.WORDS_DATA[2].id;
  env.APP.enrollNotebookWord(a); env.APP.getNotebookRecord(a).color = 'red';
  env.APP.enrollNotebookWord(b); env.APP.getNotebookRecord(b).color = 'yellow';
  env.APP.enrollNotebookWord(c); env.APP.getNotebookRecord(c).color = 'green';
  env.APP.switchView('notebooks');
  const html = env.document.getElementById('view-notebooks').innerHTML;
  assert(/data-notebook-color="red"/.test(html) && /data-notebook-color="yellow"/.test(html) && /data-notebook-color="green"/.test(html), 'üç renk kovası da işaretli DOM üretmeli');
});

registerTest(1, 'Renkli Defterler', 'test_notebooks_view_shows_levelup_cta_at_threshold', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'maarif', learnish_selected_grade: '5' }});
  env.sandbox.WORDS_DATA.slice(0, 20).forEach(w => { const r = env.APP.enrollNotebookWord(w.id); r.color='red'; r.good=5; });
  env.APP.switchView('notebooks');
  const html = env.document.getElementById('view-notebooks').innerHTML;
  assert(/startNotebookLevelUpTest/.test(html), 'uygun≥20 iken Seviye Geçme Testi CTA görünmeli');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node tests/e2e_test_runner.js 2>&1 | grep -i "renkli\|FAIL"`
Expected: section/nav yok; `renderNotebooksView` tanımsız → FAIL.

- [ ] **Step 3: Implement view + nav + routing + CSS**

- `index.html`: `<section id="view-notebooks" class="view-section" aria-labelledby="tab-notebooks"></section>`; desktop + floating nav'a `data-view="notebooks"` düğmeleri (mevcut nav-btn desenini izle, uygun bir ikon).
- `executeSwitchView`: `viewLabels`'e `notebooks: 'RENKLİ DEFTERLER • KADEME'`; `titleEl` için bir satır; `if (viewName === 'notebooks') renderNotebooksView();`; `STATE.currentView` yorumuna `'notebooks'` ekle.
- `renderNotebooksView()`: `#view-notebooks`'i doldur — her renk için `data-notebook-color="red|yellow|green"` taşıyan kova başlığı + sayaç; günlük adet ayarı (`setNotebookDailyCount`); "Bugünü Çalış" → `startNotebookFlashcards()`; `shouldOfferLevelUpTest()` ise `onclick="window.APP.startNotebookLevelUpTest()"` içeren CTA; her kovada kelime kartları (kütüphane kart desenini `displayExample` ile ödünç al). DESIGN.md paleti/token'ları kullan; sabit renk kodu gömme — tema token'ları.
- `app.css`: `.notebook-*` sınıfları; kırmızı/sarı/yeşil tonlar için token tabanlı değişkenler; dokunma hedefleri ≥44px; açık/koyu tema uyumu.
- `window.APP`'e ekle: `renderNotebooksView`.

- [ ] **Step 4: Run to verify pass**

Run: `node tests/e2e_test_runner.js 2>&1 | tail -5`
Expected: Tüm testler PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js app.css index.html tests/e2e_test_runner.js
git commit -m "feat(notebooks): Renkli Defterler görünümü, navigasyon ve stil

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT"
```

---

### Task 6: Tek-dosya bundle senkronu ve tam doğrulama

**Files:**
- Modify: `Learnish_Tek_Dosya_Web_App.html` (yalnızca `build.py --bundle` üretir; elle düzenlenmez).

**Interfaces:** Yok (yalnızca derleme + doğrulama).

- [ ] **Step 1: Regenerate bundle (non-destructive)**

Run: `python3 build.py --bundle`
Expected: Bundle yeniden üretildi; `words-data.js`'e dokunulmadı.

- [ ] **Step 2: Verify bundle in sync**

Run: `python3 build.py --check`
Expected: Exit 0 — "%100 senkron".

- [ ] **Step 3: Full e2e suite**

Run: `node tests/e2e_test_runner.js 2>&1 | tail -8`
Expected: Tüm testler PASS (yeni Renkli Defterler testleri dahil), 0 FAIL.

- [ ] **Step 4: Corpus bütünlüğü (11000 sabit)**

Run: `python3 -c "import json,re; r=open('words-data.js',encoding='utf-8').read(); i=r.index('['); d,_=json.JSONDecoder().raw_decode(r[i:]); print('WORDS', len(d))"`
Expected: `WORDS 11000`. (`git diff --stat words-data.js` ayrıca boş olmalı — veri dosyasına hiç dokunulmadı.)

- [ ] **Step 5: Commit**

```bash
git add Learnish_Tek_Dosya_Web_App.html
git commit -m "build(notebooks): tek-dosya bundle senkronu

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT"
```

---

## Notlar (uygulayıcı için)

- `app.js` tek dev IIFE'dir; yeni kod ayrı dosyaya **çıkarılmaz**, mevcut desenle aynı dosyada açıkça sınırlanmış bir bölümde yaşar.
- Her yeni fonksiyon `window.APP`'e eklenmeli ki e2e testleri erişebilsin (`getState: () => STATE` zaten açık).
- `build.py` yalnızca `--bundle`/`--check` ile çalıştırılır; **argümansız `python3 build.py` (yıkıcı ETL) çalıştırılmaz**.
