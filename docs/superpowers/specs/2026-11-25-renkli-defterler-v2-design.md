# Renkli Defterler v2 — Öğrenci Yönlü Renk, Sabit Takvim ve Arşiv

**Tarih:** 2026-11-25
**Durum:** Taslak (onay bekliyor)
**Yaklaşım:** A — Mevcut Renkli Defterler katmanını yerinde genişlet (flash kart + quiz motorlarını koru)
**Önceki tasarım:** `docs/superpowers/specs/2026-11-25-renkli-defterler-design.md` (v1). Bu doküman v1'in renk/terfi mekaniğini **değiştirir**; izolasyon (defter çalışması küresel SRS'e dokunmaz) ve "havuza sıfır dokunuş" ilkeleri aynen korunur.

---

## 1. Amaç ve Neden

v1'de üç sorun çıktı (ekran görüntüsüyle doğrulandı):
1. **Kartlar bitmiyor** — notebook günlük çalışması sonsuz döngüde (`nextFlashcard` `% uzunluk` ile sarıyor), "bugünlük bitti" durumu yok.
2. **Butonlar kademelerle uyuşmuyor** — kartın altındaki ZOR/İYİ/KOLAY butonları ve "1749 gün / 2361 gün" gibi **küresel SRS projeksiyonları**, defterin 🔴 zor / 🟡 orta / 🟢 kolay kademeleriyle örtüşmüyor; öğrencinin kafasını karıştırıyor.
3. Renk, CEFR/performanstan tohumlanıp yalnızca testle değişiyordu — öğrenci **kendi** zorluk hissini yansıtamıyordu.

**Yeni model (öğrenci yönlü):** Öğrenci her kelimeyi **üç renkli butonla** (🔴 Zor / 🟡 Orta / 🟢 Kolay) kendi değerlendirir; bu doğrudan kelimenin **rengini/kademesini** belirler ve **sabit bir takvimle** ne sıklıkta tekrar geleceğini ayarlar. Sürekli "kolay" denen kelimeler önce **mezuniyet adayı**, sonra bir **Seviye Geçme Testi**'nden geçince **Arşiv**'e (ünite/kaynak + tarih etiketiyle) kaldırılır.

## 2. Tam Akış (kullanıcı onaylı)

1. Öğrenci "Bugünü Çalış" der; o gün **tekrarı gelen** (sabit takvime göre) + yeni kelimeler, günlük adet kadar önüne gelir.
2. Her kartta üç **renkli** buton: 🔴 Zor / 🟡 Orta / 🟢 Kolay. Basınca kelimenin rengi o olur.
3. **Sabit takvim:** 🔴 → 1 günde bir, 🟡 → 3 günde bir, 🟢 → 5 günde bir tekrar gelir.
4. Bir kelime **üst üste 5 kez 🟢 Kolay** işaretlenince **mezuniyet adayı** olur. (🔴/🟡 denirse sayaç sıfırlanır.)
5. **20 aday** birikince **Seviye Geçme Testi** çıkar; test yalnızca o adaylardan oluşur.
6. Testte **doğru** bilinen kelimeler **Arşive** gider (ünite/kaynak + tarih etiketiyle), aktif rotasyondan çıkar. **Yanlış** bilinenler aday havuzunda kalır.
7. Günün kümesi bitince **"Bugünlük bitti" tamamlanma ekranı** gösterilir (sonsuz döngü yok).

## 3. Hedefler

1. **Döngü biter:** notebook günlük çalışması, o günün kümesi tükenince tamamlanma ekranı gösterir; kartlar sarmalanmaz.
2. **Renkli buton seti:** notebook kaynağında kart kontrolleri 🔴 Zor / 🟡 Orta / 🟢 Kolay (renkli), alt etiketleri sabit **"1 gün / 3 gün / 5 gün"**; arka yüzdeki SRS meta'sı (Tekrar Aralığı/Hatırlama) notebook kartında **gizlenir**.
3. **Renk = öğrenci kararı:** buton kelimenin rengini/kademesini doğrudan belirler.
4. **Sabit takvim:** renge göre 1/3/5 günlük tekrar aralığı.
5. **Mezuniyet adayı:** üst üste 5× 🟢 Kolay.
6. **Seviye Geçme Testi:** 20 aday birikince, yalnızca adaylardan; geçen (doğru) kelimeler arşivlenir, kalanlar havuzda kalır.
7. **Arşiv:** arşivlenen kelimeler kaynağına göre etiketlenir + tarih; koleksiyon görünümünde ayrı bir Arşiv bölümünde paketler hâlinde gösterilir.
   - Maarif: `<Sınıf>. Sınıf · <Ünite/Tema adı>` (kelimenin müfredattaki ünitesi/teması).
   - YDS: `YDS & YÖKDİL`. Oxford/Kütüphane: `Kütüphane`. Tümü: `Tüm Kütüphane`.

## 4. Hedef Olmayanlar

- Küresel SRS'e / öğrenilenler / Hata Defterine yazmak (izolasyon korunur; v2 de yazmaz).
- Korpusu/`words-data.js`'i değiştirmek (11.000 sabit).
- İkinci tam SRS motoru (yalnızca sabit 1/3/5 takvim; ease-factor vb. yok).
- Renk sürükle-bırak dışı yollarla (yalnızca üç buton) değişsin.

## 5. Hedefe Karşı Olanlar (Anti-Goals)

- Kartların yine sonsuz dönmesi.
- Butonların hâlâ kademelerle uyuşmaması / anlamsız gün sayıları göstermesi.
- Arşivlenen (ustalaşılan) kelimelerin kaybolması (arşiv onları saklar).
- Defter puanlamasının diğer havuzların tekrar programını oynatması.
- Öğrencinin aynı kelimeyi aynı gün 5× "kolay" diyerek anında adaya çevirmesi (sabit takvim bunu zaten engeller — işaretlenen kelime o gün tekrar gelmez).

## 6. Kısıtlar

- Çevrimdışı, çalışma anında yapay zekâ yok; vanilla JS tek IIFE `app.js`; `app.css`; `index.html`.
- Kalıcılık `STATE.userData.notebooks` (mevcut `mk_notebooks`); yeni alanlar düz nesne olarak taşınır, yeni localStorage anahtarı gerekmez.
- Yalnızca `claude/modest-cerf-cahp9u` dalında; e2e paketi yeşil; `build.py --check` senkron.
- Commit sonu: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: https://claude.ai/code/session_01VuxjxqbjQv6rcdXWgkHrwT`.

## 7. Değerlendirilen Yaklaşımlar

- **A — Yerinde genişlet (SEÇİLDİ).** Kayıt alanlarını yeni modele uyarla; flash kart motorunu koru ama notebook kaynağında kontrol bloğunu (renkli butonlar + tamamlanma) değiştir; Seviye Geçme Testi için mevcut quiz motorunu kullan; koleksiyon görünümüne Arşiv bölümü ekle. *Artı:* kart/çeviri/ses/örnek altyapısı korunur, en az tekrar. *Eksi:* `renderFlashcardView` içine notebook'a özel birkaç dal.
- **B — Deftere özel ayrı çalışma ekranı.** *Red:* kart arayüzünü (çeviri/ses/örnek/telaffuz) ikiye katlar; "flash kart gibi gelsin" isteğine aykırı.

## 8. Kararlaştırılan "Nasıl"

### 8.0 Kapsam — modül bazında (kullanıcı onaylı)
- Günlük küme, üç renkli kova ve Seviye Geçme Testi **aktif modüle** göre işler (MEB sınıfı / YDS / Oxford-Kütüphane). Kelimenin kaydı **kaynağını** saklar; kova/aday/test aktif modüle (ve maarifte sınıfa) göre süzülür.
- **20-aday eşiği aktif modül içindir.**
- **Arşiv küreseldir:** tüm modüllerin arşivlenmiş kelimelerini birlikte, **kayıtta saklı kaynak etiketiyle** gruplayarak gösterir.

### 8.1 Veri modeli (`STATE.userData.notebooks[id]`)
```
{
  color: 'red' | 'yellow' | 'green' | null,   // null = henüz işaretlenmemiş (yeni)
  kolayStreak: number,                        // üst üste 🟢 Kolay sayısı
  candidate: boolean,                         // kolayStreak >= 5 → true (mezuniyet adayı)
  nextReview: 'YYYY-MM-DD' | null,            // sabit takvim tekrar tarihi (yerel)
  lastReview: 'YYYY-MM-DD' | null,
  archived: boolean,
  archiveLabel: string | null,                // ör. "5. Sınıf · Ünite 2" / "YDS & YÖKDİL"
  archiveDate: 'YYYY-MM-DD' | null,
  srcModule: 'maarif'|'yds'|'oxford'|'all',   // KAYIT ANINDA saklanır (kova/aday/test süzme + arşiv etiketi)
  srcGrade: number | null,                    // maarif ise kayıt anındaki sınıf
  enrolledAt: 'YYYY-MM-DD'
}
```
- Kova/aday/günlük süzme bu `srcModule` (+ `srcGrade`) ile yapılır; böylece modül/sınıf değişse bile kelime doğru deftere/arşive bağlı kalır.
- v1'in `good`/`lastGoodDate`/`promotedAt` alanları ve `seedNotebookColor`/`promoteNotebookWord` mantığı **kaldırılır/değiştirilir** (yerini renk-butonu + arşiv alır). Eski kayıtları kıran bir durum yok: eksik alanlar okunurken varsayılanlanır (color varsa korunur yoksa null, kolayStreak yoksa 0, archived yoksa false, srcModule yoksa aktif modülle doldurulur).

### 8.1.1 Günlük tavan (`STATE.userData.notebookDay`)
```
{ date: 'YYYY-MM-DD', used: { maarif: n, yds: n, oxford: n, all: n } }
```
Yeni günde sıfırlanır. Günlük küme boyutu = `getNotebookDailyCount() - used[aktifModül]` (0'a inince "Bugünlük bitti"). Böylece "Bugünü Çalış"a tekrar basmak kotayı aşmaz.

### 8.2 Renk butonu (rating → renk + takvim)
`rateNotebookColor(wordId, color)` (color ∈ red|yellow|green):
- `enrollNotebookWord(id)` (gerekiyorsa kayıt oluştur).
- `rec.color = color`; `rec.lastReview = bugün`.
- 🔴 red → `nextReview = bugün+1`, `kolayStreak = 0`.
- 🟡 yellow → `nextReview = bugün+3`, `kolayStreak = 0`.
- 🟢 green → `nextReview = bugün+5`, `kolayStreak += 1`; `kolayStreak >= 5` ise `candidate = true`.
- **Küresel SRS'e dokunmaz** (izolasyon). `saveUserData()` + sonraki kart.

### 8.3 Günlük küme ve tamamlanma
`buildNotebookDailySet()` (aktif modül kapsamında):
- `unlocked = getUnlockedModuleWords()` (v1'deki gibi, aktif modül; archived hariç).
- `due = unlocked ∩ kayıtlı ∩ !archived ∩ (nextReview == null || nextReview <= bugün)`.
- `new = unlocked ∩ kayıtsız` (kayıt edilir; `color=null`, `nextReview=null`, `srcModule=aktifModül`, `srcGrade=maarifse sınıf`).
- Günlük kalan = `getNotebookDailyCount() - notebookDay.used[aktifModül]` (≤0 ise boş → tamamlanma ekranı).
- Küme = önce `due` (en gecikmişten / kırmızıdan başlayarak), sonra `new`, kalan kadar. Küme kurulurken `used[aktifModül]` küme boyutu kadar artırılır (kota düşer).
- **Oturum kümesi sabittir:** "Bugünü Çalış"ta bir kez kurulur; her puanlamada yeniden hesaplanmaz (ileri gidilir). Puanlanan kelime (`lastReview=bugün`) bugün tekrar gelmez.
- Tamamlanma: notebook kaynağında kart akışı kümenin sonuna gelince **sarmalamaz**; "Bugünlük bitti ✓" ekranı gösterir (uygunsa Seviye Geçme Testi CTA'sı ile). Boş kümede de aynı ekran.

### 8.4 Seviye Geçme Testi (arşiv kapısı) — aktif modül kapsamında
- `getNotebookCandidates()` = kayıtlı ∩ !archived ∩ `candidate` ∩ `srcModule === aktifModül` (maarifte `srcGrade === aktif sınıf`).
- `shouldOfferLevelUpTest()` = `getNotebookCandidates().length >= 20`.
- `startNotebookLevelUpTest()` = adaylardan quiz kurar (mevcut motor; `source='notebook_levelup'`, küresel SRS/Hata Defterine yazmaz — izolasyon PR #6 ile mevcut).
- **Arşivleme test BİTİNCE** yapılır (yarıda bırakılırsa arşivlenmez): doğru bilinen her kelime için `archiveNotebookWord(id)` → `archived=true`, `archiveLabel=notebookArchiveLabel(rec)`, `archiveDate=bugün`; aktif rotasyondan düşer (due/kova/aday dışı). Yanlış bilinen → aday kalır.

### 8.5 Arşiv etiketi (kayıttaki saklı kaynaktan)
`notebookArchiveLabel(rec)` — kelimenin kayıt anında saklanan `srcModule`/`srcGrade`'ini kullanır (canlı aktif modülü değil):
- `srcModule === 'maarif'` → `meta = gradeWordMeta(id, rec.srcGrade)`; birim = `meta?.unitTitleTr || meta?.unitTitle || word.themeTitleTr || word.themeTitle || 'Genel'`; etiket = `${rec.srcGrade}. Sınıf · ${birim}`.
- `yds` → `YDS & YÖKDİL`. `oxford` → `Kütüphane`. `all` → `Tüm Kütüphane`.

### 8.6 Görünümler
- **Flash kart (notebook kaynağı):** üç renkli buton `onclick="window.APP.rateNotebookColor(id,'red'|'yellow'|'green')"`, alt etiketler "1 gün / 3 gün / 5 gün"; arka yüz SRS meta'sı gizli; küme bitince tamamlanma ekranı.
- **Renkli Defterler görünümü:** üç kova (🔴/🟡/🟢) **aktif modülün** kayıtlı+arşivsiz kelimelerini gösterir + **Arşiv bölümü**: TÜM modüllerin arşivlenmiş kelimeleri `archiveLabel` ile gruplanır, her grupta tarih ve kelimeler listelenir.

## 9. İnşaatçıya Bırakılanlar
- Renkli butonların ve tamamlanma/arşiv ekranlarının görsel tasarımı (DESIGN.md paleti, `--dp-color-red/amber/green`).
- Tamamlanma ekranı metinleri; arşiv grup başlığı düzeni.
- "En gecikmiş/kırmızı önce" sıralamasının kesin kriteri.

## 10. Doğrulama
- TDD regresyon testleri: renk-butonu renk+takvim atıyor; 🟢×5 → candidate; 🔴/🟡 streak sıfırlıyor; sabit aralıklar (1/3/5); due seçimi; tamamlanma (sonsuz döngü yok); test geçişi → arşiv + etiket; arşiv aktif rotasyondan düşürüyor; izolasyon (renk butonu küresel SRS yazmıyor); kalıcılık round-trip.
- Tam e2e yeşil; `build.py --check` senkron; korpus 11.000.

---

## Kararlar (denetim sonrası)
**Kullanıcı kararı:** Kapsam modül bazında (kovalar/günlük/test aktif modüle göre; arşiv küresel, kaynak etiketli).

**Benim kararlarım (yanlışsa söyle):**
- **Yeni/işaretlenmemiş kelime:** `color=null`, koleksiyonda 🔴 Zor kovasında gösterilir (bilinmeyen ≈ zor) ve ilk işaretlemeye kadar her gün gelir.
- **"5 kez kolay" üst üste** sayılır; araya 🔴/🟡 girerse sayaç sıfırlanır ("boyunca" = ardışık).
- **Günlük tavan:** `notebookDay` ile; "Bugünü Çalış"a tekrar basmak günlük adedi aşmaz.
- **Aynı gün yeniden puanlama yok:** puanlanan kelime (`lastReview=bugün`) o gün kümeye dönmez; sayaç iki kez artmaz.
- **Test izolasyonu:** PR #6 ile zaten var (küresel SRS/Hata Defterine yazmaz).
- **Arşivleme test bitince**, doğru bilinen kelimeler için; yarıda bırakılırsa arşivlenmez.
- **v1 verisi:** mevcut renk korunur; yeni alanlar varsayılanlanır; `srcModule` yoksa aktif modülle doldurulur; eski `good` dönüştürülmez.
- **Klavye 1/2/3 → 🔴/🟡/🟢** (yalnız notebook); SRS meta yalnız notebook kartında gizlenir.
- **Arşiv geri dönüşü:** arşivlenen kelime varsayılan olarak aktif rotasyona geri dönmez (mezun). (İleride "arşivden çıkar" istenirse ayrı iş.)
- **Yedek dışa/içe aktarma:** notebooks nesnesi bütün kopyalandığından yeni alanlar zaten taşınır.
