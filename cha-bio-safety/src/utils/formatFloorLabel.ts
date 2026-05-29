// 자동 기입 페이지 (일일 업무일지 / 업무수행기록표 / 소방점검관리 제출용 탭) 에서
// 층 표기를 통일하기 위한 헬퍼.
//
// 룰:
//   - 지하층 (B1~B5, B+숫자 패턴): zone 무시 → `B1F`, `B5F`
//   - 지상층 (1F~8F, 8-1F 등 F 접미 코드): zone 한국어 prefix + 공백 + floor 코드
//     예) zone=office, floor=1F → '사무동 1F'
//     예) zone=research, floor=8-1F → '연구동 8-1F'
//     예) zone=common, floor=3F → '공용 3F'
//   - zone 없음/Unknown 지상층: prefix 생략 → '1F'
//   - M (기계실) / 빈 값: 그대로 반환 (빈 문자열 가능)
//
// 호출자는 이 결과를 다른 텍스트 (위치, 카테고리, 메모 등) 와 공백으로 join 한다.

const ZONE_KO: Record<string, string> = {
  office:    '사무동',
  research:  '연구동',
  common:    '공용',
  basement:  '지하',
}

export function formatFloorLabel(floor: string | null | undefined, zone?: string | null | undefined): string {
  const f = (floor ?? '').trim()
  if (!f) return ''
  // 지하층: 'B1' ~ 'B5' 또는 'B' + 숫자 — zone 무시, F 접미 추가
  if (/^B\d+$/.test(f)) return `${f}F`
  // 지상층 (이미 F 또는 N-NF 형태): zone prefix 추가
  const zoneKo = ZONE_KO[zone ?? ''] ?? ''
  return zoneKo ? `${zoneKo} ${f}` : f
}
