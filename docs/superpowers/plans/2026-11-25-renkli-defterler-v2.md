# Renkli Defterler v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renkli Defterler'i öğrenci yönlü renk (üç renkli buton), sabit 1/3/5 gün takvim, 5× kolay → mezuniyet adayı → 20 aday → Seviye Geçme Testi → doğru bilinenler Arşiv modeline taşımak; sonsuz döngüyü bitirmek.

**Architecture:** Mevcut `app.js` Renkli Defterler katmanı yerinde genişletilir. Renk artık öğrencinin bastığı renkli butondan gelir (SRS'ten tohumlama ve testle-tek-adım terfi kaldırılır). Günlük küme sabit takvimle (`nextReview`) kurulur, günlük tavanla sınırlanır ve bitince tamamlanma ekranı gösterir. Seviye Geçme Testi mevcut quiz motorunu kullanır; test bitince doğru bilinenler arşivlenir. Defter çalışması küresel SRS'e dokunmaz (PR #6 izolasyonu korunur).

**Tech Stack:** Vanilla JS (tek IIFE `app.js`), `app.css`, `index.html`, Node vm e2e (`tests/e2e_test_runner.js`), `build.py`.

**Spec:** `docs/superpowers/specs/2026-11-25-renkli-defterler-v2-design.md`

## Global Constraints
- Korpus `words-data.js` dokunulmaz; toplam **11000** sabit.
- Çevrimdışı, çalışma anında yapay zekâ yok.
- Defter puanlaması/testi **küresel SRS/learned/review/Hata Defterine yazmaz** (izolasyon korunur).
- İkinci tam SRS motoru yok: yalnızca sabit **1/3/5 gün** (🔴/🟡/🟢).
- Kapsam **modül bazında**: kovalar/günlük/test aktif modüle (maarifte sınıfa) göre; **Arşiv küresel**, kayıttaki `srcModule`/`srcGrade` etiketiyle.
- Kalıcılık `STATE.userData.notebooks` + yeni `STATE.userData.notebookDay`; yeni kayıt alanları düz nesne olarak taşınır.
- Yalnızca `claude/modest-cerf-cahp9u` dalında; e2e yeşil; `build.py --check` senkron.
- Commit sonu: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT`.

## Review Focus
- **Aynı gün yeniden puanlama:** puanlanan kelime o gün kümeye dönmemeli; `kolayStreak` iki kez artmamalı — Task 1 + Task 3 testleri.
- **Günlük tavan tekrar-basma:** "Bugünü Çalış"a tekrar basmak günlük adedi aşmamalı (yeni günde sıfırlanmalı) — Task 3 testi.
- **Arşiv yarıda bırakma:** test yarıda bırakılırsa hiçbir kelime arşivlenmemeli; yalnızca tamamlanınca doğru bilinenler — Task 2 testi.
- **Modül/sınıf sızıntısı:** bir modülde kayıtlı kelime başka modülün kovasında/adayında/testinde görünmemeli — Task 2 + Task 5 testleri.
- **v1 verisi:** eski kayıtlar (renk tohumlu, `good` sayaçlı, `srcModule` yok) çökmeden yüklenmeli; renk korunmalı, eksik alanlar varsayılanlanmalı — Task 1 testi.

**Not (test göçü):** v1 Renkli Defterler testlerinden `good`/`seedNotebookColor`/`isNotebookEligible`/`promoteNotebookWord`/`markNotebookCard`/`rateFlashcard`(notebook) üzerine olanlar v2'de geçersiz; ilgili task bunları siler ve aşağıdaki v2 testleriyle değiştirir. İzolasyon testlerinden hâlâ geçerli olanlar (küresel SRS'e yazmama) korunur/uyarlanır.

---

### Task 1: Renk-butonu çekirdeği — renk + sabit takvim + mezuniyet adayı

**Files:**
- Modify: `app.js` — `enrollNotebookWord` (~2159, alan şeması); yeni `notebookInterval`, `rateNotebookColor`; `calculateSRS` içindeki notebook `good` kancasını kaldır (~2119-2129); `seedNotebookColor`/`isNotebookEligible`/`getNotebookEligibleWords`/`markNotebookCard` kullanımını kaldır/emekliye ayır; `window.APP` exportları.
- Test: `tests/e2e_test_runner.js` (v1 good/seed/eligibility testlerini kaldır; aşağıdakileri ekle).

**Interfaces:**
- Consumes: `getTodayDateString()`, `mkLocalDateKey()`, `getTodayDateString(offsetDays)` (tarih+gün), `STATE.activeModule`, `getActiveGrade()`, `getNotebookRecord`, `WORDS_DATA`.
- Produces:
  - Kayıt şeması: `{ color:'red'|'yellow'|'green'|null, kolayStreak:number, candidate:boolean, nextReview:string|null, lastReview:string|null, archived:boolean, archiveLabel:string|null, archiveDate:string|null, srcModule:'maarif'|'yds'|'oxford'|'all', srcGrade:number|null, enrolledAt:string }`
  - `notebookInterval(color) -> 1|3|5` (red→1, yellow→3, green→5)
  - `rateNotebookColor(wordId:number, color:'red'|'yellow'|'green') -> rec` (rengi atar, `lastReview=bugün`, `nextReview=bugün+interval`, green ise `kolayStreak++` & `candidate = kolayStreak>=5`, aksi halde `kolayStreak=0`; **küresel SRS'e yazmaz**; `saveUserData()`; sonra `nextFlashcard()`). Aynı gün ikinci kez çağrı: `lastReview===bugün` ise renk/aralık güncellenir ama `kolayStreak` tekrar artmaz.
  - `enrollNotebookWord` artık yeni şemayla kaydeder (`color:null`, `srcModule:STATE.activeModule`, `srcGrade: maarifse getActiveGrade() değilse null`), eski kayıtta eksik alanları okurken bozmaz.

- [ ] **Step 1: Write the failing tests** (ve v1'in `test_seed_color_*`, `test_good_*`, `test_eligibility_threshold_and_green`, `test_notebook_rating_does_not_touch_global_srs`, `test_notebook_rating_daily_cap`, `test_flashcard_rating_routes_by_source` testlerini kaldır)

```js
registerTest(1, 'Renkli Defterler', 'test_rate_red_sets_color_and_interval', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[0].id;
  env.APP.rateNotebookColor(id, 'red');
  const r = env.APP.getNotebookRecord(id);
  assertEqual(r.color, 'red', 'renk kırmızı olmalı');
  assertEqual(r.nextReview, env.APP.getTodayDateString(1), 'kırmızı 1 gün sonraya planlanmalı');
});

registerTest(1, 'Renkli Defterler', 'test_rate_yellow_green_intervals', () => {
  const env = createFreshAppEnvironment();
  const y = env.sandbox.WORDS_DATA[1].id, g = env.sandbox.WORDS_DATA[2].id;
  env.APP.rateNotebookColor(y, 'yellow');
  env.APP.rateNotebookColor(g, 'green');
  assertEqual(env.APP.getNotebookRecord(y).nextReview, env.APP.getTodayDateString(3), 'sarı 3 gün');
  assertEqual(env.APP.getNotebookRecord(g).nextReview, env.APP.getTodayDateString(5), 'yeşil 5 gün');
});

registerTest(1, 'Renkli Defterler', 'test_green_five_times_makes_candidate', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[3].id;
  for (let i = 0; i < 5; i++) { const r = env.APP.getNotebookRecord(id); if (r) r.lastReview = null; env.APP.rateNotebookColor(id, 'green'); }
  assertEqual(env.APP.getNotebookRecord(id).candidate, true, '5 kez yeşil mezuniyet adayı yapmalı');
});

registerTest(1, 'Renkli Defterler', 'test_red_resets_kolay_streak', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[4].id;
  const r = env.APP.getNotebookRecord(id) || env.APP.enrollNotebookWord(id);
  r.kolayStreak = 3;
  env.APP.rateNotebookColor(id, 'red');
  assertEqual(env.APP.getNotebookRecord(id).kolayStreak, 0, 'kırmızı kolay sayacını sıfırlamalı');
});

registerTest(1, 'Renkli Defterler', 'test_rate_same_day_does_not_double_streak', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[5].id;
  env.APP.rateNotebookColor(id, 'green');
  env.APP.rateNotebookColor(id, 'green'); // aynı gün ikinci
  assertEqual(env.APP.getNotebookRecord(id).kolayStreak, 1, 'aynı gün kolay sayacı en fazla +1');
});

registerTest(1, 'Renkli Defterler', 'test_rate_does_not_touch_global_srs', () => {
  const env = createFreshAppEnvironment();
  const id = env.sandbox.WORDS_DATA[6].id;
  env.APP.rateNotebookColor(id, 'green');
  assert(env.APP.getState().userData.srs[id] == null, 'renk butonu küresel SRS yazmamalı');
  assert(!env.APP.getState().userData.learned.has(id), 'öğrenilenler setine yazmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_enroll_stores_source_and_defaults', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  const id = env.sandbox.WORDS_DATA[7].id;
  const r = env.APP.enrollNotebookWord(id);
  assertEqual(r.srcModule, 'yds', 'kaynak modül kayıtta saklanmalı');
  assertEqual(r.color, null, 'yeni kelime renksiz başlamalı');
  assertEqual(r.archived, false, 'yeni kelime arşivsiz olmalı');
});

registerTest(1, 'Renkli Defterler', 'test_v1_record_loads_without_crash', () => {
  const id = 54321;
  const env = createFreshAppEnvironment({ initialStorage: {
    mk_notebooks: JSON.stringify({ [id]: { color:'green', good:4, lastGoodDate:null, enrolledAt:'2026-01-01', promotedAt:null } })
  }});
  const r = env.APP.getNotebookRecord(id);
  assertEqual(r.color, 'green', 'v1 rengi korunmalı');
  assert(env.APP.getState().userData.notebooks[id] != null, 'v1 kaydı yüklenmeli, çökmemeli');
});
```

- [ ] **Step 2: Run to verify fail** — `node tests/e2e_test_runner.js 2>&1 | grep -iE "rate_|candidate|FAIL"` → yeni testler FAIL (`rateNotebookColor is not a function`).
- [ ] **Step 3: Implement** — `notebookInterval` (red1/yellow3/green5); `rateNotebookColor` imzadaki davranışla (aynı-gün koruması: `const first = rec.lastReview !== mkLocalDateKey()`; green & first → kolayStreak++); `enrollNotebookWord` yeni şema; `calculateSRS` notebook `good` kancasını kaldır; `getTodayDateString` zaten offset alıyor (`calculateSRS`'te kullanılıyor) — kullan. `seedNotebookColor` çağrısını enroll'dan çıkar (fonksiyon kalabilir, kullanılmaz). **`markNotebookCard`'ı kaldır; `rateFlashcard`'ın notebook dalını kaldır** (artık notebook butonları Task 4'te doğrudan `rateNotebookColor` çağırır; `rateFlashcard` yalnız SRS kaynakları için kalır). `window.APP`'ten `markNotebookCard, isNotebookEligible, getNotebookEligibleWords` kaldır; `notebookInterval, rateNotebookColor, getTodayDateString` ekle.
- [ ] **Step 4: Run to verify pass** — tüm testler PASS.
- [ ] **Step 5: Commit** — `feat(notebooks-v2): renk-butonu çekirdeği (renk + sabit takvim + mezuniyet adayı)` (+ attribution).

---

### Task 2: Mezuniyet adayları, Seviye Geçme Testi ve arşivleme

**Files:**
- Modify: `app.js` — yeni `getNotebookCandidates`, `notebookArchiveLabel`, `archiveNotebookWord`; `shouldOfferLevelUpTest`/`startNotebookLevelUpTest` yeniden yaz; `handleQuizAnswer` (~7976-8014) notebook_levelup doğru cevabı **kuyruğa** alsın (anında değil); `renderQuizView` tamamlanma bloğu (~5841 `if (qState.active)`) notebook_levelup kuyruğunu arşivlesin; `promoteNotebookWord`'ü kaldır; exportlar.
- Test: `tests/e2e_test_runner.js` (v1 `test_promote_*`, `test_levelup_offer_threshold_20`, `test_levelup_test_uses_eligible_only_*`, `test_levelup_quiz_answer_isolated_*` → v2'ye uyarla).

**Interfaces:**
- Consumes: `getNotebookRecord`, `WORDS_DATA`, `STATE.activeModule`, `getActiveGrade()`, `gradeWordMeta`, `pickDistractors`, `shuffleArray`, `STATE.quizState`, `saveQuizState`, `switchView`, `getTodayDateString`.
- Produces:
  - `getNotebookCandidates() -> word[]` (kayıtlı ∩ `!archived` ∩ `candidate` ∩ `srcModule===STATE.activeModule` ∩ (maarif ise `srcGrade===getActiveGrade()`))
  - `shouldOfferLevelUpTest() -> boolean` (`getNotebookCandidates().length >= 20`)
  - `startNotebookLevelUpTest() -> void` (adaylardan quiz; `STATE.quizState.source='notebook_levelup'`, `STATE.quizState.notebookArchiveQueue=[]`)
  - `notebookArchiveLabel(rec) -> string` (spec 8.5: srcModule/srcGrade'den)
  - `archiveNotebookWord(wordId) -> rec|null` (`archived=true`, `archiveLabel`, `archiveDate=bugün`, `candidate=false`)
  - Yan etki: notebook_levelup doğru cevap → `notebookArchiveQueue.push(id)`; quiz tamamlanınca kuyruk arşivlenir.

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_candidates_scoped_to_active_module', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  const a = env.sandbox.WORDS_DATA[0].id, b = env.sandbox.WORDS_DATA[1].id;
  const ra = env.APP.enrollNotebookWord(a); ra.candidate = true; ra.srcModule = 'yds';
  const rb = env.APP.enrollNotebookWord(b); rb.candidate = true; rb.srcModule = 'maarif';
  const ids = env.APP.getNotebookCandidates().map(w => w.id);
  assert(ids.includes(a) && !ids.includes(b), 'yalnızca aktif modülün adayları gelmeli');
});

registerTest(1, 'Renkli Defterler', 'test_levelup_offer_threshold_20_scoped', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  const ids = env.sandbox.WORDS_DATA.slice(0, 20).map(w => w.id);
  ids.forEach((id, i) => { const r = env.APP.enrollNotebookWord(id); r.srcModule='yds'; r.candidate = i < 19; });
  assertEqual(env.APP.shouldOfferLevelUpTest(), false, '19 adayda test yok');
  env.APP.getNotebookRecord(ids[19]).candidate = true;
  assertEqual(env.APP.shouldOfferLevelUpTest(), true, '20 adayda test önerilmeli');
});

registerTest(1, 'Renkli Defterler', 'test_archive_label_maarif_and_yds', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  const id = env.sandbox.WORDS_DATA[0].id;
  const r = env.APP.enrollNotebookWord(id); r.srcModule = 'yds';
  assert(/YDS/.test(env.APP.notebookArchiveLabel(r)), 'YDS etiketi YDS içermeli');
  r.srcModule = 'maarif'; r.srcGrade = 5;
  assert(/5\. Sınıf/.test(env.APP.notebookArchiveLabel(r)), 'maarif etiketi sınıfı içermeli');
});

registerTest(1, 'Renkli Defterler', 'test_archive_excludes_from_candidates', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  const id = env.sandbox.WORDS_DATA[0].id;
  const r = env.APP.enrollNotebookWord(id); r.srcModule='yds'; r.candidate = true;
  env.APP.archiveNotebookWord(id);
  assert(env.APP.getNotebookRecord(id).archived === true, 'arşivlenmeli');
  assert(!env.APP.getNotebookCandidates().some(w => w.id === id), 'arşivlenen aday havuzundan düşmeli');
});

registerTest(1, 'Renkli Defterler', 'test_levelup_archives_correct_on_completion_not_midquit', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  const ids = env.sandbox.WORDS_DATA.slice(0, 22).map(w => w.id);
  ids.forEach(id => { const r = env.APP.enrollNotebookWord(id); r.srcModule='yds'; r.candidate = true; });
  env.APP.startNotebookLevelUpTest();
  const qs = env.APP.getState().quizState;
  const firstTarget = qs.questions[0].targetWord.id;
  const correctIdx = qs.questions[0].options.findIndex(o => o.isCorrect);
  env.APP.handleQuizAnswer(correctIdx);
  assert(env.APP.getNotebookRecord(firstTarget).archived !== true, 'tek doğru cevapta (test bitmeden) arşivlenmemeli');
  // kalan soruları doğru cevapla -> tamamlanınca arşivlenmeli
  while (env.APP.getState().quizState.currentIndex < env.APP.getState().quizState.questions.length) {
    const q = env.APP.getState().quizState.questions[env.APP.getState().quizState.currentIndex];
    env.APP.handleQuizAnswer(q.options.findIndex(o => o.isCorrect));
    env.APP.nextQuizQuestion();
  }
  env.APP.renderQuizView(); // tamamlanma bloğunu tetikler
  assert(env.APP.getNotebookRecord(firstTarget).archived === true, 'test tamamlanınca doğru bilinen arşivlenmeli');
});
```

- [ ] **Step 2: Run to verify fail** — yeni testler FAIL.
- [ ] **Step 3: Implement** — imzalar yukarıda. `handleQuizAnswer` doğru dalında `if (source==='notebook_levelup') (STATE.quizState.notebookArchiveQueue ||= []).push(id); else { calculateSRS... }` (izolasyon korunur). `renderQuizView` tamamlanma `if (qState.active)` bloğunda: `if (qState.source==='notebook_levelup' && Array.isArray(qState.notebookArchiveQueue)) qState.notebookArchiveQueue.forEach(archiveNotebookWord);`. `promoteNotebookWord` kaldırılır (export dahil). `window.APP`: `getNotebookCandidates, notebookArchiveLabel, archiveNotebookWord` ekle; `isNotebookEligible/getNotebookEligibleWords/promoteNotebookWord` kaldır.
- [ ] **Step 4: Run to verify pass**.
- [ ] **Step 5: Commit** — `feat(notebooks-v2): mezuniyet adayları, Seviye Geçme Testi ve arşivleme` (+ attribution).

---

### Task 3: Günlük küme (sabit takvim), günlük tavan ve tamamlanma verisi

**Files:**
- Modify: `app.js` — `buildNotebookDailySet` (~2237) yeniden yaz; yeni `notebookDayState`/`getNotebookDailyRemaining`/`_bumpNotebookDayUsed`; `STATE.userData` init + `saveUserData` + export + import + reset listelerine `notebookDay` ekle (Task 1'den beri kalıcılık deseni).
- Test: `tests/e2e_test_runner.js` (v1 `test_unlocked_words_*` korunur; `test_daily_set_*` güncellenir).

**Interfaces:**
- Consumes: `getUnlockedModuleWords`, `getNotebookRecord`, `enrollNotebookWord`, `getNotebookDailyCount`, `mkLocalDateKey`, `STATE.activeModule`, `getActiveGrade`.
- Produces:
  - `notebookDayState() -> {date, used}` (bugün değilse sıfırlar; `STATE.userData.notebookDay`)
  - `getNotebookDailyRemaining() -> number` (`max(0, dailyCount - used[activeModule])`)
  - `buildNotebookDailySet() -> word[]` (unlocked ∩ aktif modül; `archived` hariç; önce `due`=`nextReview==null||<=bugün`, sonra `new`=kayıtsız (enroll: srcModule/srcGrade), `getNotebookDailyRemaining()` kadar; küme boyutu kadar `used[activeModule]` artır+kaydet)

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_daily_set_excludes_archived', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '3', mk_current_day_date: '2000-01-01' }});
  const first = env.APP.getUnlockedModuleWords()[0].id;
  const r = env.APP.enrollNotebookWord(first); r.archived = true;
  const set = env.APP.buildNotebookDailySet();
  assert(!set.some(w => w.id === first), 'arşivlenen kelime günlük kümede olmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_daily_set_due_by_nextreview', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '3', mk_current_day_date: '2000-01-01' }});
  const u = env.APP.getUnlockedModuleWords();
  const future = env.APP.enrollNotebookWord(u[0].id); future.nextReview = env.APP.getTodayDateString(3); // bugün değil
  const set = env.APP.buildNotebookDailySet();
  assert(!set.some(w => w.id === u[0].id), 'ileri tarihli nextReview bugünkü kümede gelmemeli');
});

registerTest(1, 'Renkli Defterler', 'test_daily_cap_not_exceeded_on_repeat', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '5', mk_current_day_date: '2000-01-01' }});
  env.APP.setNotebookDailyCount(8);
  const s1 = env.APP.buildNotebookDailySet();
  const s2 = env.APP.buildNotebookDailySet(); // tekrar "Bugünü Çalış"
  assert(s1.length <= 8, 'ilk küme adedi aşmamalı');
  assert(s1.length + s2.length <= 8, 'tekrar basmak günlük tavanı aşmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_daily_new_words_store_source', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '2', mk_current_day_date: '2000-01-01' }});
  const set = env.APP.buildNotebookDailySet();
  assert(set.length > 0, 'küme boş olmamalı');
  assertEqual(env.APP.getNotebookRecord(set[0].id).srcModule, 'yds', 'yeni kelime kaynağını saklamalı');
});
```

- [ ] **Step 2: Run to verify fail**.
- [ ] **Step 3: Implement** — imzalar yukarıda; `getSRSDueWords` bağımlılığı kaldırılır (sabit takvim). `notebookDay` kalıcılığı: `lsJSON('mk_notebook_day', null)` init, `saveUserData` (`mk_notebook_day`; null değilse yaz, null ise sil), export/import/reset listeleri.
- [ ] **Step 4: Run to verify pass**.
- [ ] **Step 5: Commit** — `feat(notebooks-v2): sabit takvimli günlük küme ve günlük tavan` (+ attribution).

---

### Task 4: Deftere özel flash kart arayüzü (renkli butonlar + tamamlanma)

**Files:**
- Modify: `app.js` — `renderFlashcardView` (~5364): `sourceVal==='notebook'` için kontrol bloğu (üç renkli buton → `rateNotebookColor`, alt etiket "1 gün/3 gün/5 gün", SRS meta/projeksiyon gizli) ve küme bitince **tamamlanma ekranı**; `nextFlashcard` (~8326) notebook'ta sarmalamasın (sonda tamamlanma); klavye 1/2/3 → notebook'ta renk.
- Test: `tests/e2e_test_runner.js`.

**Interfaces:**
- Consumes: `buildNotebookDailySet`, `rateNotebookColor`, `shouldOfferLevelUpTest`, `renderIcon`, `STATE.flashcardSource`, `STATE.filteredFlashcards`, `STATE.activeFlashcardIndex`.
- Produces: notebook kaynağında DOM — üç `data-nb-color` butonu `onclick="window.APP.rateNotebookColor(id,'red'|'yellow'|'green')"`; tamamlanma paneli (`nb-complete`), uygunsa `startNotebookLevelUpTest` CTA.

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_notebook_card_renders_color_buttons', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '2', mk_current_day_date: '2000-01-01' }});
  env.APP.startNotebookFlashcards();
  const html = env.document.getElementById('view-flashcard').innerHTML;
  assert(/rateNotebookColor\([0-9]+,\s*'red'\)/.test(html), 'kırmızı renk butonu olmalı');
  assert(/rateNotebookColor\([0-9]+,\s*'green'\)/.test(html), 'yeşil renk butonu olmalı');
  assert(/1 gün/.test(html) && /3 gün/.test(html) && /5 gün/.test(html), 'sabit aralık etiketleri olmalı');
  assert(!/markFlashcardSRS/.test(html), 'notebook kartında SRS puanlama butonu olmamalı');
});

registerTest(1, 'Renkli Defterler', 'test_notebook_completion_screen_when_set_empty', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', mk_current_day: '2', mk_current_day_date: '2000-01-01' }});
  env.APP.setNotebookDailyCount(1);
  env.APP.buildNotebookDailySet(); // kotayı tüket
  env.APP.startNotebookFlashcards();
  const html = env.document.getElementById('view-flashcard').innerHTML;
  assert(/nb-complete|Bugünlük bitti/.test(html), 'kota dolunca tamamlanma ekranı gösterilmeli');
});
```

- [ ] **Step 2: Run to verify fail**.
- [ ] **Step 3: Implement** — `renderFlashcardView`'da notebook dalı: boş/biten kümede `nb-complete` paneli; dolu kartta renkli buton seti + SRS meta gizli. `nextFlashcard` notebook'ta son karttan sonra render'ı tamamlanmaya düşürür. Klavye yönlendirmesi (keydown handler'da) notebook ise 1/2/3 → `rateNotebookColor` red/yellow/green.
- [ ] **Step 4: Run to verify pass**.
- [ ] **Step 5: Commit** — `feat(notebooks-v2): renkli buton seti ve tamamlanma ekranı` (+ attribution).

---

### Task 5: Koleksiyon görünümü — modül kovaları + Arşiv bölümü

**Files:**
- Modify: `app.js` — `renderNotebooksView` (~mevcut): üç kovayı aktif modül + `!archived` ile süz; **Arşiv bölümü** (tüm modüllerin `archived` kelimeleri, `archiveLabel`+`archiveDate` ile grupla); adaylar≥20 ise Seviye Geçme Testi CTA.
- Modify: `app.css` — arşiv grup stilleri (palet token).
- Test: `tests/e2e_test_runner.js` (v1 `test_notebooks_view_renders_three_buckets`, `test_notebooks_view_shows_levelup_cta_at_threshold` güncellenir).

**Interfaces:**
- Consumes: `STATE.userData.notebooks`, `STATE.activeModule`, `getActiveGrade`, `getNotebookCandidates`, `shouldOfferLevelUpTest`, `notebookArchiveLabel`, `escapeHtml`, `renderIcon`, `displayExample`.
- Produces: `renderNotebooksView()` — kovalar modül-süzülü; `data-notebook-color` korunur; Arşiv bölümü `data-nb-archive-group` ile.

- [ ] **Step 1: Write the failing tests**

```js
registerTest(1, 'Renkli Defterler', 'test_buckets_exclude_archived_and_other_modules', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds', learnish_selected_grade: '5' }});
  const a = env.sandbox.WORDS_DATA[0].id, b = env.sandbox.WORDS_DATA[1].id, c = env.sandbox.WORDS_DATA[2].id;
  const ra = env.APP.enrollNotebookWord(a); ra.color='red'; ra.srcModule='yds';
  const rb = env.APP.enrollNotebookWord(b); rb.color='red'; rb.srcModule='yds'; rb.archived=true; rb.archiveLabel='YDS & YÖKDİL'; rb.archiveDate='2026-11-25';
  const rc = env.APP.enrollNotebookWord(c); rc.color='red'; rc.srcModule='maarif';
  env.APP.switchView('notebooks');
  const html = env.document.getElementById('view-notebooks').innerHTML;
  assert(html.includes('#' + a) || new RegExp('data-notebook-color="red"').test(html), 'aktif modül kelimesi kovada görünmeli');
  assert(/data-nb-archive-group/.test(html), 'arşiv bölümü render edilmeli');
});

registerTest(1, 'Renkli Defterler', 'test_notebooks_view_levelup_cta_at_20_candidates', () => {
  const env = createFreshAppEnvironment({ initialStorage: { learnish_active_module: 'yds' }});
  env.sandbox.WORDS_DATA.slice(0, 20).forEach(w => { const r = env.APP.enrollNotebookWord(w.id); r.srcModule='yds'; r.candidate = true; });
  env.APP.switchView('notebooks');
  assert(/startNotebookLevelUpTest/.test(env.document.getElementById('view-notebooks').innerHTML), '20 adayda test CTA görünmeli');
});
```

- [ ] **Step 2: Run to verify fail**.
- [ ] **Step 3: Implement** — `renderNotebooksView` süzme + Arşiv grupları; `app.css` arşiv stilleri.
- [ ] **Step 4: Run to verify pass**.
- [ ] **Step 5: Commit** — `feat(notebooks-v2): modül kovaları ve arşiv görünümü` (+ attribution).

---

### Task 6: Bundle senkronu ve tam doğrulama

**Files:** Modify `Learnish_Tek_Dosya_Web_App.html` (yalnızca `build.py --bundle`), ve onun güncellediği `index.html`/`service-worker.js` hash damgaları.

- [ ] **Step 1:** `python3 build.py --bundle` (yıkıcı ETL değil).
- [ ] **Step 2:** `python3 build.py --check` → Exit 0, "%100 senkron".
- [ ] **Step 3:** `node tests/e2e_test_runner.js 2>&1 | tail -6` → 0 FAIL.
- [ ] **Step 4:** Korpus: `python3 -c "import json; r=open('words-data.js',encoding='utf-8').read(); i=r.index('['); d,_=json.JSONDecoder().raw_decode(r[i:]); print('WORDS', len(d))"` → `WORDS 11000`; `git diff --quiet words-data.js` temiz.
- [ ] **Step 5: Commit** — `build(notebooks-v2): tek-dosya bundle senkronu` (+ attribution).

---

## Notlar (uygulayıcı)
- `app.js` tek IIFE; yeni kod mevcut Renkli Defterler bölümünde kalır.
- Her yeni fonksiyon `window.APP`'e eklenmeli (e2e erişimi; `getState` zaten açık).
- `build.py` yalnızca `--bundle`/`--check`; argümansız (yıkıcı) çalıştırılmaz.
- Her task sonunda süit geçişi **"Tests Failed : 0"** satırından elle doğrulanır (runner fail'de exit 0 dönebilir).
