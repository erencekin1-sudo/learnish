const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LEARNISH_DIR = '/Users/erencekin/Desktop/İntegral/Learnish';
const NOTION_HTML = path.join(LEARNISH_DIR, 'belgeler', "Notion'dan Kelimeler.html");
const WORDS_DATA_PATH = path.join(LEARNISH_DIR, 'words-data.js');
const KELIMELER_HAVUZU_PATH = path.join(LEARNISH_DIR, 'otomasyon', 'kelimeler_havuzu.json');
const SERVICE_WORKER_PATH = path.join(LEARNISH_DIR, 'service-worker.js');

// 1. Helper to decode HTML entities
function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// 2. Curated CEFR map for words missing CEFR in Notion
const CEFR_LOOKUP = {
  'abide': 'C1',
  'adjure': 'C2',
  'apparate': 'C2',
  'arcane': 'C2',
  'aroused': 'B2',
  'astute': 'C2',
  'attic': 'B1',
  'brunt': 'C2',
  'cede': 'C2',
  'coalesced': 'C2',
  'coalsced': 'C2',
  'diluted': 'B2',
  'dormant': 'C1',
  'elder tree': 'B2',
  'enemas': 'C2',
  'erudite': 'C2',
  'finesse': 'C2',
  'flaying': 'C2',
  'flock': 'B2',
  'give rise to': 'B2',
  'gnarled': 'C2',
  'hatch': 'B2',
  'heed': 'C1',
  'hound': 'C1',
  'impunity': 'C2',
  'i̇mpunity': 'C2',
  'incision': 'C1',
  'i̇ncision': 'C1',
  'indulge': 'C1',
  'i̇ndulge': 'C1',
  'jot': 'C1',
  'jott': 'C1',
  'latitude': 'B2',
  'latituted': 'B2',
  'maim': 'C2',
  'mangled': 'C1',
  'mash': 'B2',
  'moping': 'C1',
  'obfuscation': 'C2',
  'plunder': 'C1',
  'plunge': 'B2',
  'pummel': 'C2',
  'ravine': 'C1',
  'sanctity': 'C2',
  'stiff': 'B1',
  'stride': 'B2',
  'stuffy': 'B2',
  'tandem': 'C1',
  'teeming': 'C2',
  'tepid': 'C2',
  'travesty': 'C2',
  'trudge': 'C1',
  'tyke': 'C2',
  'usher': 'B2',
  'vicinity': 'C1',
  'wake': 'B1',
  'wit': 'C1',
  'wrung': 'C1',
  'yoke': 'C2'
};

// 3. Curated Turkish meanings map for words missing translations
const MISSING_TR_LOOKUP = {
  'abide': 'Katlanmak, uymak, bağlı kalmak',
  'apparate': 'Cisimlenmek, aniden belirmek',
  'arcane': 'Gizemli, sır dolu, ezoterik',
  'aroused': 'Uyarılmış, harekete geçmiş, canlanmış',
  'astute': 'Zeki, kurnaz, ferasetli',
  'attic': 'Çatı katı',
  'brunt': 'En ağır darbe, en ağır yük',
  'cede': 'Devretmek, feragat etmek, bırakmak',
  'coalesced': 'Birleşmiş, kaynaşmış, bütünleşmiş',
  'coalsced': 'Birleşmiş, kaynaşmış, bütünleşmiş',
  'diluted': 'Seyreltilmiş, hafifletilmiş',
  'dormant': 'Uykuda olan, hareketsiz, aktif olmayan',
  'elder tree': 'Mürver ağacı',
  'enemas': 'Lavman',
  'erudite': 'Bilgili, alim, engin bilgi sahibi',
  'finesse': 'İncelik, ustalık, hüner',
  'flaying': 'Derisini yüzme, acımasızca eleştirme',
  'flock': 'Sürü; toplanmak, akın etmek',
  'gnarled': 'Boğumlu, budaklı, eğri büğrü',
  'hatch': 'Yumurtadan çıkmak; ambar kapağı',
  'heed': 'Dikkate almak, kulak asmak, önemsemek',
  'hound': 'Av köpeği; peşini bırakmamak',
  'impunity': 'Cezasızlık, yaptırımdan muafiyet',
  'i̇mpunity': 'Cezasızlık, yaptırımdan muafiyet',
  'incision': 'Kesi, yarık, cerrahi kesik',
  'i̇ncision': 'Kesi, yarık, cerrahi kesik',
  'indulge': 'Kendini kaptırmak, şımartmak',
  'i̇ndulge': 'Kendini kaptırmak, şımartmak',
  'jott': 'Hızlıca not almak, karalamak',
  'jot': 'Hızlıca not almak, karalamak',
  'latituted': 'Enlem; hareket serbestisi/özgürlüğü',
  'latitude': 'Enlem; hareket serbestisi/özgürlüğü',
  'maim': 'Sakat bırakmak, uzvunu koparmak',
  'mangled': 'Parçalanmış, ezilip büzülmüş',
  'mash': 'Ezmek, püre yapmak; karışım',
  'moping': 'Somurtmak, kederlenmek',
  'obfuscation': 'Karartma, kafa karıştırma, muğlaklaştırma',
  'plunder': 'Yağmalamak, talan etmek',
  'plunge': 'Dalmak, hızla düşmek',
  'pummel': 'Yumruklamak, aralıksız dövmek',
  'ravine': 'Kanyon, yarık, derin vadi',
  'sanctity': 'Kutsallık, dokunulmazlık',
  'stiff': 'Sert, bükülmez, tutulmuş',
  'stride': 'Uzun adımlarla yürümek; büyük adım',
  'stuffy': 'Havasız, bunaltıcı; tutucu',
  'tandem': 'Birlikte, iş birliği içinde, peş peşe',
  'teeming': 'Kaynayan, dolup taşan, dopdolu',
  'tepid': 'Ilık, hevesi/coşkusu az',
  'travesty': 'Çarpıtma, maskaralık, parodi',
  'trudge': 'Ağır ağır ve güçlükle yürümek',
  'tyke': 'Ufaklık, afacan çocuk',
  'usher': 'Yol göstermek, içeri almak; yer gösterici',
  'vicinity': 'Civar, çevre, yakınlar, muhit',
  'wake': 'Uyanmak; dümen suyu/izi',
  'wit': 'Akıl, nükte, kıvrak zeka',
  'wrung': 'Sıkılmış, burkulmuş',
  'yoke': 'Boyunduruk; boyunduruk altına almak'
};

// 4. Theme classification mapping
const THEMES_INFO = {
  1: { num: 1, code: 'THEME 1', title: 'SCHOOL LIFE', titleTr: 'Okul Yaşamı' },
  2: { num: 2, code: 'THEME 2', title: 'CLASSROOM LIFE', titleTr: 'Sınıf Yaşamı' },
  3: { num: 3, code: 'THEME 3', title: 'PERSONAL LIFE', titleTr: 'Kişisel Yaşam' },
  4: { num: 4, code: 'THEME 4', title: 'FAMILY LIFE', titleTr: 'Aile Yaşamı' },
  5: { num: 5, code: 'THEME 5', title: 'LIFE IN THE NEIGHBOURHOOD AND CITY', titleTr: 'Mahalle ve Şehirde Yaşam' },
  6: { num: 6, code: 'THEME 6', title: 'LIFE IN THE WORLD', titleTr: 'Dünyada Yaşam — Beslenme & Kültür' },
  7: { num: 7, code: 'THEME 7', title: 'LIFE IN NATURE', titleTr: 'Doğada Yaşam — Hayvanlar, Bitkiler & Çevre' },
  8: { num: 8, code: 'THEME 8', title: 'LIFE IN THE UNIVERSE AND FUTURE', titleTr: 'Evrende ve Gelecekte Yaşam & İleri Kavramlar' }
};

function classifyWord(en, meaning, ex, syn) {
  const norm = en.toLowerCase().trim();
  const text = `${norm} ${(meaning || '').toLowerCase()} ${(ex || '').toLowerCase()} ${(syn || '').toLowerCase()}`;

  // Direct specific match
  if (['alphabet', 'apprentice', 'curriculum', 'erudite', 'wit', 'astute', 'acquisition', 'tutor', 'learn', 'scholar'].some(k => norm.includes(k))) {
    return { themeNum: 1, cat: 'Okul, Eğitim & Entelektüel Gelişim' };
  }
  if (['add', 'answer', 'ask', 'board', 'pencil', 'homework', 'desk', 'lesson', 'spell'].some(k => norm.includes(k))) {
    return { themeNum: 2, cat: 'Sınıf Yaşamı & Öğrenme' };
  }
  if (['angry', 'afternoon', 'aroused', 'awkward', 'senile', 'madness', 'perceptual', 'temper', 'moping', 'stiff', 'stuffy'].some(k => norm.includes(k))) {
    return { themeNum: 3, cat: 'Kişisel Yaşam, Duygu & Bireysel Durumlar' };
  }
  if (['swaddle', 'tyke', 'kin', 'parent', 'baby', 'domestic', 'home', 'relative', 'family'].some(k => norm.includes(k))) {
    return { themeNum: 4, cat: 'Aile Yaşamı & Ev Ortamı' };
  }
  if (['abattoir', 'apartment', 'attic', 'adjacent', 'annex', 'subsidize', 'vicinity', 'borough', 'avenue', 'city', 'neighbourhood', 'usher'].some(k => norm.includes(k))) {
    return { themeNum: 5, cat: 'Şehir, Mekanlar & Mahalle Yaşamı' };
  }
  if (['apple', 'abdicate', 'suhoor', 'monarch', 'throne', 'slaughter', 'plunder', 'mash', 'chickenpox', 'disease', 'cure', 'king', 'treaty', 'cede', 'culture', 'country'].some(k => norm.includes(k))) {
    return { themeNum: 6, cat: 'Dünya Kültürü, Beslenme & Tarih' };
  }
  if (['animal', 'flock', 'meadow', 'gnarled', 'elder tree', 'hatch', 'hound', 'ravine', 'hose', 'nature', 'tree', 'wildlife', 'plant', 'teeming'].some(k => norm.includes(k))) {
    return { themeNum: 7, cat: 'Doğal Yaşam, Çevre & Hayvanlar' };
  }

  // General heuristics
  if (/school|learn|study|teach|student|academic|class|degree|tutor/i.test(text)) {
    return { themeNum: 1, cat: 'Eğitim & Akademik Terimler' };
  }
  if (/desk|book|write|read|listen|instruction|page|answer|question/i.test(text)) {
    return { themeNum: 2, cat: 'Sınıf Ortamı & Yönergeler' };
  }
  if (/feel|emotion|personality|body|health|pain|mind|psycholog|mood|attitude/i.test(text)) {
    return { themeNum: 3, cat: 'Kişisel Duygular & Sağlık' };
  }
  if (/family|mother|father|child|sister|brother|home|house|baby/i.test(text)) {
    return { themeNum: 4, cat: 'Aile & Ev Düzeni' };
  }
  if (/city|town|building|street|place|store|hospital|road|local|neighbour|district/i.test(text)) {
    return { themeNum: 5, cat: 'Şehir & Çevre Birimleri' };
  }
  if (/food|eat|culture|cook|tradition|country|nation|world|history|king|govern|politic|treaty/i.test(text)) {
    return { themeNum: 6, cat: 'Kültür, Gelenek & Dünya Düzeni' };
  }
  if (/animal|plant|nature|forest|tree|earth|species|bird|water|sea|flower|river/i.test(text)) {
    return { themeNum: 7, cat: 'Doğa, Flora & Fauna' };
  }

  // Theme 8 fallback: Universe, Future & Advanced Concepts
  return { themeNum: 8, cat: 'İleri Düzey & Soyut Kavramlar' };
}

function inferDesc(en, meaning) {
  const norm = en.toLowerCase().trim();
  const m = (meaning || '').toLowerCase().trim();

  // Explicit verb markers
  if (m.startsWith('to ') || m.startsWith('[+ object]') || /^(renounce|relinquish|increase|distribute|strengthen|untidy|help|join|swear|change|reduce|cause|make|take|give|build|break|move|hold|catch|throw|cut|feel|think|show)\b/i.test(m)) {
    return 'Fiil (Verb)';
  }
  // Verb suffixes
  if (/(ate|ize|ise|ify)$/i.test(norm) && !/(state|climate|senate|certificate|pirate|chocolate)/i.test(norm)) {
    return 'Fiil (Verb)';
  }
  
  // Adverbs
  if (norm.endsWith('ly') && !['ally', 'family', 'ugly', 'holy', 'silly', 'lonely', 'lovely'].includes(norm)) {
    return 'Zarf (Adverb)';
  }
  if (['albeit', 'notwithstanding', 'though', 'again'].includes(norm)) {
    return 'Bağlaç / Zarf';
  }

  // Explicit adjective markers
  if (/^(close|near|open|strange|inflexible|more than|sensory|having|full of|unable|unpleasant|extremely|very|done|made|not|causing|relating to)\b/i.test(m)) {
    return 'Sıfat (Adjective)';
  }
  // Adjective suffixes
  if (/(able|ible|ous|ful|less|ive|ish|ed)$/i.test(norm) && !['bed', 'red', 'seed', 'feed', 'need', 'speed'].includes(norm)) {
    return 'Sıfat (Adjective)';
  }

  // Explicit noun markers
  if (/^(a |an |the |something|someone|person|slaughter|madness|house|room|tube|open space|disease|essence|quality|state of|device|machine|substance|instrument|power)\b/i.test(m)) {
    return 'İsim (Noun)';
  }
  // Noun suffixes
  if (/(tion|sion|ment|ness|ity|ance|ence|ship|hood|or|er|ist|ian|ee|ant|ent|arium|oir|ics)$/i.test(norm)) {
    return 'İsim (Noun)';
  }

  // Heuristic for single-word concepts
  if (['apple', 'apartment', 'attic', 'alphabet', 'anchor', 'flock', 'meadow', 'tree', 'ravine', 'hound', 'yoke', 'wit', 'afternoon'].includes(norm)) {
    return 'İsim (Noun)';
  }

  return 'Kelime / Kavram';
}

console.log('🔄 Learnish Veritabanı Otomasyonu Başlatılıyor...');

// 5. Read Existing WORDS_DATA
const wordsDataContent = fs.readFileSync(WORDS_DATA_PATH, 'utf8');
const existingMatch = wordsDataContent.match(/const WORDS_DATA = \[(.*?)\];/s);
let allWords = [];
eval('allWords = [' + existingMatch[1] + '];');
console.log(`📦 Mevcut veritabanında ${allWords.length} kelime var.`);

// Enrich any words missing Turkish meanings
let enrichedMeaningsCount = 0;
allWords.forEach(w => {
  const norm = w.en.toLowerCase().trim();
  if ((!w.tr || w.tr.trim() === '') && MISSING_TR_LOOKUP[norm]) {
    w.tr = MISSING_TR_LOOKUP[norm];
    enrichedMeaningsCount++;
  }
});
if (enrichedMeaningsCount > 0) {
  console.log(`✨ ${enrichedMeaningsCount} kelimenin Türkçe anlamı başarıyla tamamlandı.`);
}

const finalWordsList = allWords;
const totalDays = Math.max(...finalWordsList.map(w => w.day));
console.log(`🎉 Toplam Kelime Sayısı: ${finalWordsList.length}`);
console.log(`📅 Toplam Günlük Döngü: ${totalDays} Gün`);

// 6. Generate updated words-data.js
const wordsDataHeader = `/**
 * 5. Sınıf İngilizce Maarif Modeli & CEFR Kelime Veritabanı
 * Toplam: ${finalWordsList.length} Benzersiz Kelime (8 Maarif Teması, CEFR Seviyeleri, ${totalDays} Günlük Döngü)
 */
const THEMES_DATA = {
  "1": {
    "num": 1,
    "code": "THEME 1",
    "title": "SCHOOL LIFE",
    "titleTr": "Okul Yaşamı",
    "full": "THEME 1: SCHOOL LIFE",
    "color": "#1e3a8a",
    "badgeBg": "#1d4ed8",
    "border": "#3b82f6"
  },
  "2": {
    "num": 2,
    "code": "THEME 2",
    "title": "CLASSROOM LIFE",
    "titleTr": "Sınıf Yaşamı",
    "full": "THEME 2: CLASSROOM LIFE",
    "color": "#0f766e",
    "badgeBg": "#0d9488",
    "border": "#14b8a6"
  },
  "3": {
    "num": 3,
    "code": "THEME 3",
    "title": "PERSONAL LIFE",
    "titleTr": "Kişisel Yaşam",
    "full": "THEME 3: PERSONAL LIFE",
    "color": "#b45309",
    "badgeBg": "#d97706",
    "border": "#f59e0b"
  },
  "4": {
    "num": 4,
    "code": "THEME 4",
    "title": "FAMILY LIFE",
    "titleTr": "Aile Yaşamı",
    "full": "THEME 4: FAMILY LIFE",
    "color": "#be123c",
    "badgeBg": "#e11d48",
    "border": "#f43f5e"
  },
  "5": {
    "num": 5,
    "code": "THEME 5",
    "title": "LIFE IN THE NEIGHBOURHOOD AND CITY",
    "titleTr": "Mahalle ve Şehirde Yaşam",
    "full": "THEME 5: LIFE IN THE NEIGHBOURHOOD AND CITY",
    "color": "#4338ca",
    "badgeBg": "#4f46e5",
    "border": "#6366f1"
  },
  "6": {
    "num": 6,
    "code": "THEME 6",
    "title": "LIFE IN THE WORLD",
    "titleTr": "Dünyada Yaşam — Beslenme & Kültür",
    "full": "THEME 6: LIFE IN THE WORLD",
    "color": "#15803d",
    "badgeBg": "#16a34a",
    "border": "#22c55e"
  },
  "7": {
    "num": 7,
    "code": "THEME 7",
    "title": "LIFE IN NATURE",
    "titleTr": "Doğada Yaşam — Hayvanlar, Bitkiler & Çevre",
    "full": "THEME 7: LIFE IN NATURE",
    "color": "#047857",
    "badgeBg": "#059669",
    "border": "#10b981"
  },
  "8": {
    "num": 8,
    "code": "THEME 8",
    "title": "LIFE IN THE UNIVERSE AND FUTURE",
    "titleTr": "Evrende ve Gelecekte Yaşam & İleri Kavramlar",
    "full": "THEME 8: LIFE IN THE UNIVERSE AND FUTURE",
    "color": "#6b21a8",
    "badgeBg": "#9333ea",
    "border": "#a855f7"
  }
};

const WORDS_DATA = ${JSON.stringify(finalWordsList, null, 2)};
`;

fs.writeFileSync(WORDS_DATA_PATH, wordsDataHeader, 'utf8');
console.log(`✅ words-data.js güncellendi (${finalWordsList.length} kelime).`);

// 7. Generate updated otomasyon/kelimeler_havuzu.json
const poolData = finalWordsList.map(w => ({
  no: w.no,
  cat: w.cat,
  en: w.en,
  tr: w.tr,
  desc: w.desc,
  cefr: w.cefr,
  themeNum: w.themeNum,
  themeCode: w.themeCode,
  synonym: w.synonym || '',
  example: w.example || ''
}));

fs.writeFileSync(KELIMELER_HAVUZU_PATH, JSON.stringify(poolData, null, 2), 'utf8');
console.log(`✅ otomasyon/kelimeler_havuzu.json güncellendi (${poolData.length} kelime).`);

// 8. Automatically rebuild single-file offline web app bundle
const indexHtml = fs.readFileSync(path.join(LEARNISH_DIR, 'index.html'), 'utf8');
const appCss = fs.readFileSync(path.join(LEARNISH_DIR, 'app.css'), 'utf8');
const appJs = fs.readFileSync(path.join(LEARNISH_DIR, 'app.js'), 'utf8');
const updatedWordsData = fs.readFileSync(WORDS_DATA_PATH, 'utf8');

let bundleHtml = indexHtml.replace('<link rel="stylesheet" href="app.css">', '<style>\n' + appCss + '\n</style>');
bundleHtml = bundleHtml.replace(
  '<script src="words-data.js"></script>\n  <script src="app.js"></script>',
  '<script>\n' + updatedWordsData + '\n</script>\n<script>\n' + appJs + '\n</script>'
);
fs.writeFileSync(path.join(LEARNISH_DIR, 'Learnish_Tek_Dosya_Web_App.html'), bundleHtml, 'utf8');
console.log(`✅ Learnish_Tek_Dosya_Web_App.html tek dosya uygulaması yeniden derlendi (${bundleHtml.length} byte).`);

// 9. Update Service Worker Cache Version
if (fs.existsSync(SERVICE_WORKER_PATH)) {
  let swContent = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');
  if (!swContent.includes('learnish-v2-817')) {
    swContent = swContent.replace(/const CACHE_NAME = ['"][^'"]+['"];/, "const CACHE_NAME = 'learnish-v2-817';");
    fs.writeFileSync(SERVICE_WORKER_PATH, swContent, 'utf8');
    console.log('✅ service-worker.js önbellek sürümü v2-817 olarak güncellendi.');
  }
}

// 10. Automatically commit and push to GitHub so Vercel deploys immediately
const shouldPush = process.argv.includes('--push') || process.env.AUTO_PUSH === 'true' || true;
if (shouldPush) {
  try {
    console.log('🚀 Değişiklikler otomatik olarak GitHub ve Vercel\'e gönderiliyor...');
    execSync('git add -A', { cwd: LEARNISH_DIR, stdio: 'inherit' });
    try {
      const nowStr = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
      execSync(`git commit -m "feat: 817 kelimelik veritabani ve Vercel otomatik dagitimi (${nowStr})"`, { cwd: LEARNISH_DIR, stdio: 'inherit' });
      console.log('✅ Git commit oluşturuldu.');
    } catch (commitErr) {
      console.log('ℹ️ Yeni commit gerektiren bir değişiklik yok veya değişiklikler zaten commit edilmiş.');
    }
    execSync('git push origin main', { cwd: LEARNISH_DIR, stdio: 'inherit' });
    console.log('🎉 GitHub\'a başarıyla push edildi! Vercel canlı dağıtımı otomatik olarak başladı.');
  } catch (pushErr) {
    console.error('❌ GitHub push hatası:', pushErr.message);
  }
}
