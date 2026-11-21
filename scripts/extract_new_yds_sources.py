#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract, normalize, and deduplicate new YDS/YÖKDİL words from the 3 added PDF sources:
1. belgeler/yds-en-cok-cikan-kelime-listesi.pdf (Akın Dil)
2. belgeler/zafer-hoca-yds-ve-yokdil-cikmis-kelimeler-modulu.pdf (Zafer Hoca)
3. belgeler/1522587989-444240.pdf (Önemli İsimler + Diğer Yapıları)

Outputs staged JSON and 4 equal chunks for contextual enrichment without modifying
any existing records in belgeler/kelimeler_havuzu.json.
"""

import os
import sys
import re
import json
import fitz

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
import build  # noqa: E402

PDF1_PATH = os.path.join(BASE_DIR, 'belgeler', 'yds-en-cok-cikan-kelime-listesi.pdf')
PDF2_PATH = os.path.join(BASE_DIR, 'belgeler', 'zafer-hoca-yds-ve-yokdil-cikmis-kelimeler-modulu.pdf')
PDF3_PATH = os.path.join(BASE_DIR, 'belgeler', '1522587989-444240.pdf')
POOL_PATH = os.path.join(BASE_DIR, 'belgeler', 'kelimeler_havuzu.json')

DEFAULT_SCRATCH_DIR = '/Users/erencekin/.gemini/antigravity/brain/31033069-b1e7-4f79-b150-84cf57e6b99d/scratch'

# Verified spelling/slash/identical-plural variants already present in the 9,186-word pool
SKIP_ALREADY_IN_POOL = {
    'colonize', 'defense', 'familiarize', 'fertilize', 'industrialization',
    'industrialized', 'jeopardize', 'judgment', 'recognizable', 'revolutionize',
    'sterilize', 'utilization',
    'depend on', 'rely on', 'okay (ok)',
    'allocations', 'components', 'intestines', 'troops', 'headphone',
}

TURKISH_LOWER_MAP = str.maketrans({
    'İ': 'i',
    'I': 'ı',
    'Ç': 'ç',
    'Ğ': 'ğ',
    'Ö': 'ö',
    'Ş': 'ş',
    'Ü': 'ü',
    'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd', 'E': 'e', 'F': 'f', 'G': 'g',
    'H': 'h', 'J': 'j', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'O': 'o',
    'P': 'p', 'Q': 'q', 'R': 'r', 'S': 's', 'T': 't', 'U': 'u', 'V': 'v',
    'W': 'w', 'X': 'x', 'Y': 'y', 'Z': 'z',
})

ACRONYM_PATTERN = re.compile(r'\b(tv|vip|abd|dna|gps|aids|nasa)\b')


def tr_lower(text):
    s = (text or '').translate(TURKISH_LOWER_MAP)
    s = s.replace('\u0307', '')
    return s


def clean_tr(text, force_lower=True):
    s = re.sub(r'[\r\n]+', ' ', text or '')
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.strip(' ,;.')
    if force_lower:
        s = tr_lower(s)
        s = ACRONYM_PATTERN.sub(lambda m: m.group(1).upper(), s)
        # Restore English ASCII 'i' inside English parenthetical notes
        for wrong, right in [
            ('ımportant', 'important'),
            ('ınfluence', 'influence'),
            ('ıntangible', 'intangible'),
            ("ı'm fed up", "I'm fed up"),
            ("ı’m fed up", "I'm fed up"),
            ("ıt's up to you", "it's up to you"),
            ("ıt’s up to you", "it's up to you"),
        ]:
            s = s.replace(wrong, right)
    else:
        s = s.replace('\u0307', '')
    return s


def js_norm_key(en_str):
    s = (en_str or '').strip().lower()
    s = re.sub(r'[\.\!\?,;:]+$', '', s)
    return re.sub(r'[\s\-_~]+', '', s)


def normalize_headword(raw_en):
    """Return list of (normalized_en, override_tr_or_none) tuples."""
    s = re.sub(r'\s+', ' ', (raw_en or '').strip())
    s = s.replace('’', "'").replace('‘', "'")
    low = s.lower().rstrip(':.,;!? ')
    if low == 'set off, out':
        return [('set off', None), ('set out', None)]
    if low == "what's more":
        return [("what's more", None)]
    if low == "what's its (his/her) name":
        return [("what's its name", 'bilmem kim (birisinin adını unutma)')]
    if low in ('v.i.p.', 'v.i.p'):
        return [('VIP', None)]
    if low == 'assuming (that)':
        return [('assuming that', None)]
    if low == 'water-colours':
        return [('watercolours', None)]
    cleaned = build.clean_word_string(s)
    cleaned = cleaned.replace('’', "'").replace('‘', "'").rstrip(':.,;!? ').strip()
    return [(cleaned, None)]


def normalize_pdf3_pos(pos_raw):
    p = tr_lower(pos_raw).strip()
    mapping = {
        'isim': 'isim',
        'fiil': 'fiil',
        'sıfat': 'sıfat',
        'zarf': 'zarf',
        'p. verb': 'kalıp (phrasal/prep verb)',
        'p. phrase': 'kalıp',
        'phrase': 'kalıp',
        'modal': 'kalıp',
        'preposition': 'edat',
        'bağlaç': 'bağlaç',
    }
    return mapping.get(p, p)


def parse_pdf1():
    doc = fitz.open(PDF1_PATH)
    rows = []
    for pno in range(1, len(doc)):
        body = [w for w in doc[pno].get_text('words') if 88 < w[1] < 820]
        for x_min, x_split, x_max in [(0, 175, 310), (310, 420, 600)]:
            col = [w for w in body if x_min <= w[0] < x_max]
            en_w = [w for w in col if w[0] < x_split]
            tr_w = [w for w in col if w[0] >= x_split]
            lines = []
            for w in sorted(en_w, key=lambda a: (a[1], a[0])):
                if lines and abs(w[1] - lines[-1]['y']) < 4.5:
                    lines[-1]['words'].append(w[4])
                else:
                    lines.append({'y': w[1], 'words': [w[4]]})
            for i, el in enumerate(lines):
                y0 = el['y']
                ny = lines[i + 1]['y'] if i + 1 < len(lines) else 900
                tr_c = [w for w in sorted(tr_w, key=lambda a: (round(a[1] / 3), a[0])) if y0 - 4 <= w[1] < ny - 4]
                en_str = ' '.join(el['words']).strip()
                tr_str = ' '.join(w[4] for w in tr_c).strip()
                assert en_str and tr_str, f"PDF1 empty field on page {pno+1}: en={en_str!r}, tr={tr_str!r}"
                rows.append(('pdf1', en_str, tr_str, ''))
    assert len(rows) == 452, f"Expected 452 rows in PDF1, got {len(rows)}"
    return rows


def parse_pdf2():
    doc = fitz.open(PDF2_PATH)
    rows = []
    seen_sns = []
    for pno in range(2, 41):
        words = doc[pno].get_text('words')
        sn_hdr = [w for w in words if w[4] == 'S.N' and w[1] < 160]
        min_y = (sn_hdr[0][3] + 15) if sn_hdr else 90
        footer = [w for w in words if w[1] > 780 and w[4] in ('Ücretsiz', 'AKADEMİSİ', 'zaferhoca.com.tr', 'D')]
        max_y = min((w[1] for w in footer), default=800) - 2
        body = [w for w in words if min_y <= w[1] < max_y]
        anchors = sorted([w for w in body if w[2] < 78 and w[4].isdigit()], key=lambda a: a[1])
        for i, anc in enumerate(anchors):
            y0 = anc[1]
            ny = anchors[i + 1][1] if i + 1 < len(anchors) else max_y
            rw = [w for w in body if y0 - 3 <= w[1] < ny - 3]
            en_str = ' '.join(w[4] for w in sorted(rw, key=lambda a: (round(a[1] / 3), a[0])) if 78 <= w[0] < 178).strip()
            tr_str = ' '.join(w[4] for w in sorted(rw, key=lambda a: (round(a[1] / 3), a[0])) if 260 <= w[0] < 495).strip()
            sn = int(anc[4])
            assert en_str and tr_str, f"PDF2 empty field at S.N {sn}: en={en_str!r}, tr={tr_str!r}"
            seen_sns.append(sn)
            rows.append(('pdf2', en_str, tr_str, ''))
    assert len(rows) == 1124, f"Expected 1124 rows in PDF2, got {len(rows)}"
    assert seen_sns == list(range(1, 1125)), f"PDF2 S.N sequence incomplete: {set(range(1, 1125)) - set(seen_sns)}"
    return rows


def parse_pdf3():
    doc = fitz.open(PDF3_PATH)
    rows = []
    main_nums = []
    for pno in range(2, 26):
        words = doc[pno].get_text('words')
        for side, x_min, x_en0, x_tr0, x_pos0, x_max in [
            ('L', 0, 62, 146, 248, 300),
            ('R', 300, 332, 416, 518, 600),
        ]:
            col = [w for w in words if x_min <= w[0] < x_max and 66 < w[1] < 835]
            lines = []
            for w in sorted(col, key=lambda a: (a[1], a[0])):
                if lines and abs(w[1] - lines[-1]['y']) < 3.5:
                    lines[-1]['w'].append(w)
                else:
                    lines.append({'y': w[1], 'w': [w]})
            for ln in lines:
                num_t = ' '.join(w[4] for w in ln['w'] if w[0] < x_en0).strip()
                en_t = ' '.join(w[4] for w in ln['w'] if x_en0 <= w[0] < x_tr0).strip()
                tr_t = ' '.join(w[4] for w in ln['w'] if x_tr0 <= w[0] < x_pos0).strip()
                pos_t = ' '.join(w[4] for w in ln['w'] if w[0] >= x_pos0).strip()
                if en_t == 'Diğer Yapıları' and not tr_t and not pos_t:
                    continue
                if en_t == 'İngilizce' and tr_t == 'Türkçe':
                    continue
                if not en_t and (tr_t or pos_t):
                    assert rows, f"PDF3 orphan continuation on page {pno+1} {side}"
                    prev = rows[-1]
                    if tr_t:
                        prev[2] = (prev[2][:-1] + tr_t) if prev[2].endswith('-') else ((prev[2] + ' ' + tr_t).strip())
                    if pos_t:
                        prev[3] = (prev[3] + ' ' + pos_t).strip()
                elif en_t:
                    if not tr_t and not pos_t and not num_t and rows:
                        rows[-1][1] = rows[-1][1] + ' ' + en_t
                    else:
                        if num_t and num_t.rstrip('.').isdigit():
                            main_nums.append(int(num_t.rstrip('.')))
                        rows.append(['pdf3', en_t, tr_t, pos_t])
    assert len(rows) == 1624, f"Expected 1624 rows in PDF3, got {len(rows)}"
    assert sorted(main_nums) == list(range(1, 601)), f"PDF3 main nouns incomplete: {set(range(1, 601)) - set(main_nums)}"
    for r in rows:
        assert r[1] and r[2] and r[3], f"PDF3 incomplete row: {r}"
    return [tuple(r) for r in rows]


def main():
    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        pool = json.load(f)

    existing_canon = set()
    existing_js = set()
    for w in pool:
        existing_canon.add(build.get_canonical_key(w['en']))
        existing_js.add(js_norm_key(w['en']))
        if w.get('alt'):
            existing_canon.add(build.get_canonical_key(w['alt']))
            existing_js.add(js_norm_key(w['alt']))

    p1 = parse_pdf1()
    p2 = parse_pdf2()
    p3 = parse_pdf3()
    print(f"Parsed counts: PDF1={len(p1)}, PDF2={len(p2)}, PDF3={len(p3)} (total rows={len(p1)+len(p2)+len(p3)})")

    candidates = {}
    skipped_existing = {'pdf1': 0, 'pdf2': 0, 'pdf3': 0}
    skipped_variant = {'pdf1': 0, 'pdf2': 0, 'pdf3': 0}

    for src, raw_en, raw_tr, raw_pos in p1 + p2 + p3:
        tr_clean = clean_tr(raw_tr, force_lower=(src in ('pdf1', 'pdf2')))
        pos_hint = normalize_pdf3_pos(raw_pos) if raw_pos else ''

        for norm_en, tr_override in normalize_headword(raw_en):
            if norm_en.lower() in SKIP_ALREADY_IN_POOL:
                skipped_variant[src] += 1
                continue
            ckey = build.get_canonical_key(norm_en)
            jkey = js_norm_key(norm_en)
            if ckey in existing_canon or jkey in existing_js:
                skipped_existing[src] += 1
                continue

            item_tr = tr_override if tr_override else tr_clean
            assert '\u0307' not in item_tr, f"Combining dot-above found in tr for {norm_en!r}: {item_tr!r}"
            assert item_tr, f"Empty tr for {norm_en!r}"

            if ckey not in candidates:
                candidates[ckey] = {
                    'en': norm_en,
                    'tr': item_tr,
                    'pos_hint': pos_hint,
                    'sources': [src],
                }
            else:
                entry = candidates[ckey]
                if src not in entry['sources']:
                    entry['sources'].append(src)
                entry['tr'] = build.merge_tr(entry['tr'], item_tr)
                if pos_hint and not entry['pos_hint']:
                    entry['pos_hint'] = pos_hint

    staged = sorted(candidates.values(), key=lambda x: x['en'].lower())
    print(f"Skipped (exact/canonical in pool): {skipped_existing}")
    print(f"Skipped (variant already in pool): {skipped_variant}")
    print(f"Total unique NEW candidates: {len(staged)}")

    os.makedirs(DEFAULT_SCRATCH_DIR, exist_ok=True)
    staged_path = os.path.join(DEFAULT_SCRATCH_DIR, 'yds_extra_staged.json')
    with open(staged_path, 'w', encoding='utf-8') as f:
        json.dump(staged, f, ensure_ascii=False, indent=2)

    n = len(staged)
    chunk_size = (n + 3) // 4
    for i in range(4):
        chunk = staged[i * chunk_size : (i + 1) * chunk_size]
        cpath = os.path.join(DEFAULT_SCRATCH_DIR, f'chunk_{i+1}.json')
        with open(cpath, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, ensure_ascii=False, indent=2)
        print(f"  Wrote {cpath}: {len(chunk)} entries ({chunk[0]['en']} .. {chunk[-1]['en']})")


if __name__ == '__main__':
    main()
