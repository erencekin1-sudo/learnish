#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Learnish - K-12 MEB İngilizce Müfredatı ve Yıllık Çerçeve Plan Derleyicisi
1. Sınıftan 12. Sınıfa Kadar Haftalık Planlar, Kazanımlar ve Bağlama (Context Classifier) Motoru
"""

import os
import sys
import re
import json
import zipfile
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from curriculum_dictionary_definitions import CURRICULUM_DEFINITIONS
from curriculum_extra_translations import CURRICULUM_EXTRA_TRANSLATIONS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL_PATH = os.path.join(BASE_DIR, 'belgeler', 'İNGİLİZCE (2-8. SINIF) TASLAK YILLIK ÇERÇEVE PLAN.xlsx')
DOCX_PLAN_DIR = os.path.join(BASE_DIR, 'belgeler', 'yillik-planlar')
OUTPUT_JS_PATH = os.path.join(BASE_DIR, 'curriculum-data.js')

# Eğitim-öğretim yılının başladığı takvim yılı (Eylül-Aralık bu yıl, Ocak-Haziran bir sonraki yıl).
# Yeni yılın planları yüklendiğinde yalnızca bu değer ve belgeler/ içindeki plan dosyaları güncellenir.
ACADEMIC_START_YEAR = 2026

# ---------------------------------------------------------------------------
# Tarih ayrıştırma (İngilizce + Türkçe ay adları): "14-18 September", "28 Aralık -1Ocak",
# "30 November - 4 December", "25 JANUARY - 5 FEBRUARY 2027"
# ---------------------------------------------------------------------------
_MONTHS = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6, 'july': 7,
    'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    'ocak': 1, 'subat': 2, 'mart': 3, 'nisan': 4, 'mayis': 5, 'haziran': 6, 'temmuz': 7,
    'agustos': 8, 'eylul': 9, 'ekim': 10, 'kasim': 11, 'aralik': 12,
}
_TR_ASCII = str.maketrans('çğıöşüÇĞİÖŞÜ', 'cgiosuCGIOSU')

def _month_num(token):
    if not token:
        return None
    t = token.translate(_TR_ASCII).lower()
    return _MONTHS.get(t)

def parse_date_range(text, start_year=ACADEMIC_START_YEAR):
    """Serbest metindeki tarih aralığını (başlangıç, bitiş) ISO tarihlerine çevirir. Bulamazsa (None, None)."""
    if not text:
        return None, None
    parts = []  # [(gün, ay|None)]
    for m in re.finditer(r'(?<!\d)(\d{1,2})(?![\d.])\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)?', text):  # "1. Dönem" sıra sayısı değil
        day = int(m.group(1))
        if not 1 <= day <= 31:
            continue
        mon = _month_num(m.group(2))
        if m.group(2) and mon is None:
            continue  # "2027", "Hafta" vb. tarih olmayan sayı
        parts.append((day, mon))
    if not parts:
        return None, None
    end_day, end_mon = parts[-1]
    start_day, start_mon = parts[0]
    end_mon = end_mon or start_mon
    start_mon = start_mon or end_mon
    if not start_mon:
        return None, None

    def iso(d, mth):
        y = start_year if mth >= 8 else start_year + 1
        return f'{y:04d}-{mth:02d}-{d:02d}'
    return iso(start_day, start_mon), iso(end_day, end_mon)

HOLIDAY_RE = re.compile(r'(BREAK|HOLIDAY|TATİL|TATIL|EID|BAYRAM)', re.IGNORECASE)

def make_holiday(text):
    """'FIRST MIDTERM BREAK (16-20 November)' → {'name','start','end','full'} (full: tüm okul haftasını kapsar)."""
    start, end = parse_date_range(text)
    if not start:
        return None
    from datetime import date
    s = date.fromisoformat(start); e = date.fromisoformat(end)
    weekdays = sum(1 for i in range((e - s).days + 1) if (s.toordinal() + i) % 7 not in (6, 0))
    is_eid = bool(re.search(r'EID|BAYRAM', text, re.IGNORECASE))
    up = text.translate(_TR_ASCII).upper()
    if 'FITR' in up or 'RAMAZAN' in up:
        name = 'Ramazan Bayramı'
    elif 'ADHA' in up or 'KURBAN' in up:
        name = 'Kurban Bayramı'
    elif 'SEMESTER' in up or 'YARIYIL' in up:
        name = 'Yarıyıl Tatili'
    elif 'MIDTERM' in up or 'ARA TATIL' in up:
        name = '1. Dönem Ara Tatili' if start[5:7] in ('10', '11', '12') else '2. Dönem Ara Tatili'
    else:
        name = clean_text(re.sub(r'[\(:].*$', '', text).strip('| ')) or clean_text(text)
    return {'name': name, 'start': start, 'end': end, 'full': (weekdays >= 5 and not is_eid)}

# ---------------------------------------------------------------------------
# Sağlam hedef kelime ayıklayıcı (planlardaki tüm biçimler: "Nouns: A gate, a lab.",
# "Countries:\nTürkiye, the UK ...", "British/English", "(trash-garbage-AmE)")
# ---------------------------------------------------------------------------
_VOCAB_LABEL_RE = re.compile(r'(?:^|(?<=[\s,.;]))[^,.;:\n]{1,70}:')
_STOP_LEADING = re.compile(r'^(a|an|the|to)\s+', re.IGNORECASE)

def _join_wrapped_lines(text):
    """Excel/Word hücrelerinde satır sonuna taşan ifadeleri birleştirir ("Religion\\nand Morals" → tek ifade),
    ama her satırı ayrı bir kelime olan listeleri ("an arm\\na head") ayrı bırakır."""
    lines = [l.strip() for l in text.split('\n')]
    out = []
    for line in lines:
        if not line:
            out.append('\n'); continue
        prev = out[-1] if out and out[-1] != '\n' else None
        if prev is not None:
            prev_open = not re.search(r'[,.;:)]\s*$', prev)
            prev_tail_fn = re.search(r'\b(a|an|the|to|and|of|or)$', prev, re.IGNORECASE)
            starts_new_item = re.match(r'^(a|an|the|to)\s', line, re.IGNORECASE) or line[:1].isupper()
            if prev_open and (prev_tail_fn or (not starts_new_item and line[:1].islower())):
                out[-1] = prev + ' ' + line
                continue
        out.append(line)
    return '\n'.join(x for x in out if x != '\n')

def extract_plan_vocab(text):
    if not text:
        return []
    m = re.search(r'Target\s+Vocabulary(.*?)(?=Target\s+Grammatical|Target\s+Language|Target\s+Social|Target\s+Phonological|Functions\s+of|\*\s*National|\*\s*Local|\Z)',
                  text, re.DOTALL | re.IGNORECASE)
    if not m:
        return []
    sec = _join_wrapped_lines(m.group(1))

    def _paren(mm):
        inner = mm.group(1)
        if re.search(r'revisional|phonetic|will not', inner, re.IGNORECASE):
            return ' '
        if re.search(r'\b(AmE|BrE|Br|Am)\b', inner):     # (trash-garbage-AmE) → , trash, garbage,
            inner = re.sub(r'[-–]?\s*\b(AmE|BrE|Br|Am)\b', '', inner)
            return ',' + ','.join(re.split(r'[-–/]', inner)) + ','
        return ',' + inner + ','                         # (England, Scotland, Northern Ireland, Wales)
    sec = re.sub(r'\(([^)]*)\)', _paren, sec)
    sec = re.sub(r'[“”"]', '', sec.replace('’', "'").replace('‘', "'"))
    sec = _VOCAB_LABEL_RE.sub(',', sec)               # "Nouns:", "Vocabulary for clothes:", "Countries:"
    words = []
    for part in re.split(r'[,;/\n]|\.(?=\s|$)|[-–]\s', sec):
        w = clean_text(part)
        w = _STOP_LEADING.sub('', w).strip(' .-–—*•')
        w = _STOP_LEADING.sub('', w)
        if not w or len(w) < 2 or len(w) > 40 or len(w.split()) > 5:
            continue
        if w.lower() in ('an', 'the', 'to', 'and', 'or', 'of', 'etc', 'no'):
            continue
        w = re.sub(r'\s+etc$', '', w).strip(" '")
        if not re.match(r"^[A-Za-zÇĞİÖŞÜçğıöşü][A-Za-zÇĞİÖŞÜçğıöşü\s'\-]*$", w):
            continue
        if len(w) < 3 and not (w.isupper() and len(w) >= 2):     # "es", "re" artıkları; "PE", "UK", "IT" kalır
            continue
        if re.search(r"\s(of|the|to|a|an|and|for|your)$", w, re.IGNORECASE):   # "piece of", "take the" yarım parçalar
            continue
        low = w.lower()
        if any(b in low for b in ('vocabulary', 'target', 'in use', 'revisional', 'from 50 to', 'numbers',
                                   'language chunks', 'has got', 'have got some', 'physical appearance and')):
            continue
        words.append(low)  # uygulama eşleştirmeyi harf duyarsız yapar; görünen yazım WORDS_DATA'dan gelir
    return list(dict.fromkeys(words))

def extract_standard_vocab_and_functions(text):
    """Eski program biçimi: işlev başlıkları + '—' ile başlayan örnek cümleler + alt alta kelime listesi."""
    vocab, funcs = [], []
    for raw in (text or '').split('\n'):
        line = clean_text(raw)
        if not line or line.startswith(('—', '-', '•', '(')):
            continue
        if re.match(r"^[a-z][a-z\s'\-]{1,34}$", line) and len(line.split()) <= 4:
            vocab.append(line)
        elif line[0].isupper() and '?' not in line and '/' not in line[:3] and len(line) < 70 and not line.endswith('.'):
            funcs.append(line)
    return list(dict.fromkeys(vocab)), '; '.join(dict.fromkeys(funcs))

# ---------------------------------------------------------------------------
# Word (.docx) yıllık plan okuyucu (9-12. sınıflar)
# ---------------------------------------------------------------------------
_W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def read_docx_rows(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    rows = []
    for tbl in root.iter(_W + 'tbl'):
        for tr in tbl.findall(_W + 'tr'):
            cells = []
            for tc in tr.findall(_W + 'tc'):
                ps = [''.join(t.text or '' for t in p.iter(_W + 't')) for p in tc.findall('.//' + _W + 'p')]
                cells.append('\n'.join(x for x in ps if x.strip()))
            rows.append(cells)
    return rows

def log(msg):
    print(f"[Curriculum Builder] {msg}")

def clean_text(s):
    if not s:
        return ''
    return ' '.join(s.split()).strip()

def extract_subthemes_and_focus(content):
    if not content:
        return ''
    m = re.search(r'Sub-Themes?:\s*(.*?)(?=\n\s*(?:Target\s+Vocabulary|Target\s+Grammatical|Functions\b|\*|\Z))', content, re.IGNORECASE | re.DOTALL)
    if m:
        return clean_text(m.group(1))
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    header_lines = []
    for line in lines:
        if line.startswith('—') or line.startswith('-') or '?' in line:
            break
        header_lines.append(line)
        if len(header_lines) >= 2:
            break
    if header_lines:
        return clean_text(' / '.join(header_lines))
    return clean_text(content[:150])

def extract_communicative_functions(content):
    if not content:
        return ''
    m = re.search(r'Functions\s+of\s+the\s+Target\s+Grammatical\s+Structures\s+in\s+Use:\s*(.*?)(?=\n\s*(?:\*|Target\s+Social|\Z))', content, re.IGNORECASE | re.DOTALL)
    if m:
        return clean_text(m.group(1))
    m2 = re.search(r'Target\s+Grammatical\s+Structures\s+in\s+Use:\s*(.*?)(?=\n\s*(?:Functions|\*|\Z))', content, re.IGNORECASE | re.DOTALL)
    if m2:
        return clean_text(m2.group(1))
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    if lines:
        return clean_text(' '.join(lines[:3]))
    return ''

def parse_learning_outcomes(raw):
    if not raw:
        return [], ''
    # Normalize typos e.g. ENG5. -> ENG.5. or ENG. 5. -> ENG.5.
    text = re.sub(r'\bENG\s*(\d+)\.', r'ENG.\1.', raw)
    text = re.sub(r'\bENG\.\s*(\d+)\.', r'ENG.\1.', text)
    pattern = r'((?:ENG\.\d+\.\d+\.[A-Z0-9]+|E\d+\.\d+\.[A-Z0-9]+))\s*[:.]?\s*(.*?)(?=(?:ENG\.\d+\.\d+\.[A-Z0-9]+|E\d+\.\d+\.[A-Z0-9]+|\Z))'
    matches = re.findall(pattern, text, re.DOTALL)
    outcomes_list = []
    headers_to_strip = [
        'Listening', 'Pronunciation', 'Reading', 'Vocabulary', 'Grammar',
        'Writing', 'Speaking', 'Spoken Interaction', 'Spoken Production'
    ]
    for code, desc in matches:
        clean_code = code.strip()
        clean_desc = clean_text(desc)
        for h in headers_to_strip:
            if clean_desc.endswith(' ' + h):
                clean_desc = clean_desc[:-len(' ' + h)].strip()
            elif clean_desc == h:
                clean_desc = ''
        skill = 'General'
        if '.L' in clean_code: skill = 'Listening'
        elif '.P' in clean_code: skill = 'Pronunciation'
        elif '.R' in clean_code: skill = 'Reading'
        elif '.V' in clean_code: skill = 'Vocabulary'
        elif '.G' in clean_code: skill = 'Grammar'
        elif '.W' in clean_code: skill = 'Writing'
        elif '.S' in clean_code or '.SI' in clean_code or '.SP' in clean_code: skill = 'Speaking'
        outcomes_list.append({'code': clean_code, 'skill': skill, 'text': clean_desc})
    
    full_text = ' '.join(f'{item["code"]}. {item["text"]}' for item in outcomes_list) if outcomes_list else clean_text(raw)
    return outcomes_list, full_text

def is_valid_vocab_word(w):
    w = clean_text(w)
    if not w or len(w) < 2 or len(w) > 35:
        return False
    lower = w.lower()
    blacklist = [
        'content frame', 'target', 'vocabulary', 'language chunks', 'functions', 'function',
        'social language', 'phonological', 'learning outcomes', 'revisional', 'expansion',
        'sub-themes', 'sub-theme', 'asking', 'making', 'giving', 'describing', 'talking',
        'expressing', 'identifying', 'telling', 'following', 'accepting', 'refusing', 'apologizing',
        'suggested', 'contexts', 'tasks', 'assignments', 'measurement', 'evaluation',
        'out-of-school', 'learning activities', 'students will', 'listening', 'speaking',
        'reading', 'writing', 'indicators', 'intercurricular', 'expansion objective',
        'reflecting', 'turkish social', 'cultural', 'grammatical', 'without explaining',
        'considerations', 'activities related', 'national and religious', 'festivals, and',
        'appropriate', 'tense', 'modal', 'present continuous', 'simple present',
        'to be for', 'questions', 'prepositions', 'demonstrative', 'pronouns', 'quantifiers'
    ]
    if any(b in lower for b in blacklist):
        return False
    if lower.startswith('http') or lower.startswith('unit') or lower.startswith('theme') or lower.startswith('week') or lower.startswith('-'):
        return False
    if ':' in w or '?' in w or '!' in w or ';' in w or '.' in w:
        return False
    if not re.match(r'^[a-zA-Z\s\'-]+$', w):
        return False
    return True

def extract_vocab_from_text(text):
    words = []
    if not text:
        return words
    # Stop before cultural considerations, chunks, or national days
    m = re.search(r'Target\s+Vocabulary[^\n]*\n(.*?)(?=\n\s*(?:\*|Target\s+Language|Target\s+Social|Target\s+Phonological|Target\s+Grammatical|\Z))', text, re.DOTALL | re.IGNORECASE)
    if m:
        sec = m.group(1)
        for line in sec.splitlines():
            line = line.strip()
            if not line or line.startswith('*') or line.startswith('—'):
                continue
            # Strip category headings like "-people at school: a classmate"
            line_clean = re.sub(r'^[—\-\*•\s]*[A-Za-z0-9\s/&]+:\s*', '', line)
            for part in re.split(r'[,;]\s*', line_clean):
                w = re.sub(r'^(a|an|to)\s+', '', part.strip(), flags=re.IGNORECASE)
                w = re.sub(r'\s*\([^)]*\)', '', w)
                w = re.sub(r'[\'\"“”‘’]', '', w)
                w = w.strip().rstrip('.,;:!?')
                if is_valid_vocab_word(w):
                    words.append(w.lower())
    return list(dict.fromkeys(words))

# Turkish Unit Titles Mapping
UNIT_TITLES_TR = {
    # Grade 1
    (1, 1): "Tanışma ve Selamlaşma",
    (1, 2): "Ailem ve Arkadaşlarım",
    (1, 3): "Renkler ve Gökkuşağı",
    (1, 4): "Sayılar ve Sayma (1-10)",
    (1, 5): "Sınıfım ve Oyuncaklarım",
    (1, 6): "Hayvanlar ve Evcil Dostlar",
    (1, 7): "Vücudum ve Sağlığım",
    (1, 8): "Meyveler ve Atıştırmalıklar",
    (1, 9): "Hareket ve Eylemler",
    (1, 10): "Doğa ve Hava Durumu",
    # Grade 2
    (2, 1): "Okul Yaşamı & Tanışma",
    (2, 2): "Sınıf Yaşamı, Eşyalar & Renkler",
    (2, 3): "Kişisel Yaşam, Vücut & Kıyafetler",
    (2, 4): "Aile Yaşamı & Fiziksel Görünüm",
    (2, 5): "Ev, Odalar & Mahalle",
    (2, 6): "Şehirde Yaşam & Temel Besinler",
    # Grade 3
    (3, 1): "Okul Yaşamı & Aylar",
    (3, 2): "Sınıf Yaşamı & Okul Araçları",
    (3, 3): "Kişisel Yaşam, Duygular & Hava",
    (3, 4): "Aile Yaşamı, Günlük Rutinler & Hobiler",
    (3, 5): "Kır Yaşamı, Çiftlik & Hayvanlar",
    (3, 6): "Şehirde Yaşam & Dışarıda Yemek",
    # Grade 4
    (4, 1): "Sınıf Kuralları & İzin İsteme",
    (4, 2): "Ülkeler ve Milliyetler",
    (4, 3): "Çizgi Film Karakterleri & Yetenekler",
    (4, 4): "Boş Zaman Aktiviteleri & Hobiler",
    (4, 5): "Günüm & Günlük Rutinler",
    (4, 6): "Bilimle Eğlence & Deneyler",
    (4, 7): "Meslekler & Çalışma Alanları",
    (4, 8): "Kıyafetlerim & Mevsimler",
    (4, 9): "Arkadaşlarım & Dış Görünüş",
    (4, 10): "Yiyecekler ve İçecekler",
    # Grade 5
    (5, 1): "Okul Yaşamı, Kulüpler & Ülkeler",
    (5, 2): "Sınıf Yaşamı, Dersler & Ders Programı",
    (5, 3): "Kişisel Yaşam, Rutinler & Sağlık",
    (5, 4): "Aile Yaşamı, Rutinler & Hobiler",
    (5, 5): "Mahalle ve Şehirde Yaşam, Mekanlar",
    (5, 6): "Dünyada Yaşam & Kültür, Restoran",
    (5, 7): "Doğada Yaşam & Vahşi Hayvanlar",
    (5, 8): "Evrende Yaşam, Gezegenler & Tatil",
    # Grade 6
    (6, 1): "Okul Yaşamı, Sorumluluklar & Rutinler",
    (6, 2): "Sınıf Yaşamı, Çalışma & Sayılar (100-500)",
    (6, 3): "Kişisel Yaşam, Karakter & Görünüş",
    (6, 4): "Aile Yaşamı, Meslekler & Ev Tipleri",
    (6, 5): "Mahalle ve Şehirde Yaşam, Festivaller",
    (6, 6): "Dünyada Yaşam, Kültür & Ülkeler",
    (6, 7): "Doğada Yaşam & Çevre Sorunları",
    (6, 8): "Evrende Yaşam, Gezegenler & Gelecek",
    # Grade 7
    (7, 1): "Dış Görünüş ve Kişilik",
    (7, 2): "Spor Dalları ve Rutinler",
    (7, 3): "Biyografiler ve Geçmiş Olaylar",
    (7, 4): "Vahşi Hayvanlar ve Yaşam Alanları",
    (7, 5): "Televizyon ve Medya Programları",
    (7, 6): "Kutlamalar ve Partiler",
    (7, 7): "Gelecek Hayalleri ve Tahminler",
    (7, 8): "Kamu Binaları ve Şehir Yaşamı",
    (7, 9): "Çevre Koruma ve Geri Dönüşüm",
    (7, 10): "Gezegenler ve Güneş Sistemi",
    # Grade 8
    (8, 1): "Arkadaşlık ve Kişisel Özellikler",
    (8, 2): "Gençlik Yaşamı ve Tercihler",
    (8, 3): "Mutfakta ve Yemek Pişirme",
    (8, 4): "Telefonda İletişim",
    (8, 5): "İnternet ve Dijital Dünya",
    (8, 6): "Macera ve Doğa Sporları",
    (8, 7): "Turizm ve Gezi Rehberi",
    (8, 8): "Ev İşleri ve Sorumluluklar",
    (8, 9): "Bilim ve Keşifler",
    (8, 10): "Doğal Afetler ve Çevre",
    # Grade 9 (Türkiye Yüzyılı Maarif Modeli)
    (9, 1): "Okul Yaşamı & Ülkeler",
    (9, 2): "Sınıf Yaşamı & Arkadaşlık",
    (9, 3): "Kişisel Yaşam: Dış Görünüş & Kişilik",
    (9, 4): "Aile Yaşamı",
    (9, 5): "Ev ve Mahallede Yaşam",
    (9, 6): "Şehirde ve Kırsalda Yaşam",
    (9, 7): "Dünyada ve Doğada Yaşam",
    (9, 8): "Evrende Yaşam & Gelecek",
    # Grade 10 (Türkiye Yüzyılı Maarif Modeli)
    (10, 1): "Okul Yaşamı & Eğitim",
    (10, 2): "Sınıf Yaşamı & Öğrenme",
    (10, 3): "Kişisel Yaşam & İyi Oluş",
    (10, 4): "Aile Yaşamı & Ev",
    (10, 5): "Mahalle, Şehir & Sosyal Yaşam",
    (10, 6): "Dünyada Yaşam & Kültür",
    (10, 7): "Doğada Yaşam & Küresel Sorunlar",
    (10, 8): "Evrende Yaşam & Gelecek",
    # Grade 11
    (11, 1): "Geleceğin Meslekleri & Kariyer",
    (11, 2): "Hobiler, Yetenekler & Sanat",
    (11, 3): "Zor Zamanlar & Dayanıklılık",
    (11, 4): "Büyük Başarılar & Yaşam Öyküleri",
    (11, 5): "Geçmişe Yolculuk & Nostalji",
    (11, 6): "Empati, Yardımlaşma & Gönüllülük",
    (11, 7): "Türkiye'nin Değerleri & Coğrafyası",
    (11, 8): "Spor & Sağlıklı Yaşam",
    (11, 9): "Dostluk & Sosyal İlişkiler",
    (11, 10): "Etik, Değerler & Toplumsal Normlar",
    # Grade 12
    (12, 1): "Müzik & Sanatsal İfade",
    (12, 2): "Dostluk & İnsan İlişkileri",
    (12, 3): "İnsan Hakları & Küresel Vatandaşlık",
    (12, 4): "Gelecek Teknolojileri & Yapay Zeka",
    (12, 5): "Psikoloji & Zihinsel Sağlık",
    (12, 6): "İyilik, Dayanışma & Toplum",
    (12, 7): "Haberler, Medya & Gazetecilik",
    (12, 8): "Yenilenebilir Enerji & Çevre",
    (12, 9): "Teknoloji, İnovasyon & Siber Güvenlik",
    (12, 10): "Nezaket & Protokol Kuralları"
}

# Semantic Keywords for Unit Classification Engine ("Bağlama Motoru")
UNIT_KEYWORDS = {
    # Grade 1
    (1, 1): ['hello', 'hi', 'goodbye', 'bye', 'morning', 'afternoon', 'evening', 'night', 'name', 'friend', 'meet', 'greet', 'welcome'],
    (1, 2): ['family', 'mother', 'father', 'brother', 'sister', 'baby', 'grandmother', 'grandfather', 'parents', 'kid', 'child'],
    (1, 3): ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'grey', 'color', 'rainbow'],
    (1, 4): ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'number', 'count', 'how many'],
    (1, 5): ['pencil', 'pen', 'book', 'bag', 'desk', 'chair', 'ball', 'doll', 'car', 'train', 'toy', 'play', 'box'],
    (1, 6): ['cat', 'dog', 'bird', 'fish', 'rabbit', 'cow', 'horse', 'sheep', 'duck', 'chicken', 'pet', 'animal'],
    (1, 7): ['head', 'eye', 'nose', 'mouth', 'ear', 'hair', 'face', 'hand', 'arm', 'leg', 'foot', 'feet', 'finger', 'body'],
    (1, 8): ['apple', 'banana', 'orange', 'strawberry', 'milk', 'water', 'juice', 'bread', 'cheese', 'egg', 'eat', 'drink', 'food'],
    (1, 9): ['jump', 'run', 'walk', 'stop', 'sing', 'dance', 'listen', 'look', 'sit', 'stand', 'open', 'close', 'clap'],
    (1, 10): ['sun', 'sunny', 'rain', 'rainy', 'cloud', 'cloudy', 'wind', 'windy', 'tree', 'flower', 'sky', 'star', 'hot', 'cold'],
    # Grade 2
    (2, 1): ['teacher', 'pupil', 'principal', 'headmaster', 'canteen', 'library', 'playground', 'garden', 'school', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    (2, 2): ['desk', 'chair', 'blackboard', 'whiteboard', 'smartboard', 'eraser', 'rubber', 'notebook', 'crayon', 'scissors', 'glue', 'ruler', 'sharpener'],
    (2, 3): ['body', 'arm', 'leg', 'hand', 'foot', 'eyes', 'ears', 'clothes', 'shirt', 't-shirt', 'pants', 'trousers', 'skirt', 'dress', 'shoes'],
    (2, 4): ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather', 'family', 'tall', 'short', 'young', 'old'],
    (2, 5): ['house', 'home', 'room', 'bedroom', 'living room', 'kitchen', 'bathroom', 'garden', 'furniture', 'bed', 'sofa', 'table'],
    (2, 6): ['city', 'street', 'park', 'shop', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'bread', 'cheese', 'soup', 'salad'],
    # Grade 3
    (3, 1): ['classmate', 'librarian', 'school nurse', 'headteacher', 'janitor', 'caretaker', 'art room', 'music room', 'meeting room', 'office', 'sports field', 'corridor', 'gym', 'birthday', 'birthday party', 'candle', 'cake', 'balloon', 'gift', 'summer holiday', 'surprise', 'months', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    (3, 2): ['classroom', 'instruction', 'listen', 'quiet', 'repeat', 'pencil case', 'marker', 'tablet', 'computer', 'ruler', 'bookshelf', 'paintbrush', 'pencil sharpener', 'eraser', 'desk', 'pen'],
    (3, 3): ['feelings', 'happy', 'sad', 'angry', 'surprised', 'tired', 'sunny', 'windy', 'snowy', 'rainy', 'weather', 'jacket', 'coat', 'boots', 'hair', 'curly', 'straight', 'eyes', 'teeth', 'feet'],
    (3, 4): ['routine', 'wake up', 'breakfast', 'wash', 'brush', 'teeth', 'brush teeth', 'hobby', 'painting', 'reading', 'swimming', 'cycling', 'cousin', 'aunt', 'uncle', 'grandparent', 'chores', 'help'],
    (3, 5): ['countryside', 'farm', 'barn', 'tractor', 'cow', 'horse', 'sheep', 'goat', 'donkey', 'rooster', 'hen', 'feed', 'farm animals', 'farmhouse', 'cottage', 'field', 'duck', 'turkey', 'rabbit'],
    (3, 6): ['restaurant', 'cafe', 'order', 'menu', 'waiter', 'waitress', 'pizza', 'pasta', 'burger', 'drink', 'water', 'juice', 'dessert', 'salad', 'sandwich', 'pancake', 'toast', 'olive', 'cheese', 'bread'],
    # Grade 4
    (4, 1): ['permission', 'may i', 'can i', 'come in', 'go out', 'open the door', 'close the window', 'quiet', 'ruler', 'pencil sharpener', 'eraser'],
    (4, 2): ['nationality', 'country', 'turkey', 'turkish', 'germany', 'german', 'britain', 'british', 'japan', 'japanese', 'russia', 'russian', 'flag', 'north', 'south', 'east', 'west'],
    (4, 3): ['cartoon', 'character', 'ability', 'can', 'jump', 'fly', 'climb', 'swim', 'ride a bike', 'play the guitar', 'superhero', 'power'],
    (4, 4): ['free time', 'hobby', 'like', 'dislike', 'play chess', 'table tennis', 'reading comics', 'flying a kite', 'coloring', 'marbles'],
    (4, 5): ['daily routine', 'wake up', 'get dressed', 'have breakfast', 'go to school', 'do homework', 'o clock', 'morning', 'afternoon', 'evening', 'night'],
    (4, 6): ['science', 'scientist', 'experiment', 'lab', 'plant', 'water', 'cut', 'fold', 'freeze', 'melt', 'mix', 'brush', 'cup'],
    (4, 7): ['job', 'profession', 'doctor', 'nurse', 'teacher', 'vet', 'fireman', 'policeman', 'pilot', 'chef', 'farmer', 'actor', 'hospital', 'clinic'],
    (4, 8): ['clothes', 'weather', 'winter', 'summer', 'spring', 'autumn', 'fall', 'boot', 'dress', 'glove', 'hat', 'skirt', 'sock', 'sunglasses', 'umbrella'],
    (4, 9): ['friend', 'appearance', 'hair', 'curly', 'straight', 'wavy', 'blonde', 'dark', 'beard', 'moustache', 'handsome', 'beautiful', 'tall', 'short', 'slim'],
    (4, 10): ['food', 'drink', 'hungry', 'thirsty', 'sandwich', 'cupcake', 'honey', 'olive', 'butter', 'lemonade', 'yoghurt', 'bread', 'tea', 'coffee'],
    # Grade 5
    (5, 1): ['school life', 'department', 'gate', 'uniform', 'lab', 'sports field', 'secretary', 'coach', 'drama club', 'music club', 'art club', 'celebration'],
    (5, 2): ['classroom rules', 'subject', 'maths', 'science', 'social studies', 'physical education', 'timetable', 'schedule', 'break time'],
    (5, 3): ['personal life', 'healthy', 'illness', 'cough', 'fever', 'headache', 'stomachache', 'medicine', 'rest', 'vitamin', 'body parts'],
    (5, 4): ['family life', 'chores', 'hobby', 'cooking', 'gardening', 'repairing', 'routine', 'weekdays', 'weekend'],
    (5, 5): ['neighbourhood', 'city', 'bakery', 'pharmacy', 'library', 'cinema', 'mosque', 'museum', 'bank', 'post office', 'directions', 'straight', 'turn left', 'turn right'],
    (5, 6): ['world', 'culture', 'traditional food', 'recipe', 'festival', 'national costume', 'cuisine', 'famous dish'],
    (5, 7): ['nature', 'wild animals', 'lion', 'tiger', 'elephant', 'giraffe', 'habitat', 'forest', 'jungle', 'ocean', 'desert', 'protect animals'],
    (5, 8): ['universe', 'future', 'planet', 'earth', 'mars', 'holiday', 'space travel', 'spacecraft', 'future life', 'prediction'],
    # Grade 6
    (6, 1): ['school routines', 'national anthem', 'ceremony', 'leader', 'manner', 'guide', 'flag', 'parade', 'responsibility'],
    (6, 2): ['study routines', 'learning activity', 'hundred', 'two hundred', 'five hundred', 'project', 'assignment', 'presentation'],
    (6, 3): ['appearance', 'personality', 'generous', 'polite', 'rude', 'kind', 'hardworking', 'lazy', 'character', 'clothing style'],
    (6, 4): ['family jobs', 'workplace', 'office', 'factory', 'architect', 'mechanic', 'dentist', 'engineer', 'salary', 'career'],
    (6, 5): ['city life', 'festival', 'sports event', 'music festival', 'transportation', 'bus', 'train', 'subway', 'ferry', 'traffic'],
    (6, 6): ['world cultures', 'international', 'language', 'spanish', 'french', 'german', 'arabic', 'global', 'customs', 'celebrations'],
    (6, 7): ['environment', 'pollution', 'air pollution', 'water pollution', 'climate change', 'global warming', 'recycle', 'plant trees', 'save water'],
    (6, 8): ['universe', 'solar system', 'future technology', 'space station', 'robot', 'artificial intelligence', 'future inventions'],
    # Grade 7
    (7, 1): ['appearance', 'personality', 'attractive', 'cute', 'easy-going', 'generous', 'honest', 'outgoing', 'plump', 'punctual', 'selfish', 'slim', 'smart', 'stubborn'],
    (7, 2): ['sports', 'routine', 'indoor', 'outdoor', 'medal', 'spectator', 'train', 'score a goal', 'win', 'lose', 'jogging', 'swimming', 'skating', 'diet'],
    (7, 3): ['biography', 'past events', 'born', 'die', 'graduate', 'award', 'prize', 'grow up', 'move', 'invent', 'achievement', 'famous person'],
    (7, 4): ['wild animals', 'attack', 'birds', 'eagle', 'falcon', 'hawk', 'owl', 'cage', 'desert', 'enormous', 'extinct', 'habitat', 'hunt', 'jungle', 'mammals', 'dolphin', 'elephant', 'giraffe', 'lion', 'shark', 'tiger', 'poison', 'prey', 'reptiles', 'crocodile', 'snake', 'survive'],
    (7, 5): ['television', 'channel', 'commercial', 'director', 'discussion', 'documentary', 'news', 'quiz show', 'reality show', 'series', 'sitcom', 'soap opera', 'talk show', 'remote control'],
    (7, 6): ['celebration', 'party', 'arrange', 'attend', 'beverage', 'decorate', 'balloon', 'fancy dress', 'guest', 'host', 'invitation card', 'invite', 'wrap a present'],
    (7, 7): ['dreams', 'future predictions', 'career', 'university', 'marriage', 'predict', 'guess', 'imagine', 'peaceful world', 'travel space', 'successful'],
    (7, 8): ['public buildings', 'amusement park', 'art gallery', 'bakery', 'chemist', 'pharmacy', 'city hall', 'coffee shop', 'department store', 'fire station', 'movie theater', 'municipality', 'police station', 'shopping mall'],
    (7, 9): ['environment', 'balance of nature', 'climate', 'eco-friendly', 'global warming', 'greenhouse effect', 'nature', 'protect', 'pollute', 'pollution', 'recycle', 'renewable energy', 'solar energy', 'wind energy', 'waste'],
    (7, 10): ['planets', 'solar system', 'astronomy', 'atmosphere', 'evidence', 'explore', 'galaxy', 'gravity', 'meteor', 'moon', 'observe', 'orbit', 'planet', 'satellite', 'space shuttle', 'universe', 'surface of mars'],
    # Grade 8 (LGS)
    (8, 1): ['friendship', 'buddy', 'mate', 'best friend', 'count on', 'back up', 'support', 'trust', 'honest', 'generous', 'loyal', 'share secrets', 'laid-back', 'reliable', 'argue', 'apologize'],
    (8, 2): ['teen life', 'teenager', 'music concert', 'camping', 'fashion', 'trendy', 'unbearable', 'fond of', 'keen on', 'prefer', 'routine', 'lifestyle'],
    (8, 3): ['in the kitchen', 'cooking', 'recipe', 'ingredient', 'bake', 'boil', 'fry', 'grill', 'roast', 'steam', 'chop', 'dice', 'slice', 'peel', 'grate', 'stir', 'pour', 'pan', 'pot', 'bowl', 'delicious', 'spicy', 'sweet', 'sour', 'salty', 'bitter'],
    (8, 4): ['on the phone', 'phone call', 'speak to', 'hold on', 'hang up', 'call back', 'leave a message', 'available', 'engaged', 'busy', 'connect', 'extension', 'communication'],
    (8, 5): ['the internet', 'online', 'browser', 'download', 'upload', 'website', 'account', 'password', 'log in', 'attachment', 'social media', 'search engine', 'wireless', 'comment', 'post'],
    (8, 6): ['adventures', 'adventure sports', 'extreme sports', 'rafting', 'paragliding', 'bungee jumping', 'skydiving', 'scuba diving', 'caving', 'helmet', 'adrenaline', 'perilous', 'challenging', 'courage'],
    (8, 7): ['tourism', 'tourist', 'historic site', 'architecture', 'all-inclusive', 'bed and breakfast', 'resort', 'attraction', 'destination', 'countryside', 'urban', 'rural', 'ancient', 'fascinating', 'monument'],
    (8, 8): ['chores', 'housework', 'do the laundry', 'wash dishes', 'dishwasher', 'take out garbage', 'tidy up', 'make the bed', 'clean up', 'iron', 'vacuum', 'dust', 'sweep', 'responsibility', 'obligation'],
    (8, 9): ['science', 'scientific', 'experiment', 'scientist', 'invent', 'invention', 'discover', 'discovery', 'lab', 'laboratory', 'test tube', 'high-tech', 'cell', 'vaccination', 'cure', 'process', 'result'],
    (8, 10): ['natural forces', 'natural disasters', 'avalanche', 'drought', 'earthquake', 'erosion', 'flood', 'global warming', 'hurricane', 'landslide', 'tornado', 'tsunami', 'volcano', 'destruction', 'survivor', 'rescue'],
    # Grade 9-10: Maarif modeli planları hedef kelimeleri içerir; ek anahtar kelime gerekmez
    # Grade 11
    (11, 1): ['future jobs', 'emerging careers', 'data analyst', 'ai specialist', 'biotechnologist', 'freelancer', 'job interview', 'curriculum vitae', 'salary package'],
    (11, 2): ['hobbies and skills', 'craftsmanship', 'pottery', 'photography', 'martial arts', 'creative writing', 'artistic expression', 'talent'],
    (11, 3): ['hard times', 'resilience', 'adversity', 'economic struggle', 'famine', 'great depression', 'endurance', 'overcoming obstacles'],
    (11, 4): ['what a life', 'memoir', 'remarkable life', 'lifetime achievement', 'breakthrough', 'triumph', 'distinguished career', 'autobiography'],
    (11, 5): ['back to the past', 'nostalgia', 'historical era', 'retrospective', 'antiquity', 'renaissance', 'vintage', 'reminiscence'],
    (11, 6): ['open your heart', 'empathy', 'volunteering', 'charitable foundation', 'donation', 'homeless shelter', 'solidarity', 'generosity'],
    (11, 7): ['facts about turkey', 'anatolian civilization', 'cappadocia', 'pamukkale', 'bosphorus', 'ephesus', 'natural beauties', 'cultural wealth'],
    (11, 8): ['sports', 'athletics', 'olympic games', 'marathon', 'championship', 'sportsmanship', 'physical fitness', 'tournament trophy'],
    (11, 9): ['my friends', 'interpersonal relationships', 'confidant', 'mutual trust', 'reconciliation', 'deep connection', 'loyalty'],
    (11, 10): ['values and norms', 'ethics', 'moral principles', 'civic duty', 'social etiquette', 'integrity', 'tolerance', 'human dignity'],
    # Grade 12 (YDT)
    (12, 1): ['music', 'musical composition', 'symphony', 'orchestra', 'acoustic', 'harmony', 'improvisation', 'music therapy', 'genre'],
    (12, 2): ['friendship', 'camaraderie', 'long-lasting bonds', 'emotional support', 'dependability', 'solidarity', 'conflict resolution'],
    (12, 3): ['human rights', 'universal declaration', 'fundamental rights', 'equality', 'justice', 'freedom of expression', 'rule of law', 'global citizen'],
    (12, 4): ['coming soon', 'futuristic society', 'nanotechnology', 'cyborg', 'space colonization', 'singularity', 'quantum computing'],
    (12, 5): ['psychology', 'cognitive psychology', 'mental wellness', 'subconscious mind', 'emotional intelligence', 'psychotherapy', 'stress management'],
    (12, 6): ['favors', 'benevolence', 'community service', 'mutual aid', 'kindness', 'philanthropic deeds', 'civic contribution'],
    (12, 7): ['news stories', 'journalistic integrity', 'press freedom', 'media literacy', 'investigative reporting', 'fake news', 'broadcasting'],
    (12, 8): ['alternative energy', 'renewable energy', 'solar panel', 'wind turbine', 'geothermal', 'sustainability', 'carbon neutrality', 'green economy'],
    (12, 9): ['technology', 'technological breakthrough', 'patents', 'biotechnology', 'telecommunication', 'semiconductor', 'digital transformation'],
    (12, 10): ['manners', 'diplomatic protocol', 'formal decorum', 'social grace', 'etiquette', 'courtesy', 'intercultural respect']
}

GRADE_METADATA = {
    1: {"name": "1. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "Pre-A1", "hours": 2, "badge": "1. SINIF"},
    2: {"name": "2. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "A1", "hours": 2, "badge": "2. SINIF"},
    3: {"name": "3. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "A1", "hours": 2, "badge": "3. SINIF"},
    4: {"name": "4. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "A1-A2", "hours": 2, "badge": "4. SINIF"},
    5: {"name": "5. Sınıf (Maarif)", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A1-A2", "hours": 3, "badge": "5. SINIF"},
    6: {"name": "6. Sınıf (Maarif)", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A2", "hours": 3, "badge": "6. SINIF"},
    7: {"name": "7. Sınıf", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A2", "hours": 4, "badge": "7. SINIF"},
    8: {"name": "8. Sınıf (LGS)", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A2-B1", "hours": 4, "badge": "8. SINIF"},
    9: {"name": "9. Sınıf (Maarif)", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "A2.2-B1.1", "hours": 4, "badge": "9. SINIF"},
    10: {"name": "10. Sınıf (Maarif)", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "B1.1-B1.2", "hours": 4, "badge": "10. SINIF"},
    11: {"name": "11. Sınıf", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "B1.2-B2.1", "hours": 4, "badge": "11. SINIF"},
    12: {"name": "12. Sınıf (YDT)", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "B2.1-B2.2", "hours": 4, "badge": "12. SINIF"}
}

# ---------------------------------------------------------------------------
# Yıllık plan → müfredat kaydı (2-8: Excel, 9-12: Word). Tek ortak mantık:
#   * Haftalar gerçek tarihleriyle (start/end ISO) ve türleriyle saklanır
#     (theme | orientation | revision | school_based | evaluation | social)
#   * Orientation / Revision / Okul Temelli haftalar TEMA SAYILMAZ (eskiden Tema 1'in adını eziyordu)
#   * Temanın hedef kelimeleri, o temanın ders haftalarına sırayla bölünür (haftalık ilerleme)
#   * Tatiller planlardan okunur ve ACADEMIC_CALENDAR olarak dışa verilir
# ---------------------------------------------------------------------------
TR_MONTH_NAMES = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz',
                  'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

WEEK_TYPE_LABELS = {
    'theme': ('', ''),
    'orientation': ('ORIENTATION', 'Uyum Haftası'),
    'revision': ('REVISION', 'Tekrar Haftası'),
    'school_based': ('SCHOOL-BASED PLANNING', 'Okul Temelli Planlama'),
    'evaluation': ('EVALUATION', 'Değerlendirme Haftası'),
    'social': ('SOCIAL ACTIVITIES', 'Sosyal Etkinlik Haftası'),
}

DOCX_GRADES = {9: 'tymm', 10: 'tymm', 11: 'standard', 12: 'standard'}


def classify_theme_cell(text):
    """Hücre metnini (tür, tema no, tema başlığı) olarak sınıflandırır; tanınmazsa None."""
    t = clean_text(text).upper()
    if not t:
        return None
    if 'ORIENTATION' in t:
        return ('orientation', None, '')
    if t.startswith('REVISION'):
        return ('revision', None, '')
    if 'SCHOOL-BASED' in t or 'SCHOOL BASED' in t or 'OKUL TEMELL' in t:
        return ('school_based', None, '')
    if t.startswith('SOSYAL') or 'SOCIAL ACTIVIT' in t:
        return ('social', None, '')
    if t.startswith('EVALUATION'):
        return ('evaluation', None, '')
    m = re.match(r'(?:THEME|UNIT)\s*(\d+)\s*:?\s*(.*)$', t, re.DOTALL)
    if m:
        return ('theme', int(m.group(1)), clean_text(m.group(2)).strip(' -&'))
    m = re.match(r'^(\d+)\s+([A-Z].*)$', t)
    if m:
        return ('theme', int(m.group(1)), clean_text(m.group(2)))
    return None


class GradePlan:
    def __init__(self, grade, code_prefix):
        self.grade = grade
        self.code_prefix = code_prefix
        self.units = {}
        self.weeks = {}
        self.holidays = []

    def unit(self, num, title):
        if num not in self.units:
            self.units[num] = {
                'unitNum': num,
                'code': f'{self.code_prefix} {num}',
                'title': (title or f'{self.code_prefix} {num}').upper(),
                'titleTr': UNIT_TITLES_TR.get((self.grade, num), (title or '').title()),
                'subThemes': '', 'functions': '', 'outcomes': '', 'outcomesList': [],
                'targetVocab': [], 'semanticKeywords': []
            }
        return self.units[num]

    def absorb(self, u, content='', outcomes='', functions=''):
        if content:
            if not u['subThemes']:
                m = re.search(r'Sub-?themes?:\s*(.*?)(?=Target\s+Vocabulary|\n\s*\n|\Z)', content, re.IGNORECASE | re.DOTALL)
                u['subThemes'] = clean_text(m.group(1)).strip('"“”\' ') if m else ''
            if not u['functions']:
                u['functions'] = extract_communicative_functions(content) if 'Target' in content else ''
            u['targetVocab'] = list(dict.fromkeys(u['targetVocab'] + extract_plan_vocab(content)))
        if functions and not u['functions']:
            u['functions'] = functions
        if outcomes and not u['outcomesList']:
            lst, full = parse_learning_outcomes(outcomes)
            if lst:
                u['outcomesList'], u['outcomes'] = lst, full

    def add_week(self, wn, dates_text, hours, wtype, unit_num, important='', revision_vocab=None):
        start, end = parse_date_range(dates_text)
        existing = self.weeks.get(wn)
        if existing:
            # Aynı hafta iki kez yazılmışsa (ör. "EVALUATION" + "THEME 3") tema satırı kazanır
            if existing['weekType'] != 'theme' and wtype == 'theme':
                existing.update({'weekType': 'theme', 'unitNum': unit_num})
            if important and important not in existing['importantDays']:
                existing['importantDays'] = clean_text(f"{existing['importantDays']} {important}")
            return
        self.weeks[wn] = {
            'weekNum': wn,
            'month': TR_MONTH_NAMES[int(start[5:7])] if start else '',
            'dates': clean_text(dates_text),
            'start': start, 'end': end,
            'hours': hours,
            'weekType': wtype,
            'unitNum': unit_num,
            'importantDays': clean_text(important),
            '_revisionVocab': revision_vocab or []
        }

    def add_holiday(self, text):
        h = make_holiday(text)
        if h and not any(x['start'] == h['start'] and x['end'] == h['end'] for x in self.holidays):
            self.holidays.append(h)


def parse_excel_grades():
    plans = {}
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(EXCEL_PATH, 'r') as z:
        sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
        strings = [''.join([t.text or '' for t in si.findall('.//ns:t', ns)]) for si in sst.findall('.//ns:si', ns)]
        sheet_specs = [
            (2, 'xl/worksheets/sheet1.xml', 'tymm'), (3, 'xl/worksheets/sheet2.xml', 'tymm'),
            (4, 'xl/worksheets/sheet3.xml', 'standard'), (5, 'xl/worksheets/sheet4.xml', 'tymm'),
            (6, 'xl/worksheets/sheet5.xml', 'tymm'), (7, 'xl/worksheets/sheet6.xml', 'standard'),
            (8, 'xl/worksheets/sheet7.xml', 'standard'),
        ]
        for grade, sheet, mode in sheet_specs:
            gp = GradePlan(grade, 'THEME' if mode == 'tymm' else 'UNIT')
            root = ET.fromstring(z.read(sheet))
            last = None  # (tür, tema no)
            for r in root.findall('.//ns:row', ns)[2:]:
                d = {}
                for c in r.findall('ns:c', ns):
                    v = c.find('ns:v', ns)
                    val = strings[int(v.text)] if v is not None and v.text is not None and c.attrib.get('t') == 's' else (v.text if v is not None else '')
                    d[''.join(filter(str.isalpha, c.attrib.get('r', '')))] = (val or '').strip()
                a, b, c_, dd, e, f = (d.get(k, '') for k in 'ABCDEF')
                important = d.get('L' if mode == 'tymm' else 'I', '')
                wm = re.search(r'Week\s*(\d+)[:\s]*(.*)', b, re.IGNORECASE | re.DOTALL)
                if not wm:
                    for t in (a, b, c_):
                        if t and HOLIDAY_RE.search(t):
                            gp.add_holiday(t)
                    continue
                cls = (classify_theme_cell(c_) if c_ and not c_.isdigit() else None) or classify_theme_cell(dd)
                if cls:
                    last = cls
                cls = cls or last
                if not cls:
                    continue
                wtype, unum, title = cls
                hours = int(c_) if c_.isdigit() else GRADE_METADATA[grade]['hours']
                rev_vocab = None
                if wtype == 'theme':
                    u = gp.unit(unum, title)
                    gp.absorb(u, e, f)
                    if mode == 'standard' and e:
                        sv, sf = extract_standard_vocab_and_functions(e)
                        u['targetVocab'] = list(dict.fromkeys(u['targetVocab'] + sv))
                        if sf and not u['functions']:
                            u['functions'] = sf
                elif wtype == 'revision' and e:
                    rev_vocab = extract_plan_vocab(e)
                gp.add_week(int(wm.group(1)), wm.group(2), hours, wtype, unum, important, rev_vocab)
            plans[grade] = gp
    return plans


def parse_docx_grade(grade, path):
    mode = DOCX_GRADES[grade]
    gp = GradePlan(grade, 'THEME')
    last = None
    for cells in read_docx_rows(path):
        joined = ' | '.join(cells)
        wk_idx = next((i for i, c in enumerate(cells) if re.search(r'\d+\.\s*Hafta', c)), None)
        if wk_idx is None:
            if HOLIDAY_RE.search(joined) and not re.search(r'THEME|ÖĞRENME|KAZANIM', joined):
                gp.add_holiday(joined)
                continue
            # Haftası olmayan tema içerik satırı (bir sonraki temanın içeriği önceden yazılmış)
            for c in cells:
                cls = classify_theme_cell(c)
                if cls and cls[0] == 'theme':
                    content = next((x for x in cells if 'Target Vocabulary' in x or 'Sub-theme' in x), '')
                    outcomes = next((x for x in cells if re.search(r'\bENG\.?\s*\d+\.\d+|\bE\d+\.\d+\.', x)), '')
                    gp.absorb(gp.unit(cls[1], cls[2]), content, outcomes)
                    break
            continue
        wm = re.search(r'(\d+)\.\s*Hafta:?\s*(.*)', cells[wk_idx], re.DOTALL)
        wn, dates_text = int(wm.group(1)), wm.group(2)
        rest = cells[wk_idx + 1:]
        hours = int(rest[0]) if rest and rest[0].strip().isdigit() else GRADE_METADATA[grade]['hours']
        cls = None
        for c in rest[1:3] if rest and rest[0].strip().isdigit() else rest[:2]:
            cls = classify_theme_cell(c)
            if cls:
                break
        if cls:
            last = cls
        cls = cls or last
        if not cls:
            continue
        wtype, unum, title = cls
        important = clean_text(cells[-1]) if len(cells) >= 9 else ''
        if re.search(r'THEME|Target|Students|ENG', important):
            important = ''
        rev_vocab = None
        if wtype == 'theme':
            u = gp.unit(unum, title)
            if mode == 'tymm':
                content = next((x for x in rest if 'Target Vocabulary' in x or 'Sub-theme' in x), '')
                outcomes = next((x for x in rest if re.search(r'\bENG\.?\s*\d+\.\d+', x)), '')
                gp.absorb(u, content, outcomes)
            else:
                # Eski program (11-12): KONU | KAZANIM | KAZANIM AÇIKLAMASI (işlevler + örnek cümleler)
                outcomes = next((x for x in rest if re.search(r'\bE\d+\.\d+\.', x)), '')
                expl = rest[rest.index(outcomes) + 1] if outcomes and rest.index(outcomes) + 1 < len(rest) else ''
                funcs = '; '.join(clean_text(re.sub(r'^\d+\.\s*', '', l)) for l in expl.split('\n') if re.match(r'^\s*\d+\.', l))
                gp.absorb(u, '', outcomes, funcs)
        elif wtype == 'revision':
            content = next((x for x in rest if 'Target Vocabulary' in x), '')
            rev_vocab = extract_plan_vocab(content)
        gp.add_week(wn, dates_text, hours, wtype, unum, important, rev_vocab)
    return gp


def _split_evenly(items, n):
    if n <= 0:
        return []
    size, extra = divmod(len(items), n)
    out, i = [], 0
    for k in range(n):
        step = size + (1 if k < extra else 0)
        out.append(items[i:i + step])
        i += step
    return out


def finalize_grade(gp):
    units = [gp.units[k] for k in sorted(gp.units)]
    weeks = [gp.weeks[k] for k in sorted(gp.weeks)]
    unit_nums = [u['unitNum'] for u in units]

    for u in units:
        kw = [k.lower().strip() for k in UNIT_KEYWORDS.get((gp.grade, u['unitNum']), [])]
        u['vocabSource'] = 'plan' if len(u['targetVocab']) >= 8 else 'estimated'
        if u['vocabSource'] == 'estimated':
            # Planda hedef kelime listesi yok (ör. 11-12. sınıf eski program): tema anahtar kelimeleri kullanılır
            u['targetVocab'] = list(dict.fromkeys(kw + u['targetVocab']))
        u['semanticKeywords'] = list(dict.fromkeys(kw + u['targetVocab'][:15]))
        if not u['subThemes']:
            u['subThemes'] = u['title']
        if not u['functions']:
            u['functions'] = ''
        if not u['outcomesList']:
            u['outcomes'] = ''

    # Tema dışı haftaları en yakın temaya bağla: hazırlık haftaları sonraki temaya, diğerleri önceki temaya
    for i, w in enumerate(weeks):
        if w['weekType'] == 'theme':
            continue
        prev_u = next((x['unitNum'] for x in reversed(weeks[:i]) if x['weekType'] == 'theme'), None)
        next_u = next((x['unitNum'] for x in weeks[i + 1:] if x['weekType'] == 'theme'), None)
        if w['weekType'] in ('orientation', 'revision'):
            w['unitNum'] = next_u or prev_u or unit_nums[0]
        else:
            w['unitNum'] = prev_u or next_u or unit_nums[0]

    # Haftalık ilerleme: temanın kelimeleri ders haftalarına sırayla bölünür
    for u in units:
        tw = [w for w in weeks if w['weekType'] == 'theme' and w['unitNum'] == u['unitNum']]
        for w, chunk in zip(tw, _split_evenly(u['targetVocab'], len(tw))):
            w['targetWords'] = chunk
    year_review = [v for u in units for v in u['targetVocab'][:3]]
    for w in weeks:
        if w['weekType'] == 'theme':
            continue
        u = gp.units.get(w['unitNum'])
        if w['weekType'] == 'revision' and len(w['_revisionVocab']) >= 8:
            w['targetWords'] = w['_revisionVocab'][:20]
        elif w['weekType'] in ('orientation', 'revision'):
            w['targetWords'] = []          # build_full_curriculum_registry önceki sınıfın tekrarıyla doldurur
        elif w['weekType'] == 'social':
            w['targetWords'] = year_review[:24]                       # yıl sonu genel tekrar
        else:
            w['targetWords'] = (u['targetVocab'] if u else [])[:12]   # bitmiş temanın tekrarı
    for w in weeks:
        w.pop('_revisionVocab', None)
        en, tr = WEEK_TYPE_LABELS[w['weekType']]
        w['label'] = en
        w['labelTr'] = tr
        u = gp.units.get(w['unitNum'])
        w['unitTitle'] = u['title'] if u else ''
        w['focus'] = (tr + ' • ' + u['title']) if (w['weekType'] != 'theme' and u) else (u['subThemes'][:160] if u else tr)
    return units, weeks


def grade1_placeholder(reference_weeks):
    """1. sınıf için yıllık plan yok: mevcut 10 ünite, 2. sınıfın gerçek takvim haftalarına yayılır."""
    units = []
    titles = ["HELLO & GREETINGS", "MY FAMILY & FRIENDS", "COLORS & RAINBOW", "NUMBERS 1-10", "CLASSROOM & TOYS",
              "ANIMALS & PETS", "MY BODY", "FRUITS & SNACKS", "ACTION & MOVEMENT", "NATURE & WEATHER"]
    for n, t in enumerate(titles, 1):
        kw = UNIT_KEYWORDS.get((1, n), [])
        units.append({'unitNum': n, 'code': f'UNIT {n}', 'title': t, 'titleTr': UNIT_TITLES_TR.get((1, n), t),
                      'subThemes': t, 'functions': '', 'outcomes': '', 'outcomesList': [],
                      'targetVocab': list(kw), 'semanticKeywords': list(kw), 'vocabSource': 'estimated'})
    weeks = [dict(w) for w in reference_weeks]
    teach = [w for w in weeks if w['weekType'] == 'theme']
    for i, w in enumerate(teach):
        w['unitNum'] = units[min(len(units) - 1, i * len(units) // max(1, len(teach)))]['unitNum']
    for i, w in enumerate(weeks):
        if w['weekType'] != 'theme':
            w['unitNum'] = next((x['unitNum'] for x in weeks[i:] if x['weekType'] == 'theme'), units[-1]['unitNum'])
    for u in units:
        tw = [w for w in weeks if w['weekType'] == 'theme' and w['unitNum'] == u['unitNum']]
        for w, chunk in zip(tw, _split_evenly(u['targetVocab'], len(tw))):
            w['targetWords'] = chunk
    for w in weeks:
        u = units[w['unitNum'] - 1]
        if w['weekType'] != 'theme':
            w['targetWords'] = []
        w['unitTitle'] = u['title']
        w['focus'] = u['title'] if w['weekType'] == 'theme' else w['labelTr']
        w['hours'] = GRADE_METADATA[1]['hours']
    return units, weeks


def build_full_curriculum_registry():
    log("Tüm 1-12 sınıf müfredat veritabanı yıllık planlardan inşa ediliyor...")
    plans = parse_excel_grades()
    for g in (9, 10, 11, 12):
        path = os.path.join(DOCX_PLAN_DIR, f'{ACADEMIC_START_YEAR}-{ACADEMIC_START_YEAR + 1}-{g}-sinif-ingilizce-yillik-plan.docx')
        if os.path.exists(path):
            plans[g] = parse_docx_grade(g, path)
        else:
            log(f"UYARI: {g}. sınıf yıllık planı bulunamadı: {path}")

    by_name = {}
    from datetime import date as _d
    span = lambda h: (_d.fromisoformat(h['end']) - _d.fromisoformat(h['start'])).days
    for gp in plans.values():
        for h in gp.holidays:
            cur = by_name.get(h['name'])
            if cur is None or span(h) > span(cur) or (span(h) == span(cur) and h['start'] < cur['start']):
                by_name[h['name']] = h
    holidays = sorted(by_name.values(), key=lambda h: h['start'])

    registry = {}
    built = {g: finalize_grade(gp) for g, gp in plans.items()}
    if 2 in built:
        built[1] = grade1_placeholder(built[2][1])

    # Yıl başı tekrar (revision) haftaları: kendi listesi yoksa ÖNCEKİ SINIFIN temel kelimeleri
    # (ör. 5. sınıfın revizyonu 4. sınıfı tekrar eder). Her temadan ilk kelimeler, haftalara bölünür.
    for g, (units, weeks) in built.items():
        rev = [w for w in weeks if w['weekType'] == 'revision' and not w.get('targetWords')]
        if not rev or (g - 1) not in built:
            continue
        prev_units = built[g - 1][0]
        per_unit = max(2, (12 * len(rev)) // max(1, len(prev_units)))
        pool = list(dict.fromkeys(v for u in prev_units for v in u['targetVocab'][:per_unit]))
        for w, chunk in zip(rev, _split_evenly(pool, len(rev))):
            w['targetWords'] = chunk
            w['focus'] = f"{w['labelTr']} • {g - 1}. sınıf tekrarı"
            w['revisionOfGrade'] = g - 1
    for g in range(1, 13):
        if g not in built:
            continue
        units, weeks = built[g]
        meta = GRADE_METADATA[g]
        registry[g] = {
            'grade': g, 'name': meta['name'], 'stage': meta['stage'], 'stageTr': meta['stageTr'],
            'cefr': meta['cefr'], 'hours': meta['hours'], 'badge': meta['badge'],
            'hasPlan': g != 1,
            'units': units, 'calendar': weeks
        }
        log(f"{g:>2}. sınıf: {len(units)} tema/ünite, {len(weeks)} hafta, "
            f"{sum(len(u['targetVocab']) for u in units)} hedef kelime "
            f"({sum(1 for u in units if u.get('vocabSource') == 'plan')} tema plandan)")
    registry['_calendar'] = {'academicYear': f'{ACADEMIC_START_YEAR}-{ACADEMIC_START_YEAR + 1}', 'holidays': holidays}
    return registry


def generate_curriculum_javascript(registry):
    log("curriculum-data.js derleniyor...")

    registry = dict(registry)
    academic_calendar = registry.pop('_calendar', {'academicYear': '', 'holidays': []})
    canonical_index = {}
    for g_num, g_data in registry.items():
        for u in g_data['units']:
            for w in u['targetVocab']:
                w_clean = w.lower().strip()
                if len(w_clean) > 1 and w_clean not in canonical_index:
                    canonical_index[w_clean] = {
                        'grade': g_num,
                        'gradeName': g_data['name'],
                        'unitNum': u['unitNum'],
                        'unitTitle': u['title'],
                        'unitTitleTr': u['titleTr'],
                        'code': u['code']
                    }

    registry_json = json.dumps(registry, ensure_ascii=False, separators=(',', ':'))
    canonical_index_json = json.dumps(canonical_index, ensure_ascii=False, separators=(',', ':'))
    # Ana sözlük + yıllık plan kelimeleri için ek çeviriler (ana sözlükteki kayıtların üzerine yazılmaz)
    merged_dict = dict(CURRICULUM_DEFINITIONS)
    for en, (tr, pos) in CURRICULUM_EXTRA_TRANSLATIONS.items():
        if en in merged_dict:
            continue
        proper = tr[:1].isupper() and pos == 'noun'          # ülke, kıta, gezegen vb. özel isimler
        merged_dict[en] = {
            'en': ' '.join(x if x in ('of', 'and') else x.capitalize() for x in en.split()) if proper else en,
            'tr': tr, 'pos': pos, 'desc': '', 'cefr': '', 'phonetic': '', 'example': ''
        }
    curriculum_dict_json = json.dumps(merged_dict, ensure_ascii=False, separators=(',', ':'))
    academic_calendar_json = json.dumps(academic_calendar, ensure_ascii=False, separators=(',', ':'))

    js_code = f"""/**
 * Learnish - K-12 MEB İngilizce Müfredatı ve Bağlama (Curriculum Context Classifier) Motoru
 * Kapsam: 1. Sınıftan 12. Sınıfa Kadar Haftalık Planlar, Kazanımlar ve Akıllı Ünite Sınıflandırıcısı
 * Lisans: MEB Çerçeve Planı & The Oxford 5000 Entegrasyonu
 */

(function () {{
  'use strict';

  // 1. K-12 Tam Müfredat Veritabanı (1. Sınıf - 12. Sınıf)
  const CURRICULUM_DATA = {registry_json};

  // 1b. Akademik takvim: yıllık planlardan okunan tatiller (start/end ISO, full = tüm haftayı kapsar)
  const ACADEMIC_CALENDAR = {academic_calendar_json};

  // 2. Kanonik Kelime Ters Dizin (O(1) Hızlı Erişim)
  const CANONICAL_VOCAB_INDEX = {canonical_index_json};

  // 3. Müfredat Hedef Kelimeleri Sözlüğü (Özgün Türkçe Sözlük Karşılıkları)
  const CURRICULUM_DICTIONARY = {curriculum_dict_json};

  // 4. Semantik Konu Küme Vektörleri (Domain Clusters)
  const DOMAIN_CLUSTERS = [
    {{
      id: 'food_kitchen',
      grades: [{{ g: 8, u: 3 }}, {{ g: 4, u: 10 }}, {{ g: 10, u: 7 }}, {{ g: 2, u: 6 }}],
      keywords: ['kitchen', 'recipe', 'cook', 'bake', 'ingredient', 'meal', 'food', 'dish', 'fry', 'boil', 'taste', 'delicious', 'spice', 'oven', 'pan', 'knife', 'pot', 'chop', 'dice', 'slice', 'peel', 'grate', 'stir', 'pour', 'spicy', 'sweet', 'sour', 'salty', 'bitter', 'snack', 'beverage', 'cuisine', 'gastronomy', 'gourmet']
    }},
    {{
      id: 'natural_disasters_forces',
      grades: [{{ g: 8, u: 10 }}, {{ g: 7, u: 9 }}, {{ g: 12, u: 8 }}, {{ g: 6, u: 7 }}],
      keywords: ['natural', 'force', 'disaster', 'drought', 'earthquake', 'flood', 'avalanche', 'tornado', 'erosion', 'global warming', 'destruction', 'catastrophe', 'hurricane', 'landslide', 'tsunami', 'volcano', 'survivor', 'rescue', 'pollution', 'climate', 'renewable', 'carbon', 'biodiversity', 'ecosystem', 'conservation', 'sustainability']
    }},
    {{
      id: 'space_astronomy',
      grades: [{{ g: 7, u: 10 }}, {{ g: 5, u: 8 }}, {{ g: 12, u: 4 }}],
      keywords: ['planet', 'orbit', 'solar system', 'galaxy', 'space', 'astronaut', 'gravity', 'moon', 'mars', 'satellite', 'universe', 'telescope', 'atmosphere', 'spacecraft', 'meteor', 'futuristic', 'alien', 'shuttle']
    }},
    {{
      id: 'technology_internet',
      grades: [{{ g: 8, u: 5 }}, {{ g: 10, u: 8 }}, {{ g: 12, u: 9 }}],
      keywords: ['internet', 'online', 'download', 'upload', 'browser', 'website', 'account', 'password', 'social media', 'network', 'connect', 'software', 'artificial intelligence', 'algorithm', 'cybersecurity', 'virtual', 'device', 'gadget', 'app', 'digital', 'search engine']
    }},
    {{
      id: 'friendship_relationships',
      grades: [{{ g: 8, u: 1 }}, {{ g: 12, u: 2 }}, {{ g: 11, u: 9 }}, {{ g: 1, u: 2 }}],
      keywords: ['friend', 'friendship', 'buddy', 'mate', 'trust', 'support', 'count on', 'back up', 'loyal', 'secret', 'honest', 'share', 'reliable', 'argue', 'apologize', 'camaraderie', 'companionship', 'reconcile']
    }},
    {{
      id: 'science_experiments',
      grades: [{{ g: 8, u: 9 }}, {{ g: 4, u: 6 }}],
      keywords: ['science', 'scientific', 'experiment', 'scientist', 'invent', 'invention', 'discover', 'discovery', 'lab', 'laboratory', 'test tube', 'high-tech', 'cell', 'vaccine', 'cure', 'formula', 'hypothesis']
    }},
    {{
      id: 'jobs_career',
      grades: [{{ g: 4, u: 7 }}, {{ g: 11, u: 1 }}, {{ g: 6, u: 4 }}],
      keywords: ['job', 'profession', 'career', 'work', 'doctor', 'nurse', 'teacher', 'vet', 'fireman', 'policeman', 'pilot', 'chef', 'farmer', 'architect', 'engineer', 'salary', 'resume', 'interview', 'occupation']
    }},
    {{
      id: 'chores_housework',
      grades: [{{ g: 8, u: 8 }}, {{ g: 4, u: 5 }}],
      keywords: ['chore', 'housework', 'laundry', 'dishes', 'clean', 'tidy', 'iron', 'trash', 'garbage', 'vacuum', 'dust', 'sweep', 'bed', 'dishwasher', 'obligation', 'responsibility']
    }},
    {{
      id: 'tourism_travel',
      grades: [{{ g: 8, u: 7 }}, {{ g: 10, u: 5 }}, {{ g: 9, u: 1 }}],
      keywords: ['tourism', 'travel', 'tourist', 'historic site', 'architecture', 'all-inclusive', 'resort', 'attraction', 'destination', 'monument', 'flight', 'journey', 'luggage', 'passport', 'visa', 'sightseeing', 'itinerary']
    }},
    {{
      id: 'sports_fitness',
      grades: [{{ g: 7, u: 2 }}, {{ g: 11, u: 8 }}, {{ g: 4, u: 4 }}],
      keywords: ['sport', 'sports', 'tournament', 'athlete', 'athletics', 'championship', 'olympic', 'marathon', 'fitness', 'workout', 'stadium', 'medal', 'trophy', 'score', 'match', 'gym', 'jogging', 'swimming', 'skating']
    }},
    {{
      id: 'appearance_personality',
      grades: [{{ g: 7, u: 1 }}, {{ g: 4, u: 9 }}, {{ g: 6, u: 3 }}],
      keywords: ['appearance', 'personality', 'attractive', 'cute', 'generous', 'honest', 'outgoing', 'punctual', 'selfish', 'slim', 'smart', 'stubborn', 'handsome', 'beautiful', 'tall', 'short', 'curly', 'straight', 'blonde', 'beard', 'moustache']
    }},
    {{
      id: 'psychology_mind',
      grades: [{{ g: 12, u: 5 }}],
      keywords: ['psychology', 'subconscious', 'cognition', 'cognitive', 'mental health', 'therapy', 'depression', 'stress', 'mind', 'perception', 'behavior', 'emotional intelligence', 'psychotherapy']
    }},
    {{
      id: 'human_rights_society',
      grades: [{{ g: 12, u: 3 }}, {{ g: 11, u: 10 }}, {{ g: 12, u: 6 }}],
      keywords: ['human rights', 'equality', 'freedom', 'justice', 'citizenship', 'peace', 'dignity', 'law', 'democracy', 'solidarity', 'volunteer', 'ethics', 'morals', 'civic', 'constitution']
    }},
    {{
      id: 'music_arts',
      grades: [{{ g: 12, u: 1 }}, {{ g: 11, u: 2 }}],
      keywords: ['music', 'melody', 'rhythm', 'symphony', 'orchestra', 'acoustic', 'harmony', 'instrument', 'lyrics', 'composer', 'genre', 'art', 'theatre', 'performance']
    }},
    {{
      id: 'school_classroom',
      grades: [{{ g: 2, u: 1 }}, {{ g: 4, u: 1 }}, {{ g: 5, u: 1 }}, {{ g: 10, u: 1 }}, {{ g: 1, u: 5 }}],
      keywords: ['school', 'classroom', 'teacher', 'pupil', 'student', 'pencil', 'pen', 'desk', 'ruler', 'eraser', 'notebook', 'book', 'blackboard', 'rules', 'homework', 'timetable', 'subject', 'exam', 'kindergarten', 'preschool']
    }}
  ];

  // 4. Akıllı Bağlama (Context Classifier) Motoru
  const CURRICULUM_CLASSIFIER = {{
    /**
     * Herhangi bir İngilizce kelimeyi veya kelime nesnesini en uygun 1-12 sınıf ve ünitesine bağlar.
     * @param {{string|object}} wordInput - Kelime dizesi veya WORDS_DATA öğesi
     * @param {{number|null}} gradeFilter - İsteğe bağlı belirli bir sınıf odaklaması (1-12)
     * @returns {{object}} Sınıflandırma sonucu, eşleşen ünite, güven skoru ve pedagojik açıklama
     */
    classify(wordInput, gradeFilter = null) {{
      const wordStr = typeof wordInput === 'string' ? wordInput : (wordInput?.en || '');
      const cleanWord = wordStr.toLowerCase().trim().replace(/[^a-z0-9\\s-]/g, '');
      const cefr = (typeof wordInput === 'object' && wordInput?.cefr) ? wordInput.cefr.toUpperCase() : '';
      const def = (typeof wordInput === 'object' && (wordInput?.definition || wordInput?.desc || wordInput?.tr)) ? (wordInput.definition + ' ' + wordInput.desc + ' ' + wordInput.tr).toLowerCase() : '';

      if (!cleanWord) {{
        return {{
          grade: 5,
          gradeName: '5. Sınıf',
          unitNum: 1,
          unitTitle: 'SCHOOL LIFE',
          unitTitleTr: 'Okul Yaşamı',
          confidence: 0.1,
          matchType: 'fallback',
          rationale: 'Kelime tanımlanamadığı için varsayılan okul bağlamına yönlendirildi.',
          alternateMatches: []
        }};
      }}

      // A. Kanonik Eşleşme (Doğrudan Yıllık Planda Yer Alan Kelime)
      if (CANONICAL_VOCAB_INDEX[cleanWord]) {{
        const canon = CANONICAL_VOCAB_INDEX[cleanWord];
        if (!gradeFilter || canon.grade === gradeFilter) {{
          return {{
            grade: canon.grade,
            gradeName: canon.gradeName,
            unitNum: canon.unitNum,
            unitTitle: canon.unitTitle,
            unitTitleTr: canon.unitTitleTr,
            confidence: 0.99,
            matchType: 'canonical_curriculum',
            rationale: `"${{cleanWord}}" kelimesi ${{canon.gradeName}} ${{canon.unitTitle}} (${{canon.unitTitleTr}}) ünitesinin temel kazanım kelimeleri arasındadır.`,
            alternateMatches: []
          }};
        }}
      }}

      // B. Semantik Küme Eşleşmesi (Domain Clusters)
      const scoredUnits = [];
      const wordTokens = cleanWord.split(/[\\s-]+/);

      for (const cluster of DOMAIN_CLUSTERS) {{
        let clusterScore = 0;
        for (const kw of cluster.keywords) {{
          if (cleanWord === kw) {{
            clusterScore += 1.0;
          }} else if (cleanWord.length >= 5 && kw.length >= 5 && (cleanWord.startsWith(kw) || kw.startsWith(cleanWord))) {{
            clusterScore += 0.75;
          }} else if (wordTokens.some(tok => tok.length >= 4 && kw.split(/[\\s-]+/).includes(tok))) {{
            clusterScore += 0.6;
          }} else if (def && (def.includes(' ' + kw + ' ') || def.startsWith(kw + ' ') || def.endsWith(' ' + kw))) {{
            clusterScore += 0.35;
          }}
        }}

        if (clusterScore > 0) {{
          for (const target of cluster.grades) {{
            if (gradeFilter && target.g !== gradeFilter) continue;
            const gData = CURRICULUM_DATA[target.g];
            if (!gData) continue;
            const uData = gData.units.find(u => u.unitNum === target.u);
            if (!uData) continue;

            let cefrBonus = 0;
            if (cefr) {{
              if ((cefr === 'A1' || cefr === 'A2') && target.g <= 6) cefrBonus = 0.15;
              else if ((cefr === 'B1' || cefr === 'B2') && target.g >= 7 && target.g <= 10) cefrBonus = 0.15;
              else if (cefr === 'C1' && target.g >= 11) cefrBonus = 0.15;
            }}

            const finalScore = Math.min(0.96, (clusterScore * 0.4) + cefrBonus + (target.g === 8 ? 0.05 : 0));
            scoredUnits.push({{
              grade: target.g,
              gradeName: gData.name,
              unitNum: target.u,
              unitTitle: uData.title,
              unitTitleTr: uData.titleTr,
              score: finalScore,
              rationale: `"${{cleanWord}}" kelimesi ${{cluster.id.replace(/_/g, ' ')}} tematik bağlamı ile ${{gData.name}} ${{uData.title}} (${{uData.titleTr}}) ünitesine bağlanmıştır.`
            }});
          }}
        }}
      }}

      // C. Ünite İçi Kelime Benzerliği Araması
      if (scoredUnits.length === 0) {{
        for (const [gKey, gData] of Object.entries(CURRICULUM_DATA)) {{
          const gNum = parseInt(gKey, 10);
          if (gradeFilter && gNum !== gradeFilter) continue;
          for (const u of gData.units) {{
            let matchCount = 0;
            for (const kw of u.semanticKeywords) {{
              if (cleanWord === kw) {{
                matchCount += 2;
              }} else if (cleanWord.length >= 4 && kw.length >= 4 && (cleanWord.startsWith(kw) || kw.startsWith(cleanWord))) {{
                matchCount += 1;
              }} else if (def && (def.includes(' ' + kw + ' ') || def.startsWith(kw + ' ') || def.endsWith(' ' + kw))) {{
                matchCount += 1;
              }}
            }}
            if (matchCount > 0) {{
              scoredUnits.push({{
                grade: gNum,
                gradeName: gData.name,
                unitNum: u.unitNum,
                unitTitle: u.title,
                unitTitleTr: u.titleTr,
                score: Math.min(0.85, matchCount * 0.25),
                rationale: `"${{cleanWord}}" kelimesi anahtar kavram benzerliğiyle ${{gData.name}} ${{u.title}} (${{u.titleTr}}) ünitesine bağlanmıştır.`
              }});
            }}
          }}
        }}
      }}

      scoredUnits.sort((a, b) => b.score - a.score);

      if (scoredUnits.length > 0) {{
        const best = scoredUnits[0];
        const alternates = scoredUnits.slice(1, 4).map(s => ({{
          grade: s.grade,
          gradeName: s.gradeName,
          unitNum: s.unitNum,
          unitTitle: s.unitTitle,
          unitTitleTr: s.unitTitleTr,
          confidence: Math.round(s.score * 100) / 100
        }}));

        return {{
          grade: best.grade,
          gradeName: best.gradeName,
          unitNum: best.unitNum,
          unitTitle: best.unitTitle,
          unitTitleTr: best.unitTitleTr,
          confidence: Math.round(best.score * 100) / 100,
          matchType: 'semantic_affinity',
          rationale: best.rationale,
          alternateMatches: alternates
        }};
      }}

      let defaultGrade = 5;
      let defaultUnit = 1;
      if (cefr === 'A1') {{ defaultGrade = 2; defaultUnit = 1; }}
      else if (cefr === 'A2') {{ defaultGrade = 5; defaultUnit = 1; }}
      else if (cefr === 'B1') {{ defaultGrade = 8; defaultUnit = 2; }}
      else if (cefr === 'B2' || cefr === 'C1') {{ defaultGrade = 11; defaultUnit = 1; }}
      
      const defGradeData = CURRICULUM_DATA[defaultGrade];
      const defUnitData = defGradeData.units[0];

      return {{
        grade: defaultGrade,
        gradeName: defGradeData.name,
        unitNum: defUnitData.unitNum,
        unitTitle: defUnitData.title,
        unitTitleTr: defUnitData.titleTr,
        confidence: 0.50,
        matchType: 'cefr_heuristic',
        rationale: `"${{cleanWord}}" genel kelime havuzundan CEFR (${{cefr || 'A1-B1'}}) seviyesine göre ${{defGradeData.name}} ${{defUnitData.title}} ünitesiyle ilişkilendirildi.`,
        alternateMatches: []
      }};
    }},

    /**
     * Verilen sınıf ve tarihe göre o haftanın müfredat kaydını döndürür.
     * Tarih tahmini YAPILMAZ: yıllık plandaki gerçek hafta tarihleri (start/end) okunur.
     *  - Ders haftası içindeyse o hafta
     *  - Hafta sonu / tatil / haftalar arası boşlukta: en son başlamış hafta (tekrar için)
     *  - Yıl başlamadan önce: 1. hafta; yıl bittikten sonra: son hafta
     * Tatil günlerinde isBreak=true ve breakName döner.
     */
    getSchedule(grade = 5, date = new Date()) {{
      const gNum = Math.max(1, Math.min(12, parseInt(grade, 10) || 5));
      const gData = CURRICULUM_DATA[gNum] || CURRICULUM_DATA[5];
      const iso = toISODate(date);
      const cal = gData.calendar;
      let idx = -1;
      for (let i = 0; i < cal.length; i++) {{
        if (cal[i].start && cal[i].start <= iso) idx = i;
      }}
      if (idx < 0) idx = 0;
      const w = cal[idx];
      const inWeek = !!(w.start && w.end && iso >= w.start && iso <= w.end);
      const holiday = (ACADEMIC_CALENDAR.holidays || []).find(h => h.full && iso >= h.start && iso <= h.end) || null;
      return Object.assign(buildWeekInfo(gNum, gData, w), {{
        isCurrentWeek: inWeek,
        isBreak: !!holiday,
        breakName: holiday ? holiday.name : '',
        isWeekend: [0, 6].includes(date.getDay()),
        isBeforeYear: !!(cal[0].start && iso < cal[0].start),
        isAfterYear: !!(cal[cal.length - 1].end && iso > cal[cal.length - 1].end)
      }});
    }},

    /**
     * Belirli bir sınıf ve haftanın takvim kaydını döndürür.
     */
    getWeekByNumber(grade, weekNum) {{
      const gNum = Math.max(1, Math.min(12, parseInt(grade, 10) || 5));
      const gData = CURRICULUM_DATA[gNum] || CURRICULUM_DATA[5];
      const w = gData.calendar.find(x => x.weekNum === weekNum) || gData.calendar[0];
      return buildWeekInfo(gNum, gData, w);
    }},

    /** Akademik takvim (tatiller) */
    getAcademicCalendar() {{
      return ACADEMIC_CALENDAR;
    }}
  }};

  function toISODate(d) {{
    const pad = n => String(n).padStart(2, '0');
    return `${{d.getFullYear()}}-${{pad(d.getMonth() + 1)}}-${{pad(d.getDate())}}`;
  }}

  function buildWeekInfo(gNum, gData, w) {{
    const u = gData.units.find(x => x.unitNum === w.unitNum) || gData.units[0];
    return {{
      grade: gNum,
      gradeName: gData.name,
      stage: gData.stage,
      stageTr: gData.stageTr,
      badge: gData.badge,
      weekNum: w.weekNum,
      weekType: w.weekType,
      weekLabel: w.label,
      weekLabelTr: w.labelTr,
      month: w.month,
      dates: w.dates,
      start: w.start,
      end: w.end,
      hours: w.hours,
      unitNum: u.unitNum,
      unitCode: u.code,
      unitTitle: u.title,
      unitTitleTr: u.titleTr,
      focus: w.focus || u.subThemes || u.title,
      functions: u.functions,
      outcomes: u.outcomes,
      outcomesList: u.outcomesList || [],
      targetWords: Array.isArray(w.targetWords) ? w.targetWords : [],
      importantDays: w.importantDays
    }};
  }}

  if (typeof window !== 'undefined') {{
    window.CURRICULUM_DATA = CURRICULUM_DATA;
    window.CURRICULUM_CLASSIFIER = CURRICULUM_CLASSIFIER;
    window.CURRICULUM_DICTIONARY = CURRICULUM_DICTIONARY;
    window.ACADEMIC_CALENDAR = ACADEMIC_CALENDAR;
  }}
  if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ CURRICULUM_DATA, CURRICULUM_CLASSIFIER, CURRICULUM_DICTIONARY, ACADEMIC_CALENDAR }};
  }}

}})();
"""

    with open(OUTPUT_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_code)
    log(f"✅ {OUTPUT_JS_PATH} dosyası başarıyla üretildi ({len(js_code.encode('utf-8')):,} byte).")

if __name__ == '__main__':
    reg = build_full_curriculum_registry()
    generate_curriculum_javascript(reg)
    log("Tüm K-12 müfredat derleme süreci başarıyla tamamlandı.")
