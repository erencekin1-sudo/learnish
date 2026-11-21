#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prepare and validate Learnish dictionary expansion (1,006 balanced A1-C1 entries):
- Extracts 44 missing Oxford 5000 words from belgeler/oxford_5000_cefr.json
- Extracts ~196 clean, high-utility lexical words from curriculum-data.js
- Provides strict collision detection (exact, canonical, JS norm, UK/US, trivial plurals)
- Provides `--validate <path>` CLI for batch validation inside the workspace sandbox
"""

import os
import sys
import re
import json
import argparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
import build  # noqa: E402

POOL_PATH = os.path.join(BASE_DIR, 'belgeler', 'kelimeler_havuzu.json')
OXFORD_JSON_PATH = os.path.join(BASE_DIR, 'belgeler', 'oxford_5000_cefr.json')
CURRICULUM_JS_PATH = os.path.join(BASE_DIR, 'curriculum-data.js')
SCRATCH_BATCH_A_PATH = '/Users/erencekin/.gemini/antigravity/brain/31033069-b1e7-4f79-b150-84cf57e6b99d/scratch/dict_batch_a.json'
WORKSPACE_BATCH_A_PATH = os.path.join(BASE_DIR, 'scripts', '.dict_batch_a_cache.json')

VALID_POS_DESC = {
    'noun': 'İsim (Noun)',
    'verb': 'Fiil (Verb)',
    'adjective': 'Sıfat (Adjective)',
    'adverb': 'Zarf (Adverb)',
    'preposition': 'Edat (Preposition)',
    'conjunction': 'Bağlaç (Conjunction)',
    'phrase': 'Kalıp / Deyim (Phrase)',
    'idiom': 'Deyim (Idiom)',
}
VALID_CEFR = {'A1', 'A2', 'B1', 'B2', 'C1'}
CITATION_RE = re.compile(r'\b(202\d|YDS|YÖKDİL|Nisan|Ekim|Mart|Kasım|S\.\d+|\[DC\]|\[Ç\]|\[DÖ\]|\[TK\]|kök|parça)\b', re.I)

# Lexicalized plurals / forms with distinct meanings or standard plural-only nouns
DISTINCT_PLURAL_WHITELIST = {
    'scissors', 'chores', 'sunglasses', 'binoculars', 'jeans', 'trousers',
    'terms', 'earnings', 'belongings', 'outskirts', 'premises', 'headquarters',
    'savings', 'surroundings', 'remains', 'goods', 'glasses', 'shorts',
    'pants', 'pyjamas', 'pajamas', 'headphones', 'stairs', 'clothes',
    'customs', 'supplies', 'draughts', 'contents', 'proceedings', 'credentials',
    'fireworks', 'quarters', 'statistics', 'greens', 'odds', 'manners',
    'economics', 'linguistics', 'mathematics', 'physics', 'athletics', 'gymnastics',
    'aerobics', 'electronics', 'politics', 'ethics', 'logistics', 'acoustics',
    'congratulations', 'greetings', 'thanks', 'regards', 'wages', 'assets',
}

IRREGULAR_PLURALS = {
    'teeth': 'tooth',
    'feet': 'foot',
    'mice': 'mouse',
    'geese': 'goose',
    'men': 'man',
    'women': 'woman',
    'lice': 'louse',
    'oxen': 'ox',
    'children': 'child',
    'leaves': 'leaf',
    'knives': 'knife',
    'wives': 'wife',
    'lives': 'life',
    'wolves': 'wolf',
    'calves': 'calf',
    'halves': 'half',
    'loaves': 'loaf',
    'shelves': 'shelf',
    'thieves': 'thief',
}

EXCLUDE_CURRICULUM_EXACT = {
    'may i', 'can i', 'how many', 'o clock', 'school life', 'classroom rules',
    'teen life', 'body parts', 'farm animals', 'school routines', 'daily routine',
    'wash dishes', 'do homework', 'reading comics', 'come in', 'go out',
    'good morning', 'good afternoon', 'good evening', 'good night', 'nice to',
    'see you', 'thank you', 'excuse me', 'stand up', 'sit down', 'open the',
    'close the', 'turn on', 'turn off', 'be quiet', 'raise hand',
    'color', 'math', 'maths', 'colours', 'colors', 'fav', 'favourite', 'favorite',
    'programme', 'centimetre', 'kilometre', 'metre', 'litre', 'theatre', 'centre',
    'neighbour', 'neighbourhood', 'organised', 'organise', 'realise', 'recognise',
    'practise', 'licence', 'defence', 'offence', 'behaviour', 'flavour', 'humour',
    'rumour', 'honour', 'labour', 'harbour', 'valour', 'marvellous', 'traveller',
    'cancelled', 'cancelling', 'jewellery', 'pyjamas', 'grey', 'cheque', 'tyre',
    'kerb', 'aeroplane', 'plough', 'sceptical', 'encyclopaedia', 'paediatric',
    'ageing', 'judgement', 'acknowledgement', 'fulfil', 'skilful', 'wilful',
    'enrol', 'enrolment', 'instalment', 'appal', 'enthral', 'bureaucrat',
    'yoghurt', 'barbeque', 'appetiser', 'flavourful', 'summarise', 'visualise',
    'africa', 'antarctica', 'arabic', 'arctic', 'argentinian', 'asia', 'asian',
    'atlantic', 'austria', 'austrian', 'azerbaijani', 'azeri', 'belgian', 'belgium',
    'bosphorus', 'brazilian', 'britain', 'british', 'bulgaria', 'bulgarian',
    'canadian', 'cappadocia', 'chile', 'chilean', 'chinese', 'covid', 'croatia',
    'croatian', 'czech', 'czechia', 'danish', 'denmark', 'dutch', 'egyptian',
    'eid-al-ramadan', 'english', 'ephesus', 'europe', 'finland', 'finnish',
    'french', 'german', 'greek', 'hindi', 'hungarian', 'hungary', 'india',
    'indian', 'irish', 'italian', 'japanese', 'kazakh', 'korean', 'kyrgyz',
    'mexican', 'netherlands', 'norway', 'norwegian', 'pacific', 'pamukkale',
    'peru', 'peruvian', 'poland', 'polish', 'portugal', 'portuguese',
    'russian', 'scottish', 'spanish', 'sweden', 'swedish', 'swiss', 'switzerland',
    'thai', 'turkey', 'turkish', 'turkmen', 'uk', 'unesco', 'american',
    'pe', 're', 'diy', 'rsvp', 'ids', 'pc', 'mars', 'ayran', 'baklava',
    'couscous', 'falafel', 'halal', 'e-scooters', 'lunapark', 'highschool',
    'lahmacun', 'jupiter', 'neptune', 'saturn', 'savannah', 'raining', 'repairing', 'polluting', 'acting',
}


def uk_us_variants(word):
    lw = word.lower().strip()
    out = set()
    swaps = [
        ('ise', 'ize'), ('ize', 'ise'),
        ('ised', 'ized'), ('ized', 'ised'),
        ('ising', 'izing'), ('izing', 'ising'),
        ('isation', 'ization'), ('ization', 'isation'),
        ('our', 'or'), ('or', 'our'),
        ('re', 'er'), ('er', 're'),
        ('ce', 'se'), ('se', 'ce'),
        ('ll', 'l'), ('l', 'll'),
        ('ae', 'e'), ('oe', 'e'),
        ('ogue', 'og'),
        ('dgement', 'dgment'), ('dgment', 'dgement'),
        ('ey', 'y'), ('y', 'ey'),
    ]
    for a, b in swaps:
        if a in lw:
            out.add(lw.replace(a, b))
    exact_pairs = [
        ('math', 'maths'),
        ('color', 'colour'),
        ('gray', 'grey'),
        ('yoghurt', 'yogurt'),
        ('barbeque', 'barbecue'),
        ('moustache', 'mustache'),
        ('doughnut', 'donut'),
        ('pyjamas', 'pajamas'),
        ('tyre', 'tire'),
        ('kerb', 'curb'),
    ]
    for a, b in exact_pairs:
        if lw == a:
            out.add(b)
        elif lw == b:
            out.add(a)
    return out


def plural_stems(word):
    lw = word.lower().strip()
    if lw in DISTINCT_PLURAL_WHITELIST:
        return set()
    stems = set()
    if lw in IRREGULAR_PLURALS:
        stems.add(IRREGULAR_PLURALS[lw])
    if ' ' not in lw:
        if lw.endswith('ies') and len(lw) > 4:
            stems.add(lw[:-3] + 'y')
        if lw.endswith('es') and len(lw) > 4 and not lw.endswith(('ss', 'is', 'us')):
            stems.add(lw[:-2])
        if lw.endswith('s') and len(lw) > 3 and not lw.endswith(('ss', 'us', 'is', 'ics')):
            stems.add(lw[:-1])
    return stems


def build_existing_index(extra_words=None):
    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        pool = json.load(f)

    canon = set()
    js = set()
    lower = set()
    examples = set()

    def add_word(s):
        if not s:
            return
        canon.add(build.get_canonical_key(s))
        js.add(build.js_norm_key(s))
        lower.add(s.strip().lower())

    for w in pool:
        add_word(w.get('en', ''))
        add_word(w.get('alt', ''))
        ex = (w.get('example') or '').strip()
        if ex:
            examples.add(ex)

    if extra_words:
        for w in extra_words:
            add_word(w.get('en', ''))
            ex = (w.get('example') or '').strip()
            if ex:
                examples.add(ex)

    return {'canon': canon, 'js': js, 'lower': lower, 'examples': examples}


def check_collision(en, idx):
    s = (en or '').strip()
    if not s:
        return 'empty'
    ck = build.get_canonical_key(s)
    jk = build.js_norm_key(s)
    lw = s.lower()

    if ck in idx['canon'] or jk in idx['js'] or lw in idx['lower']:
        return f'exact/canonical match ({s})'

    for v in uk_us_variants(lw):
        if build.get_canonical_key(v) in idx['canon'] or build.js_norm_key(v) in idx['js'] or v in idx['lower']:
            return f'UK/US spelling variant of existing ({v})'

    for st in plural_stems(lw):
        if build.get_canonical_key(st) in idx['canon'] or build.js_norm_key(st) in idx['js'] or st in idx['lower']:
            return f'inflectional plural of existing ({st})'

    return None


def register_word(en, ex, idx):
    idx['canon'].add(build.get_canonical_key(en))
    idx['js'].add(build.js_norm_key(en))
    idx['lower'].add(en.strip().lower())
    if ex:
        idx['examples'].add(ex.strip())


def map_oxford_pos(t):
    t = (t or '').lower().strip()
    mapping = {
        'noun': 'noun',
        'verb': 'verb',
        'adjective': 'adjective',
        'adverb': 'adverb',
        'preposition': 'preposition',
        'conjunction': 'conjunction',
        'modal verb': 'verb',
        'auxiliary verb': 'verb',
        'number': 'noun',
        'pronoun': 'noun',
        'determiner': 'adjective',
    }
    return mapping.get(t, 'noun')


def map_curriculum_pos(p):
    p = (p or '').lower().strip()
    if p in ('noun', 'n'):
        return 'noun'
    if p in ('verb', 'v'):
        return 'verb'
    if p in ('adj', 'adjective'):
        return 'adjective'
    if p in ('adv', 'adverb'):
        return 'adverb'
    if p in ('prep', 'preposition'):
        return 'preposition'
    if p in ('conj', 'conjunction'):
        return 'conjunction'
    if p in ('phrase', 'phrasal verb', 'idiom'):
        return 'phrase'
    return 'noun'


def stage_batch_a():
    idx = build_existing_index()

    # 1. Missing Oxford 5000 entries
    with open(OXFORD_JSON_PATH, 'r', encoding='utf-8') as f:
        ox_json = json.load(f)

    oxford_staged = []
    seen_ox = {}
    for v in ox_json.values():
        w = (v.get('word') or '').strip()
        if not w:
            continue
        col = check_collision(w, idx)
        if col:
            continue
        ck = build.get_canonical_key(w)
        if ck in seen_ox:
            continue
        cefr = (v.get('cefr') or 'B1').upper().strip()
        if cefr not in VALID_CEFR:
            cefr = 'B1'
        pos = map_oxford_pos(v.get('type'))
        item = {
            'source': 'oxford_5000',
            'en': w,
            'tr_hint': '',
            'pos': pos,
            'desc': VALID_POS_DESC[pos],
            'cefr': cefr,
            'cat': f'The Oxford 5000 ({cefr})',
            'phonetic': (v.get('phon_br') or '').strip(),
            'definition': (v.get('definition') or '').strip(),
            'example_hint': (v.get('example') or '').strip(),
        }
        seen_ox[ck] = item
        oxford_staged.append(item)
        register_word(w, '', idx)

    oxford_staged.sort(key=lambda x: x['en'].lower())
    print(f"Oxford 5000 staged: {len(oxford_staged)}")

    # 2. Clean lexical entries from CURRICULUM_DICTIONARY
    with open(CURRICULUM_JS_PATH, 'r', encoding='utf-8') as f:
        ctext = f.read()
    marker = 'const CURRICULUM_DICTIONARY ='
    pos_idx = ctext.find(marker)
    assert pos_idx != -1, "CURRICULUM_DICTIONARY not found in curriculum-data.js"
    brace_idx = ctext.find('{', pos_idx)
    cdict, _ = json.JSONDecoder().raw_decode(ctext, brace_idx)

    curr_candidates = []
    for k, v in cdict.items():
        en = (v.get('en') or k).strip()
        tr = (v.get('tr') or '').strip()
        if not tr or 'müfredat' in tr.lower():
            continue
        if len(en) < 3 or not re.match(r'^[a-zA-Z][a-zA-Z\s\-]+$', en):
            continue
        words = en.split()
        if len(words) > 2:
            continue
        en_low = en.lower()
        if en_low in EXCLUDE_CURRICULUM_EXACT:
            continue
        # Skip generic plural nouns (unless lexicalized plural in DISTINCT_PLURAL_WHITELIST)
        if ' ' not in en_low and en_low not in DISTINCT_PLURAL_WHITELIST:
            if en_low.endswith('s') and not en_low.endswith(('ss', 'us', 'is', 'ous', 'ics', 'ness', 'less')):
                pos_tmp = map_curriculum_pos(v.get('pos'))
                if pos_tmp == 'noun':
                    continue
        if len(words) == 2:
            # Keep crisp compounds / phrasal verbs, skip generic instructional phrases
            if words[0].lower() in ('a', 'an', 'the', 'my', 'your', 'our', 'how', 'what', 'which', 'may', 'can', 'do', 'does', 'is', 'are', 'be', 'don', 'dont', "don't", 'let', 'good', 'reading', 'playing', 'watching', 'going', 'wash', 'make', 'take'):
                continue
        if check_collision(en_low, idx):
            continue
        cefr = (v.get('cefr') or 'A2').upper().strip()
        if cefr not in VALID_CEFR:
            cefr = 'A2'
        pos = map_curriculum_pos(v.get('pos'))
        if len(words) == 2 and pos not in ('noun', 'verb', 'adjective', 'adverb'):
            pos = 'phrase'
        elif len(words) == 2 and pos == 'verb':
            pos = 'phrase'
        curr_candidates.append({
            'source': 'curriculum',
            'en': en_low,
            'tr_hint': tr.replace('\u0307', ''),
            'pos': pos,
            'desc': VALID_POS_DESC[pos],
            'cefr': cefr,
            'cat': f'Kelime Kütüphanesi ({cefr})',
            'phonetic': '',
            'definition': '',
            'example_hint': (v.get('example') or '').strip(),
            'is_single': len(words) == 1,
        })

    # Deduplicate curriculum candidates internally (canonical + UK/US + plural), prioritizing single-word entries first
    curr_candidates.sort(key=lambda x: (0 if x['is_single'] else 1, {'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3, 'C1': 4}[x['cefr']], x['en']))
    curr_staged = []
    target_curr = 240 - len(oxford_staged)
    for c in curr_candidates:
        if len(curr_staged) >= target_curr:
            break
        if check_collision(c['en'], idx):
            continue
        c.pop('is_single', None)
        curr_staged.append(c)
        register_word(c['en'], '', idx)

    print(f"Curriculum staged: {len(curr_staged)} (from {len(curr_candidates)} clean candidates)")

    batch_a = oxford_staged + curr_staged
    print(f"Total Batch A staged: {len(batch_a)}")

    os.makedirs(os.path.dirname(SCRATCH_BATCH_A_PATH), exist_ok=True)
    with open(SCRATCH_BATCH_A_PATH, 'w', encoding='utf-8') as f:
        json.dump(batch_a, f, ensure_ascii=False, indent=2)
    with open(WORKSPACE_BATCH_A_PATH, 'w', encoding='utf-8') as f:
        json.dump(batch_a, f, ensure_ascii=False, indent=2)
    print(f"Wrote Batch A to {SCRATCH_BATCH_A_PATH}")


def validate_batch_file(path, check_batch_a=True):
    with open(path, 'r', encoding='utf-8') as f:
        items = json.load(f)
    assert isinstance(items, list), "Root JSON must be an array"

    extra_a = None
    if check_batch_a and os.path.exists(WORKSPACE_BATCH_A_PATH):
        with open(WORKSPACE_BATCH_A_PATH, 'r', encoding='utf-8') as f:
            a_items = json.load(f)
        # Only collide against Batch A if this file isn't Batch A itself
        if len(items) != len(a_items) or {x.get('en', '').lower() for x in items[:5]} != {x.get('en', '').lower() for x in a_items[:5]}:
            extra_a = a_items

    idx = build_existing_index(extra_words=extra_a)

    errors = []
    required_keys = {'en', 'tr', 'pos', 'desc', 'cefr', 'cat', 'phonetic', 'definition', 'example'}
    for i, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"[{i}] Not an object")
            continue
        missing = required_keys - set(item.keys())
        if missing:
            errors.append(f"[{i}] {item.get('en')!r} missing keys: {sorted(missing)}")
            continue
        en = (item['en'] or '').strip()
        tr = (item['tr'] or '').strip()
        pos = (item['pos'] or '').strip()
        desc = (item['desc'] or '').strip()
        cefr = (item['cefr'] or '').strip()
        cat = (item['cat'] or '').strip()
        phonetic = item['phonetic']
        definition = (item['definition'] or '').strip()
        example = (item['example'] or '').strip()

        col = check_collision(en, idx)
        if col:
            errors.append(f"[{i}] {en!r} collision: {col}")

        if not tr or '\u0307' in tr or '\r' in tr or '\n' in tr:
            errors.append(f"[{i}] {en!r} invalid tr: {tr!r}")
        if pos not in VALID_POS_DESC:
            errors.append(f"[{i}] {en!r} invalid pos: {pos!r}")
        elif desc != VALID_POS_DESC[pos]:
            errors.append(f"[{i}] {en!r} desc {desc!r} != expected {VALID_POS_DESC[pos]!r}")
        if cefr not in VALID_CEFR:
            errors.append(f"[{i}] {en!r} invalid cefr: {cefr!r}")
        if cat not in (f"The Oxford 5000 ({cefr})", f"Kelime Kütüphanesi ({cefr})"):
            errors.append(f"[{i}] {en!r} invalid cat: {cat!r}")
        if not isinstance(phonetic, str):
            errors.append(f"[{i}] {en!r} phonetic must be string")
        if not definition or len(definition) < 5 or re.search(r'[çğıöşüÇĞİÖŞÜ]', definition):
            errors.append(f"[{i}] {en!r} invalid English definition: {definition!r}")

        if not (30 <= len(example) <= 240):
            errors.append(f"[{i}] {en!r} example length {len(example)} out of 30..240: {example!r}")
        elif not example[0].isupper() or example[-1] not in '.?!':
            errors.append(f"[{i}] {en!r} example punctuation/case: {example!r}")
        elif CITATION_RE.search(example):
            errors.append(f"[{i}] {en!r} citation in example: {example!r}")
        elif example in idx['examples']:
            errors.append(f"[{i}] {en!r} duplicate example: {example!r}")
        else:
            pat1 = r'(?<!\w)' + re.escape(en) + r'(?!\w)'
            pat2 = r'(?:^|\b)' + re.escape(en) + r'(?:\b|$)'
            if not re.search(pat1, example, re.I) or not re.search(pat2, example, re.I):
                errors.append(f"[{i}] {en!r} exact headword not found as whole word in example: {example!r}")

        register_word(en, example, idx)

    if errors:
        print(f"VALIDATION FAILED ({len(errors)} errors across {len(items)} items):")
        for e in errors[:40]:
            print("  ERR:", e)
        sys.exit(1)
    else:
        from collections import Counter
        print(f"VALIDATION PASSED: {len(items)} items, 0 errors.")
        print("  CEFR:", dict(Counter(x['cefr'] for x in items)))
        print("  POS:", dict(Counter(x['pos'] for x in items)))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--validate', help='Validate an enriched JSON batch file')
    parser.add_argument('--no-batch-a', action='store_true', help='Skip Batch A collision check (use when validating Batch A itself)')
    args = parser.parse_args()

    if args.validate:
        validate_batch_file(args.validate, check_batch_a=not args.no_batch_a)
    else:
        stage_batch_a()


if __name__ == '__main__':
    main()
