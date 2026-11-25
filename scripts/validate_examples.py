#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
data/yds_examples*.json içindeki örnek cümleleri doğrular.

Her giriş için:
  - ex boş olmamalı, bir sınav kaynağı/alıntısı OLMAMALI,
  - cümle en az birkaç kelime içermeli,
  - başlık kelimesinin (en) anlamlı bir parçası cümlede geçmeli (yazım/kopyala
    hatasını yakalamak için; çekim eklerine tolerans gösterir).

Şüpheli girişleri listeler; çıkış kodu sorun varsa 1.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXAMPLES_GLOB = os.path.join(ROOT, 'data', 'yds_examples*.json')

STOP = {'to', 'of', 'a', 'an', 'the', 'for', 'all', 'in', 'on', 'at', 'by',
        'be', 'with', 'and', 'or', 'as', 'sb', 'sth'}
EXAM = re.compile(r'YDS|YÖKDİL|YOKDIL|YDT|TIPDİL|TIPDIL|KPDS|ÜDS|UDS', re.I)
MONTH = re.compile(r'\b(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\b', re.I)


def is_cit(s):
    if not s:
        return False
    s = s.strip()
    if '·' in s and ('S.' in s or EXAM.search(s) or MONTH.search(s)):
        return True
    if re.search(r'\bS\.\d', s) and (EXAM.search(s) or MONTH.search(s) or '[' in s):
        return True
    if re.match(r'^(19|20)\d\d\s', s) and EXAM.search(s):
        return True
    return False


def headword_present(en, ex):
    low = ex.lower()
    all_toks = [re.sub(r'[^a-zàâçéèêëîïôûùüÿñæœ]', '', t)
                for t in re.split(r'[\s/\-]+', en.lower()) if t and t != '...']
    toks = [t for t in all_toks if t and t not in STOP]
    # İçerik kelimesi yoksa (tümü "as/for/to" gibi edat), ilk sözcüğü aynen ara.
    if not toks:
        toks = [t for t in all_toks if t]
    for t in toks:
        if len(t) < 3:
            if t and re.search(r'\b%s\b' % re.escape(t), low):
                return True
            continue
        root = t[:3]  # çekim ekine tolerans (begin -> began)
        if root in low:
            return True
    return False


def main():
    files = sorted(glob.glob(EXAMPLES_GLOB))
    entries = []
    ids = {}
    dup = []
    for fp in files:
        for e in json.load(open(fp, encoding='utf-8')):
            if e['id'] in ids:
                dup.append(e['id'])
            ids[e['id']] = os.path.basename(fp)
            entries.append(e)

    problems = []
    for e in entries:
        en = e.get('en', '')
        ex = (e.get('ex') or '').strip()
        if not ex:
            problems.append((e['id'], en, 'BOŞ', ex))
        elif is_cit(ex):
            problems.append((e['id'], en, 'KAYNAK', ex))
        elif len(ex.split()) < 4:
            problems.append((e['id'], en, 'ÇOK KISA', ex))
        elif not headword_present(en, ex):
            problems.append((e['id'], en, 'KELİME YOK', ex))

    print('toplam örnek: %d | parti dosyası: %d | yinelenen id: %d' % (len(entries), len(files), len(dup)))
    if dup:
        print('YİNELENEN id\'ler:', sorted(set(dup))[:20])
    if problems:
        print('ŞÜPHELİ (%d):' % len(problems))
        for pid, en, why, ex in problems[:60]:
            print('  [%s] id %s %r -> %r' % (why, pid, en, ex[:70]))
    else:
        print('✅ tüm örnekler geçerli.')
    sys.exit(1 if (problems or dup) else 0)


if __name__ == '__main__':
    main()
