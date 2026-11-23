#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YDS örnek cümle overlay'i.

words-data.js içindeki _RAW_WORDS dizisinde, data/yds_examples.json'da
tanımlı id'ler için `example` alanını (indeks 10) elle yazılmış gerçek
örnek cümleyle değiştirir. Sınav kaynağı/alıntısı `ydsExample` (indeks 12)
alanında köken bilgisi olarak korunur.

Güvenlik:
- Hiçbir kelime eklenmez/silinmez; yalnızca belirtilen id'lerin example alanı değişir.
- Her id için JSON'daki `en` ile kayıttaki `en` eşleşmezse o giriş atlanır (uyarı).
- Tüm (id, en) kümesi değişmeden korunur; aksi halde SystemExit.
- Yeniden çalıştırılabilir (idempotent).

Kullanım:
    python3 scripts/apply_examples.py            # uygula ve yaz
    python3 scripts/apply_examples.py --check     # yalnızca doğrula, yazma
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS = os.path.join(ROOT, 'words-data.js')
DATA_DIR = os.path.join(ROOT, 'data')
# Tüm parti dosyaları: data/yds_examples.json, data/yds_examples_002.json, ...
EXAMPLES_GLOB = os.path.join(DATA_DIR, 'yds_examples*.json')

EXAMPLE_IDX = 10       # record[10] = example
YDS_EXAMPLE_IDX = 12   # record[12] = ydsExample (kaynak/alıntı korunur)

_ARR_RE = re.compile(r'(const _RAW_WORDS = )(\[.*?\])(;)', re.S)


def load_raw(src):
    m = _ARR_RE.search(src)
    if not m:
        raise SystemExit('HATA: _RAW_WORDS dizisi bulunamadı.')
    return m, json.loads(m.group(2))


def dump_raw(raw):
    # words-data.js ile birebir aynı kompakt biçim (boşluksuz).
    return json.dumps(raw, ensure_ascii=False, separators=(',', ':'))


def main():
    check_only = '--check' in sys.argv
    src = open(WORDS, encoding='utf-8').read()
    m, raw = load_raw(src)

    files = sorted(glob.glob(EXAMPLES_GLOB))
    if not files:
        raise SystemExit('HATA: data/yds_examples*.json bulunamadı.')
    entries = []
    for fp in files:
        part = json.load(open(fp, encoding='utf-8'))
        entries.extend(part)
    print('[apply_examples] parti dosyaları: %d (%s)' % (len(files), ', '.join(os.path.basename(f) for f in files)))

    by_id = {r[0]: r for r in raw}
    before_keys = {(r[0], r[1]) for r in raw}
    before_count = len(raw)

    applied = skipped = 0
    problems = []
    for e in entries:
        wid = e.get('id')
        en = e.get('en')
        ex = (e.get('ex') or '').strip()
        rec = by_id.get(wid)
        if rec is None:
            problems.append('id %s bulunamadı' % wid)
            skipped += 1
            continue
        if en is not None and rec[1] != en:
            problems.append('id %s en uyuşmuyor (json=%r, kayıt=%r)' % (wid, en, rec[1]))
            skipped += 1
            continue
        if not ex:
            skipped += 1
            continue
        # example alanını yaz (gerekirse diziyi genişlet)
        while len(rec) <= EXAMPLE_IDX:
            rec.append('')
        rec[EXAMPLE_IDX] = ex
        applied += 1

    # Güvenlik doğrulamaları
    after_keys = {(r[0], r[1]) for r in raw}
    if len(raw) != before_count:
        raise SystemExit('HATA: kayıt sayısı değişti (%d -> %d)' % (before_count, len(raw)))
    if after_keys != before_keys:
        raise SystemExit('HATA: (id, en) kümesi değişti — kelime kaybı/değişimi riski!')

    print('[apply_examples] girişler: %d | uygulandı: %d | atlandı: %d' % (len(entries), applied, skipped))
    if problems:
        print('[apply_examples] UYARILAR (%d):' % len(problems))
        for p in problems[:20]:
            print('   -', p)
        if len(problems) > 20:
            print('   ... +%d daha' % (len(problems) - 20))

    if check_only:
        print('[apply_examples] --check: dosya yazılmadı.')
        return

    new_src = src[:m.start()] + m.group(1) + dump_raw(raw) + m.group(3) + src[m.end():]
    if new_src != src:
        open(WORDS, 'w', encoding='utf-8').write(new_src)
        print('[apply_examples] words-data.js güncellendi.')
    else:
        print('[apply_examples] değişiklik yok.')


if __name__ == '__main__':
    main()
