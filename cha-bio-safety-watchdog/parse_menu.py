#!/usr/bin/env python3
"""
CBC Weekly Menu PDF → JSON parser (PyMuPDF)
Usage: python parse_menu.py <pdf_path>
       python parse_menu.py --debug <pdf_path>
Requires: pip install PyMuPDF
"""

import fitz  # PyMuPDF
import json
import sys
import re
import os
from datetime import datetime, timedelta

# Windows 콘솔 UTF-8 출력
if sys.platform == 'win32':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', buffering=1)


def dates_from_filename(filename):
    m = re.search(r'\((\d{2})\.(\d{2})_(\d{2})\.(\d{2})\)', filename)
    if not m:
        raise ValueError('파일명에서 날짜를 추출할 수 없습니다: ' + filename)
    sm, sd = int(m.group(1)), int(m.group(2))
    year = datetime.now().year
    if sm == 12 and datetime.now().month <= 2:
        year -= 1
    start = datetime(year, sm, sd)
    return [(start + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(6)]


def _flush(sections, section, items, col_count):
    """아이템 리스트를 col_count 개씩 묶어서 섹션에 추가"""
    if not section or not items or section == '_pending':
        return
    sections.setdefault(section, [])
    for i in range(0, len(items), col_count):
        chunk = items[i:i + col_count]
        if chunk:
            sections[section].append(chunk)


def parse_text(text):
    """PyMuPDF get_text() 출력 파싱.

    PyMuPDF는 테이블 셀을 한 줄에 하나씩 추출함:
      중식          ← 섹션 마커
      닭개장        ← 월요일 메인
      부대찌개      ← 화요일 메인
      ...           ← (6개: 월~토)
      A             ← 서브마커
      쌀밥          ← 월요일 밥
      쌀밥          ← 화요일 밥
      ...           ← (6개씩 반복)

    Returns: dict with 'lunch_a', 'lunch_b', 'dinner' → list of [day0, day1, ...] rows
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    skip_re = re.compile(
        r'^<|^\d+월\s*\d+일|^○|^원산지|^봉지라면|운영시간|\[중식\]|\[스낵\]'
    )

    sections = {}
    current = None
    items = []
    col_count = 6

    for line in lines:
        if skip_re.search(line):
            continue

        # ── 섹션 마커 (정확 일치) ──
        if line == '중식':
            _flush(sections, current, items, col_count)
            current = '_pending'
            items = []
            continue

        if line in ('중식 SALAD', '석식 SALAD'):
            _flush(sections, current, items, col_count)
            current = None
            items = []
            continue

        if line == 'A':
            # pending 아이템 수 = 열 수 (6: 월~토)
            col_count = len(items) if items else 6
            current = 'lunch_a'
            sections.setdefault(current, []).append(items[:])
            items = []
            continue

        if line == 'B':
            col_count = len(items) if items else 5
            current = 'lunch_b'
            sections.setdefault(current, []).append(items[:])
            items = []
            continue

        if line == '석식':
            _flush(sections, current, items, col_count)
            current = 'dinner'
            col_count = 5
            items = []
            continue

        if line in ('PLUS', 'CORNER', 'SNACK', '(한정수량)'):
            _flush(sections, current, items, col_count)
            current = None
            items = []
            continue

        # ── 일반 아이템 ──
        if current:
            items.append(line)

    _flush(sections, current, items, col_count)
    return sections


def transpose_to_menus(dates, sections):
    menus = []
    for day_idx, date in enumerate(dates):
        la, lb, dn = [], [], []

        for row in sections.get('lunch_a', []):
            if day_idx < len(row):
                la.append(row[day_idx])

        if day_idx < 5:
            for row in sections.get('lunch_b', []):
                if day_idx < len(row):
                    lb.append(row[day_idx])
            for row in sections.get('dinner', []):
                if day_idx < len(row):
                    dn.append(row[day_idx])

        menus.append({
            'date': date,
            'lunch_a': '\n'.join(la) if la else None,
            'lunch_b': '\n'.join(lb) if lb else None,
            'dinner':  '\n'.join(dn) if dn else None,
        })
    return menus


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python parse_menu.py <pdf_path>'}, ensure_ascii=False))
        sys.exit(1)

    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    debug = '--debug' in sys.argv
    pdf_path = args[0] if args else None

    if not pdf_path or not os.path.exists(pdf_path):
        print(json.dumps({'error': '파일을 찾을 수 없습니다: ' + str(pdf_path)}, ensure_ascii=False))
        sys.exit(1)

    try:
        dates = dates_from_filename(os.path.basename(pdf_path))

        doc = fitz.open(pdf_path)
        text = doc[0].get_text()
        doc.close()

        if debug:
            print('=== 원시 텍스트 ===', file=sys.stderr)
            print(text or '(empty)', file=sys.stderr)
            print('===================', file=sys.stderr)

        if not text:
            print(json.dumps({'error': 'PDF에서 텍스트를 추출할 수 없습니다'}, ensure_ascii=False))
            sys.exit(1)

        sections = parse_text(text)

        if len(sections.get('lunch_a', [])) < 2:
            print(json.dumps({
                'error': '중식A 메뉴를 찾을 수 없습니다. --debug 옵션으로 텍스트를 확인해주세요.'
            }, ensure_ascii=False))
            sys.exit(1)

        menus = transpose_to_menus(dates, sections)

        print(json.dumps({'success': True, 'menus': menus}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()
