# parse_elev_cert.py
# 승강기 검사성적서 PDF 첫 페이지에서 검사실시일 추출
# Usage: python parse_elev_cert.py "Secure document (2D Barcode).pdf"
# Output: JSON { "inspect_date": "2026-03-04", "year": "2026", "month": "03", "day": "04" }

import sys
import json
import re

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"error": "PyMuPDF not installed. Run: pip install PyMuPDF"}))
    sys.exit(1)

def extract_inspect_date(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        if len(doc) == 0:
            return {"error": "PDF has no pages"}

        # 첫 페이지 텍스트 추출
        page = doc[0]
        text = page.get_text()
        doc.close()

        # "검사실시일" 또는 "검 사 실 시 일" 뒤의 날짜 패턴 찾기
        # 패턴: YYYY.MM.DD, YYYY-MM-DD, YYYY년 MM월 DD일, YYYYMMDD
        patterns = [
            # "검사실시일" 라벨 뒤 날짜
            r'검\s*사\s*실\s*시\s*일[:\s]*(\d{4})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})',
            # 테이블 형식에서 날짜만
            r'검사실시일.*?(\d{4})\.(\d{1,2})\.(\d{1,2})',
            r'검사실시일.*?(\d{4})-(\d{1,2})-(\d{1,2})',
        ]

        for pat in patterns:
            m = re.search(pat, text, re.DOTALL)
            if m:
                y, mo, d = m.group(1), m.group(2).zfill(2), m.group(3).zfill(2)
                return {
                    "inspect_date": f"{y}-{mo}-{d}",
                    "year": y,
                    "month": mo,
                    "day": d,
                }

        # 패턴 못 찾으면 텍스트 일부 반환 (디버깅용)
        return {"error": "inspect date not found", "text_preview": text[:500]}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python parse_elev_cert.py <pdf_path>"}))
        sys.exit(1)

    result = extract_inspect_date(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False))
