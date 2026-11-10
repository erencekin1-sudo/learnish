#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Learnish - Maarif Modeli + The Oxford 5000 + YDS/YÖKDİL (2020–2026)
Tekilleştirilmiş (Deduplicated) Birleşik Kelime Havuzu Derleyicisi
"""

import os
import sys
import re
import json
import zipfile
import xml.etree.ElementTree as ET
import fitz

BASE_DIR = '/Users/erencekin/Desktop/İntegral/Learnish'
DOCX_PATH = os.path.join(BASE_DIR, 'belgeler', 'The Oxford 5000 - word.docx')
CEFR_JSON_PATH = os.path.join(BASE_DIR, 'belgeler', 'oxford_5000_cefr.json')
WORDS_DATA_JS_PATH = os.path.join(BASE_DIR, 'words-data.js')
KELIMELER_HAVUZU_PATH = os.path.join(BASE_DIR, 'belgeler', 'kelimeler_havuzu.json')
SERVICE_WORKER_PATH = os.path.join(BASE_DIR, 'service-worker.js')
SINGLE_HTML_PATH = os.path.join(BASE_DIR, 'Learnish_Tek_Dosya_Web_App.html')
YDS_PDF_PATH = os.path.join(BASE_DIR, 'belgeler', 'YDS İngilizce 2020–2026 Kelime ve Kalıp Tabloları.pdf')

def log(msg):
    print(f"[Learnish Builder] {msg}")

def merge_tr(existing_tr, new_tr):
    """Combine Turkish translations cleanly without repetition."""
    if not new_tr:
        return existing_tr or ''
    if not existing_tr:
        return new_tr.strip()
    
    parts = [p.strip() for p in re.split(r'[;,/]\s*', existing_tr) if p.strip()]
    new_parts = [p.strip() for p in re.split(r'[;,/]\s*', new_tr) if p.strip()]
    
    merged = list(parts)
    for np in new_parts:
        if not any(np.lower() == p.lower() for p in merged):
            merged.append(np)
    return '; '.join(merged[:4])

def merge_desc(existing_desc, new_desc):
    """Combine POS/description tags without repetition."""
    if not new_desc or new_desc.lower() in (existing_desc or '').lower():
        return existing_desc or new_desc or ''
    if not existing_desc:
        return new_desc
    return f"{existing_desc} / {new_desc}"

# 1. Load Maarif words from existing words-data.js or kelimeler_havuzu.json
def load_maarif_words():
    log("Mevcut 5. Sınıf Maarif Modeli kelimeleri okunuyor...")
    maarif_raw = []
    if os.path.exists(WORDS_DATA_JS_PATH):
        with open(WORDS_DATA_JS_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        m = re.search(r'const WORDS_DATA = (\[[\s\S]*?\]);', content)
        if m:
            try:
                data = json.loads(m.group(1))
                maarif_raw = [w for w in data if w.get('id', 0) <= 817 or w.get('dataset') == 'maarif' or w.get('isMaarif')]
            except Exception as e:
                log(f"Uyarı: words-data.js okunamadı ({e})")

    if not maarif_raw and os.path.exists(KELIMELER_HAVUZU_PATH):
        with open(KELIMELER_HAVUZU_PATH, 'r', encoding='utf-8') as f:
            pool = json.load(f)
            maarif_raw = [w for w in pool if w.get('dataset') == 'maarif' or w.get('no', 0) <= 817]

    log(f"✅ {len(maarif_raw)} adet ham Maarif kaydı bulundu.")
    return maarif_raw

# 2. Parse The Oxford 5000 docx
def parse_oxford_docx():
    log(f"Oxford 5000 Word belgesi işleniyor: {DOCX_PATH}")
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

        for full_t, m_t, colors, italic in p_list:
            if not phonetic and full_t.startswith('/'):
                pm = re.match(r'^(/[^/]+/)\s*(.*)', full_t)
                phonetic = pm.group(1).strip() if pm else full_t.split('/')[1]
                continue
            
            if m_t:
                is_pure_maroon = len(m_t) >= len(full_t) * 0.75
                is_example_tr = bool(re.match(r'^(O |Sen |Ben |Biz |Siz |Onlar |‘|\")', full_t)) or (full_t.endswith('.') and len(full_t) > 35)
                if is_pure_maroon and not is_example_tr:
                    clean_d = re.sub(r'^\d+\s*', '', m_t).strip(' .,;')
                    if clean_d and clean_d not in tr_definitions:
                        tr_definitions.append(clean_d)
                elif not tr_definitions and is_pure_maroon:
                    tr_definitions.append(m_t)
            
            if italic and not m_t and len(full_t) > 15 and not full_t.startswith('/'):
                if not examples:
                    examples.append(full_t)

        cefr_obj = cefr_by_word_type.get((clean_w.lower(), pos_raw)) or cefr_by_word.get(clean_w.lower(), {})
        cefr_level = cefr_obj.get('cefr', '').upper() or 'B1'
        def_en = cefr_obj.get('definition', '')
        ex_en = cefr_obj.get('example', '') or (examples[0] if examples else '')

        final_tr = '; '.join(tr_definitions[:3])
        if not final_tr:
            all_m = [p[1] for p in p_list if p[1]]
            final_tr = '; '.join(all_m[:2]) if all_m else clean_w

        oxford_words.append({
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
            'dataset': 'oxford',
            'phonetic': phonetic,
            'definition': def_en,
            'example': ex_en,
            'synonym': ''
        })

    log(f"✅ {len(oxford_words)} adet Oxford 5000 girdisi ayrıştırıldı.")
    return oxford_words

# 3. Parse YDS/YÖKDİL 2020-2026 PDF (all 9 tables)
def parse_yds_pdf():
    log(f"YDS & YÖKDİL Tabloları PDF işleniyor: {YDS_PDF_PATH}")
    if not os.path.exists(YDS_PDF_PATH):
        log(f"Hata: {YDS_PDF_PATH} bulunamadı!")
        return []

    doc = fitz.open(YDS_PDF_PATH)
    sections_def = [
        (1, 'İsim, Sıfat ve Zarf', 4, 191),
        (2, 'Fiiller', 191, 246),
        (3, 'Edatlı Fiiller', 246, 254),
        (4, 'Phrasal Verbs', 254, 259),
        (5, 'Edat Alan Sıfat ve İsimler', 259, 266),
        (6, 'Edatlar', 266, 272),
        (7, 'Bağlaçlar ve Geçiş İfadeleri', 272, 277),
        (8, 'Eşdizimler (Collocations)', 277, 286),
        (9, 'Fiil Tamamlama Kalıpları', 286, 292),
    ]

    sec_desc_map = {
        1: 'Akademik Sözcük',
        2: 'Akademik Fiil (Verb)',
        3: 'Edatlı Fiil (Prep. Verb)',
        4: 'Phrasal Verb (Deyimsel Fiil)',
        5: 'Edat Alan Sözcük (Collocation)',
        6: 'Edat (Preposition)',
        7: 'Bağlaç & Geçiş İfadesi',
        8: 'Akademik Eşdizim (Collocation)',
        9: 'Fiil Tamamlama Kalıbı'
    }

    yds_items = []
    for sec_id, sec_name, start_p, end_p in sections_def:
        count_sec = 0
        for pno in range(start_p, end_p):
            page = doc[pno]
            words = page.get_text('words')
            min_y = 112 if pno == start_p else 70
            body_words = [w for w in words if min_y <= w[1] <= 555]
            
            sira_anchors = [(int(w[4]), w[1], w[3]) for w in body_words if w[2] <= 63 and w[4].isdigit()]
            sira_anchors.sort(key=lambda a: a[1])

            for i, (num, y0, y1) in enumerate(sira_anchors):
                next_y0 = sira_anchors[i+1][1] if i + 1 < len(sira_anchors) else 555
                row_words = [w for w in body_words if y0 - 2 <= w[1] < next_y0 - 2]
                
                if sec_id == 1:
                    en_words = [w[4] for w in row_words if 63 <= w[0] < 155]
                    pos_words = [w[4] for w in row_words if 155 <= w[0] < 189]
                    tr_words = [w[4] for w in row_words if 189 <= w[0] < 340]
                    stats_words = [w[4] for w in row_words if 340 <= w[0] < 570]
                    ex_words = [w[4] for w in row_words if w[0] >= 570]
                    pos_raw = ' '.join(pos_words).strip()
                elif sec_id == 7:
                    en_words = [w[4] for w in row_words if 63 <= w[0] < 163]
                    tr_words = [w[4] for w in row_words if 163 <= w[0] < 283]
                    pos_words = [w[4] for w in row_words if 283 <= w[0] < 367]
                    stats_words = [w[4] for w in row_words if 367 <= w[0] < 597]
                    ex_words = [w[4] for w in row_words if w[0] >= 597]
                    pos_raw = ' '.join(pos_words).strip()
                else:
                    en_words = [w[4] for w in row_words if 63 <= w[0] < 181]
                    tr_words = [w[4] for w in row_words if 181 <= w[0] < 353]
                    stats_words = [w[4] for w in row_words if 353 <= w[0] < 583]
                    ex_words = [w[4] for w in row_words if w[0] >= 583]
                    pos_raw = 'fiil' if sec_id == 2 else ('edat' if sec_id == 6 else 'kalıp')

                en = ' '.join(en_words).strip()
                tr = ' '.join(tr_words).strip()
                ex = ' '.join(ex_words).strip()
                stats = ' '.join(stats_words).strip()

                if not en:
                    continue

                desc = f"{pos_raw.capitalize() if pos_raw else sec_desc_map[sec_id]}"
                cefr = 'C1' if sec_id in [4, 7, 8, 9] else 'B2'

                yds_items.append({
                    'en': en,
                    'tr': tr,
                    'desc': desc,
                    'pos': pos_raw or 'kalıp',
                    'cefr': cefr,
                    'cat': f'YDS & YÖKDİL ({sec_name})',
                    'themeNum': 10,
                    'themeCode': 'YDS/YÖKDİL',
                    'themeTitle': 'YDS & YÖKDİL AKADEMİK',
                    'themeTitleTr': 'YDS & YÖKDİL Akademik Sınav Hazırlık (2020–2026)',
                    'dataset': 'yds',
                    'datasets': ['yds'],
                    'isMaarif': False,
                    'isOxford': False,
                    'isYds': True,
                    'ydsStats': stats,
                    'ydsExample': ex,
                    'ydsSection': sec_id,
                    'ydsSira': num,
                    'phonetic': '',
                    'definition': tr,
                    'example': ex,
                    'synonym': ''
                })
                count_sec += 1
        log(f"  Tablo {sec_id} ({sec_name}): {count_sec} madde okundu.")

    log(f"✅ Toplam {len(yds_items)} YDS & YÖKDİL maddesi başarıyla ayrıştırıldı.")
    return yds_items

# 4. Build deduplicated master database
def build_combined_database():
    maarif_words = load_maarif_words()
    oxford_words = parse_oxford_docx()
    yds_words = parse_yds_pdf()

    pool_dict = {}

    # Step 1: Add Maarif words
    for w in maarif_words:
        clean_en = w['en'].strip().lower()
        if clean_en in pool_dict:
            entry = pool_dict[clean_en]
            entry['tr'] = merge_tr(entry.get('tr', ''), w.get('tr', ''))
            entry['desc'] = merge_desc(entry.get('desc', ''), w.get('desc', ''))
        else:
            entry = dict(w)
            entry['dataset'] = 'maarif'
            entry['isMaarif'] = True
            entry['isOxford'] = False
            entry['isYds'] = False
            entry['datasets'] = ['maarif']
            pool_dict[clean_en] = entry

    log(f"✅ Maarif tekilleştirildi: {len(pool_dict)} benzersiz kelime.")

    # Step 2: Merge Oxford words
    for w in oxford_words:
        clean_en = w['en'].strip().lower()
        if clean_en in pool_dict:
            entry = pool_dict[clean_en]
            entry['isOxford'] = True
            if 'oxford' not in entry['datasets']:
                entry['datasets'].append('oxford')
            entry['tr'] = merge_tr(entry.get('tr', ''), w.get('tr', ''))
            entry['desc'] = merge_desc(entry.get('desc', ''), w.get('desc', ''))
            if not entry.get('phonetic') and w.get('phonetic'):
                entry['phonetic'] = w['phonetic']
            if not entry.get('definition') and w.get('definition'):
                entry['definition'] = w['definition']
            if not entry.get('example') and w.get('example'):
                entry['example'] = w['example']
            if not entry.get('cefr') and w.get('cefr'):
                entry['cefr'] = w['cefr']
        else:
            entry = dict(w)
            entry['dataset'] = 'oxford'
            entry['isMaarif'] = False
            entry['isOxford'] = True
            entry['isYds'] = False
            entry['datasets'] = ['oxford']
            pool_dict[clean_en] = entry

    log(f"✅ Oxford birleştirildi: Toplam {len(pool_dict)} benzersiz kelime.")

    # Step 3: Merge YDS words
    for w in yds_words:
        clean_en = w['en'].strip().lower()
        if clean_en in pool_dict:
            entry = pool_dict[clean_en]
            entry['isYds'] = True
            if 'yds' not in entry['datasets']:
                entry['datasets'].append('yds')
            entry['tr'] = merge_tr(entry.get('tr', ''), w.get('tr', ''))
            if not entry.get('ydsStats') and w.get('ydsStats'):
                entry['ydsStats'] = w['ydsStats']
            if not entry.get('ydsExample') and w.get('ydsExample'):
                entry['ydsExample'] = w['ydsExample']
            if not entry.get('example') and w.get('ydsExample'):
                entry['example'] = w['ydsExample']
            if not entry.get('cefr'):
                entry['cefr'] = w.get('cefr', 'B2')
        else:
            entry = dict(w)
            pool_dict[clean_en] = entry

    log(f"✅ YDS birleştirildi: Havuzda toplam {len(pool_dict)} benzersiz kelime/kalıp!")

    # Assign sequential IDs and Days
    combined_words = list(pool_dict.values())
    
    # Sort order: Maarif words first, then Oxford words, then new YDS expressions
    def sort_key(item):
        is_m = 0 if item.get('isMaarif') else 1
        is_o = 0 if item.get('isOxford') else 1
        theme = item.get('themeNum', 99)
        orig_no = item.get('no', 999999)
        return (is_m, is_o, theme, orig_no, item.get('en', '').lower())

    combined_words.sort(key=sort_key)

    # Assign days for Maarif, Oxford, YDS tracks
    m_idx = 0
    o_idx = 0
    y_idx = 0
    for idx, w in enumerate(combined_words, 1):
        w['id'] = idx
        w['no'] = idx
        
        # Primary day assignment
        if w.get('isMaarif'):
            m_idx += 1
            w['day'] = ((m_idx - 1) // 10) + 1
        elif w.get('isYds') and not w.get('isOxford'):
            y_idx += 1
            w['day'] = ((y_idx - 1) // 20) + 1
        else:
            o_idx += 1
            w['day'] = ((o_idx - 1) // 25) + 1

    # Verify no duplicates
    all_en = [w['en'].strip().lower() for w in combined_words]
    assert len(all_en) == len(set(all_en)), "Kritik Hata: Havuzda mükerrer kelimeler tespit edildi!"
    log(f"🌟 Sıfır Tekrar Doğrulandı: Tüm {len(combined_words)} kelime ve kalıp tekilleştirildi.")

    maarif_total = sum(1 for w in combined_words if w.get('isMaarif'))
    oxford_total = sum(1 for w in combined_words if w.get('isOxford'))
    yds_total = sum(1 for w in combined_words if w.get('isYds'))

    log(f"📊 Dağılım: Maarif={maarif_total:,} | Oxford={oxford_total:,} | YDS={yds_total:,} | Genel Toplam={len(combined_words):,}")

    # Write words-data.js
    themes_js = """/**
 * Learnish - Maarif Modeli, The Oxford 5000 ve YDS/YÖKDİL Birleşik Kelime Veritabanı
 * Toplam: %d Benzersiz Kelime ve Kalıp (Maarif: %d, Oxford: %d, YDS: %d)
 * Sıfır Tekrar: Her ifade sözlükte tam olarak tek bir zenginleştirilmiş kayıt olarak yer alır.
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
  },
  "10": {
    "num": 10,
    "code": "YDS/YÖKDİL",
    "title": "YDS & YÖKDİL AKADEMİK",
    "titleTr": "YDS & YÖKDİL Akademik Sınav Hazırlık (2020–2026)",
    "full": "YDS & YÖKDİL AKADEMİK (B2-C1)",
    "color": "#7c3aed",
    "badgeBg": "#8b5cf6",
    "border": "#a78bfa"
  }
};

const WORDS_DATA = %s;
""" % (len(combined_words), maarif_total, oxford_total, yds_total, json.dumps(combined_words, ensure_ascii=False, indent=2))

    with open(WORDS_DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(themes_js)
    log(f"✅ {WORDS_DATA_JS_PATH} dosyası güncellendi ({len(combined_words)} kelime).")

    # Write kelimeler_havuzu.json
    pool_records = []
    for w in combined_words:
        pool_records.append({
            'no': w.get('no'),
            'id': w.get('id'),
            'en': w.get('en', ''),
            'tr': w.get('tr', ''),
            'desc': w.get('desc', ''),
            'pos': w.get('pos', ''),
            'cefr': w.get('cefr', ''),
            'cat': w.get('cat', ''),
            'themeNum': w.get('themeNum', 1),
            'themeCode': w.get('themeCode', ''),
            'dataset': w.get('dataset', 'maarif'),
            'datasets': w.get('datasets', []),
            'isMaarif': w.get('isMaarif', False),
            'isOxford': w.get('isOxford', False),
            'isYds': w.get('isYds', False),
            'phonetic': w.get('phonetic', ''),
            'example': w.get('example', ''),
            'definition': w.get('definition', ''),
            'ydsStats': w.get('ydsStats', ''),
            'ydsExample': w.get('ydsExample', ''),
            'day': w.get('day', 1)
        })

    with open(KELIMELER_HAVUZU_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool_records, f, ensure_ascii=False, indent=2)
    log(f"✅ {KELIMELER_HAVUZU_PATH} dosyası güncellendi ({len(pool_records)} kelime).")

    # Update service-worker.js version
    if os.path.exists(SERVICE_WORKER_PATH):
        with open(SERVICE_WORKER_PATH, 'r', encoding='utf-8') as f:
            sw_text = f.read()
        sw_text = re.sub(r"const CACHE_NAME = ['\"][^'\"]+['\"];", "const CACHE_NAME = 'learnish-v6-unified-pool';", sw_text)
        with open(SERVICE_WORKER_PATH, 'w', encoding='utf-8') as f:
            f.write(sw_text)
        log("✅ service-worker.js önbellek sürümü v6-unified-pool olarak güncellendi.")

    # Rebuild Learnish_Tek_Dosya_Web_App.html
    log("Learnish_Tek_Dosya_Web_App.html tek dosya uygulaması derleniyor...")
    with open(os.path.join(BASE_DIR, 'index.html'), 'r', encoding='utf-8') as f:
        index_html = f.read()
    with open(os.path.join(BASE_DIR, 'app.css'), 'r', encoding='utf-8') as f:
        app_css = f.read()
    with open(os.path.join(BASE_DIR, 'app.js'), 'r', encoding='utf-8') as f:
        app_js = f.read()

    bundle_html = re.sub(
        r'<link rel="stylesheet" href="app\.css.*?">',
        lambda _: f'<style>\n{app_css}\n</style>',
        index_html
    )
    bundle_html = re.sub(
        r'<script src="words-data\.js.*?"></script>\s*<script src="app\.js.*?"></script>',
        lambda _: f'<script>\n{themes_js}\n</script>\n<script>\n{app_js}\n</script>',
        bundle_html
    )

    with open(SINGLE_HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(bundle_html)
    log(f"✅ Learnish_Tek_Dosya_Web_App.html derlendi ({len(bundle_html):,} byte).")

if __name__ == '__main__':
    build_combined_database()
