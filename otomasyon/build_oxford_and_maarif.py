#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Learnish - Maarif Modeli (817 Kelime) + The Oxford 5000 (5,841 Kelime)
Birleşik Veritabanı Derleyicisi
"""

import os
import sys
import re
import json
import zipfile
import xml.etree.ElementTree as ET

BASE_DIR = '/Users/erencekin/Desktop/İntegral/Learnish'
DOCX_PATH = os.path.join(BASE_DIR, 'belgeler', 'The Oxford 5000 - word.docx')
CEFR_JSON_PATH = os.path.join(BASE_DIR, 'otomasyon', 'oxford_5000_cefr.json')
WORDS_DATA_JS_PATH = os.path.join(BASE_DIR, 'words-data.js')
KELIMELER_HAVUZU_PATH = os.path.join(BASE_DIR, 'otomasyon', 'kelimeler_havuzu.json')
SERVICE_WORKER_PATH = os.path.join(BASE_DIR, 'service-worker.js')
SINGLE_HTML_PATH = os.path.join(BASE_DIR, 'Learnish_Tek_Dosya_Web_App.html')

def log(msg):
    print(f"[Learnish Builder] {msg}")

# 1. Load existing Maarif words from words-data.js or Notion
def load_maarif_words():
    log("Mevcut 5. Sınıf Maarif Modeli kelimeleri okunuyor...")
    with open(WORDS_DATA_JS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract existing WORDS_DATA array
    m = re.search(r'const WORDS_DATA = (\[[\s\S]*?\]);\s*$', content)
    if not m:
        m = re.search(r'const WORDS_DATA = (\[[\s\S]*?\]);', content)
    
    if m:
        try:
            data = json.loads(m.group(1))
            # Keep only original maarif words (id <= 817 or dataset == 'maarif')
            maarif = [w for w in data if w.get('id', 0) <= 817 or w.get('dataset') == 'maarif']
            for w in maarif:
                w['dataset'] = 'maarif'
            log(f"✅ {len(maarif)} adet Maarif kelimesi korundu.")
            return maarif
        except Exception as e:
            log(f"Uyarı: JSON parse hatası ({e}), regex ile yükleme deneniyor...")

    # Fallback to kelimeler_havuzu.json
    if os.path.exists(KELIMELER_HAVUZU_PATH):
        with open(KELIMELER_HAVUZU_PATH, 'r', encoding='utf-8') as f:
            pool = json.load(f)
            maarif = []
            for w in pool[:817]:
                w['dataset'] = 'maarif'
                w['id'] = w.get('no', len(maarif) + 1)
                w['day'] = ((w['id'] - 1) // 10) + 1
                maarif.append(w)
            return maarif

    return []

# 2. Parse The Oxford 5000 docx
def parse_oxford_docx():
    log(f"Oxford 5000 Word belgesi işleniyor: {DOCX_PATH}")
    
    # Load CEFR reference
    cefr_by_word_type = {}
    cefr_by_word = {}
    if os.path.exists(CEFR_JSON_PATH):
        with open(CEFR_JSON_PATH, 'r', encoding='utf-8') as f:
            cdata = json.load(f)
            for k, v in cdata.items():
                w = v.get('word', '').lower().strip()
                t = v.get('type', '').lower().strip()
                cefr_by_word_type[(w, t)] = v
                if w not in cefr_by_word:
                    cefr_by_word[w] = v

    with zipfile.ZipFile(DOCX_PATH) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paras = root.findall('.//w:p', namespaces)

    log(f"Toplam {len(paras)} paragraf okundu. Başlıklar ve anlamlar ayrıştırılıyor...")

    def para_info(p):
        runs = p.findall('.//w:r', namespaces)
        colors = set()
        full_text = []
        maroon_text = []
        has_italic = False
        for r in runs:
            rPr = r.find('.//w:rPr', namespaces)
            c = ''
            if rPr is not None:
                c_tag = rPr.find('.//w:color', namespaces)
                if c_tag is not None:
                    c = c_tag.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '').upper()
                if rPr.find('.//w:i', namespaces) is not None:
                    has_italic = True
            txt = ''.join([n.text for n in r.findall('.//w:t', namespaces) if n.text])
            if txt:
                full_text.append(txt)
                if c == '950019':
                    maroon_text.append(txt)
                if c:
                    colors.add(c)
        
        pPr = p.find('.//w:pPr', namespaces)
        pStyle = pPr.find('.//w:pStyle', namespaces) if pPr is not None else None
        style = pStyle.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '') if pStyle is not None else ''
        
        return style, ''.join(full_text).strip(), ''.join(maroon_text).strip(), colors, has_italic

    entries = []
    curr_hw = None
    curr_paras = []
    for p in paras:
        style, t, m_t, colors, italic = para_info(p)
        if 'Balk1' in style or 'Heading1' in style:
            if curr_hw:
                entries.append((curr_hw, curr_paras))
            curr_hw = t
            curr_paras = []
        elif curr_hw and t:
            curr_paras.append((t, m_t, colors, italic))
    if curr_hw:
        entries.append((curr_hw, curr_paras))

    pos_map = {
        'verb': 'Fiil (Verb)',
        'noun': 'İsim (Noun)',
        'adjective': 'Sıfat (Adjective)',
        'adverb': 'Zarf (Adverb)',
        'preposition': 'Edat (Preposition)',
        'conjunction': 'Bağlaç (Conjunction)',
        'pronoun': 'Zamir (Pronoun)',
        'determiner': 'Belirteç (Determiner)',
        'indefinite article': 'Tanımlık (Article)',
        'definite article': 'Tanımlık (Article)',
        'modal verb': 'Yardımcı Fiil (Modal)',
        'auxiliary verb': 'Yardımcı Fiil',
        'number': 'Sayı (Number)',
        'exclamation': 'Ünlem (Exclamation)'
    }

    oxford_words = []
    
    for idx, (hw, p_list) in enumerate(entries, 1):
        m = re.match(r'^(.+?)\s*\((.*?)\)$', hw)
        word_raw = m.group(1).strip() if m else hw.strip()
        clean_w = re.sub(r'\[.*?\]', '', word_raw).strip()
        pos_raw = m.group(2).strip().lower() if m else ''
        desc = pos_map.get(pos_raw, pos_raw.capitalize() if pos_raw else 'Kelime')

        tr_definitions = []
        examples = []
        phonetic = ''

        for i, (full_t, m_t, colors, italic) in enumerate(p_list):
            if not phonetic and full_t.startswith('/'):
                pm = re.match(r'^(/[^/]+/)\s*(.*)', full_t)
                phonetic = pm.group(1).strip() if pm else full_t.split('/')[1]
                continue
            
            # Maroon text indicates Turkish definition or translation
            if m_t:
                is_pure_maroon = len(m_t) >= len(full_t) * 0.75
                # Filter out obvious full example sentences
                is_example_tr = bool(re.match(r'^(O |Sen |Ben |Biz |Siz |Onlar |‘|\")', full_t)) or (full_t.endswith('.') and len(full_t) > 35)
                
                if is_pure_maroon and not is_example_tr:
                    clean_d = re.sub(r'^\d+\s*', '', m_t).strip(' .,;')
                    if clean_d and clean_d not in tr_definitions:
                        tr_definitions.append(clean_d)
                elif not tr_definitions and is_pure_maroon:
                    tr_definitions.append(m_t)
            
            # Example sentence
            if italic and not m_t and len(full_t) > 15 and not full_t.startswith('/'):
                if not examples:
                    examples.append(full_t)

        # CEFR lookup
        cefr_obj = cefr_by_word_type.get((clean_w.lower(), pos_raw)) or cefr_by_word.get(clean_w.lower(), {})
        cefr_level = cefr_obj.get('cefr', '').upper() or 'B1'
        def_en = cefr_obj.get('definition', '')
        ex_en = cefr_obj.get('example', '') or (examples[0] if examples else '')

        # Clean Turkish meanings
        final_tr = '; '.join(tr_definitions[:3])
        if not final_tr:
            # Fallback to any maroon text
            all_m = [p[1] for p in p_list if p[1]]
            final_tr = '; '.join(all_m[:2]) if all_m else clean_w

        # Assign Day (10 words per day: 1 to 585)
        day_num = ((idx - 1) // 10) + 1

        oxford_words.append({
            'id': 1000 + idx,
            'no': 817 + idx,
            'en': clean_w,
            'tr': final_tr,
            'desc': desc,
            'pos': pos_raw,
            'cefr': cefr_level,
            'cat': f"The Oxford 5000 ({cefr_level})",
            'themeNum': 9,
            'themeCode': 'OXFORD 5000',
            'themeTitle': 'THE OXFORD 5000',
            'themeTitleTr': 'Oxford 5000 Kelime Hazinesi',
            'day': day_num,
            'dataset': 'oxford',
            'phonetic': phonetic,
            'definition': def_en,
            'example': ex_en,
            'synonym': ''
        })

    log(f"✅ {len(oxford_words)} adet Oxford 5000 kelimesi başarıyla ayrıştırıldı.")
    return oxford_words

def build_combined_database():
    maarif_words = load_maarif_words()
    oxford_words = parse_oxford_docx()
    
    combined_words = maarif_words + oxford_words
    log(f"🌟 Birleşik kelime havuzu: {len(combined_words)} kelime (Maarif: {len(maarif_words)}, Oxford: {len(oxford_words)})")

    # 3. Create updated words-data.js
    themes_js = """/**
 * Learnish - 5. Sınıf Maarif Modeli & The Oxford 5000 Birleşik Kelime Veritabanı
 * Toplam: %d Kelime (817 Maarif + %d Oxford 5000)
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
  },
  "9": {
    "num": 9,
    "code": "OXFORD 5000",
    "title": "THE OXFORD 5000",
    "titleTr": "The Oxford 5000 (A1-C1 Dünya Standardı)",
    "full": "THE OXFORD 5000 (A1-C1)",
    "color": "#0284c7",
    "badgeBg": "#0284c7",
    "border": "#38bdf8"
  }
};

const WORDS_DATA = %s;
""" % (len(combined_words), len(oxford_words), json.dumps(combined_words, ensure_ascii=False, indent=2))

    with open(WORDS_DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(themes_js)
    log(f"✅ {WORDS_DATA_JS_PATH} dosyası güncellendi ({len(combined_words)} kelime).")

    # 4. Create updated otomasyon/kelimeler_havuzu.json
    pool_records = []
    for w in combined_words:
        pool_records.append({
            'no': w.get('no'),
            'cat': w.get('cat', ''),
            'en': w.get('en', ''),
            'tr': w.get('tr', ''),
            'desc': w.get('desc', ''),
            'cefr': w.get('cefr', ''),
            'themeNum': w.get('themeNum', 1),
            'themeCode': w.get('themeCode', ''),
            'dataset': w.get('dataset', 'maarif'),
            'phonetic': w.get('phonetic', ''),
            'example': w.get('example', '')
        })

    with open(KELIMELER_HAVUZU_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool_records, f, ensure_ascii=False, indent=2)
    log(f"✅ {KELIMELER_HAVUZU_PATH} dosyası güncellendi ({len(pool_records)} kelime).")

    # 5. Update service-worker.js version
    if os.path.exists(SERVICE_WORKER_PATH):
        with open(SERVICE_WORKER_PATH, 'r', encoding='utf-8') as f:
            sw_text = f.read()
        sw_text = re.sub(r"const CACHE_NAME = ['\"][^'\"]+['\"];", "const CACHE_NAME = 'learnish-v4-oxford5000';", sw_text)
        with open(SERVICE_WORKER_PATH, 'w', encoding='utf-8') as f:
            f.write(sw_text)
        log("✅ service-worker.js önbellek sürümü v4-oxford5000 olarak güncellendi.")

    # 6. Rebuild Learnish_Tek_Dosya_Web_App.html
    log("Learnish_Tek_Dosya_Web_App.html tek dosya uygulaması derleniyor...")
    with open(os.path.join(BASE_DIR, 'index.html'), 'r', encoding='utf-8') as f:
        index_html = f.read()
    with open(os.path.join(BASE_DIR, 'app.css'), 'r', encoding='utf-8') as f:
        app_css = f.read()
    with open(os.path.join(BASE_DIR, 'app.js'), 'r', encoding='utf-8') as f:
        app_js = f.read()

    bundle_html = index_html.replace(
        '<link rel="stylesheet" href="app.css">',
        f'<style>\n{app_css}\n</style>'
    )
    bundle_html = bundle_html.replace(
        '<script src="words-data.js?v=817"></script>\n  <script src="app.js?v=817"></script>',
        f'<script>\n{themes_js}\n</script>\n<script>\n{app_js}\n</script>'
    )
    # Also handle standard script tag without version query
    bundle_html = re.sub(
        r'<script src="words-data\.js.*?"></script>\s*<script src="app\.js.*?"></script>',
        f'<script>\n{themes_js}\n</script>\n<script>\n{app_js}\n</script>',
        bundle_html
    )

    with open(SINGLE_HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(bundle_html)
    log(f"✅ Learnish_Tek_Dosya_Web_App.html derlendi ({len(bundle_html):,} byte).")

if __name__ == '__main__':
    build_combined_database()
