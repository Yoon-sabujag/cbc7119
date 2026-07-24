// 점검 내용 데이터 모듈 (7 카테고리 전량)
// SSOT: scratchpad/inspection-content-ssot.json (점검 일지 양식 '점검 내용.xlsx' B=text, C=caution 자동문구, D=bad 자동문구)
// index = line_results 배열 인덱스. 증분 A 는 청정소화약제·소방펌프 2종만 소비(hasSymptomPicker=false).
// special 메타(소화전 0/3, 전실제연댐퍼 0/4)는 후속 증분 B/D 용 — A 에선 미소비.

export interface InspectionItem {
  /** line_results 배열 인덱스 (0-based) */
  i: number
  /** 점검 항목 텍스트 */
  text: string
  /** 주의(caution) 자동 특이사항 문구 */
  caution: string
  /** 불량(bad) 자동 특이사항 문구 */
  bad: string
}

export interface InspectionCategory {
  itemCount: number
  hasSymptomPicker: boolean
  items: InspectionItem[]
  /** 카테고리별 특례 메타(증상피커·고정심볼 등). A 미소비. */
  special?: Record<string, any>
  /** 추가 메타(modal/checkpoints/output 등 후속 증분 힌트) */
  meta?: Record<string, any>
}

export const inspectionContent: Record<string, InspectionCategory> = {
  '청정소화약제': {
    itemCount: 10,
    hasSymptomPicker: false,
    items: [
      { i: 0, text: '기동용기는 조작장치와 직결되어 있는가?', caution: '기동용기 직결 주의 관찰 필요', bad: '기동용기 직결 불량' },
      { i: 1, text: '청정소화약제설비의 약제량은 충분한가?', caution: '약제량 주의 관찰 필요', bad: '약제량 불량' },
      { i: 2, text: '방출표시등 작동은 이상이 없는가?', caution: '방출표시등 주의 관찰 필요', bad: '방출표시등 불량' },
      { i: 3, text: '회로시험시 솔레노이드 밸브의 격발상태는 정상인가?', caution: '솔레노이드 밸브 주의 관찰 필요', bad: '솔레노이드 밸브 주의 불량' },
      { i: 4, text: '방재센터 화재수신반 확인은 정상인가?', caution: '수신반 확인 주의 관찰 필요', bad: '수신반 확인 불량' },
      { i: 5, text: '각종 밸브, 배관 등 외관은 이상이 없는가?', caution: '외관 주의 관찰 필요', bad: '외관 주의 불량' },
      { i: 6, text: '아나로그감지기의 통신상태는 정상인가?', caution: '아나로그감지기 통신상태 주의 관찰 필요', bad: '아나로그감지기 통신상태 불량' },
      { i: 7, text: '청정소화약제설비 수신기의 기능에 이상은 없는가?', caution: '수신기 기능 주의 관찰 필요', bad: '수신기 기능 주의 불량' },
      { i: 8, text: '상주인원에게 설비 및 피난에 대한 교육은 되어있는가?', caution: '교육 상태 점검 필요', bad: '교육 상태 불량' },
      { i: 9, text: '청정소화약제설비의 전원은 이상이 없는가?', caution: '전원 주의 관찰 필요', bad: '전원 불량' },
    ],
  },
  '소화전': {
    itemCount: 7,
    hasSymptomPicker: true,
    special: {
      '0': { symbol: '위치표시등 점등 이상', note: 'item1 위치표시등: fixed symbol regardless of caution/bad, no picker' },
      '3': {
        picker: ['경종', '호스걸이', '직접 입력'],
        cautionPrefix: '손상 주의 항목 : ',
        badPrefix: '조치 필요 항목 :',
        symbols: { '경종': '경종 파손', '호스걸이': '호스걸이 파손', '직접': '직접 입력' },
        note: 'item4 소화전함/호스: symptom picker; 직접입력=prefix only, inspector types name',
      },
    },
    items: [
      { i: 0, text: '소화전의 위치표시등은 점등되어 있는가?', caution: '위치표시등 미비', bad: '위치표시등 불량' },
      { i: 1, text: '발신기 단자대 선로는 정상적으로 관리되고 있는가?', caution: '단자대 선로 주의 필요', bad: '단자대 선로 불량' },
      { i: 2, text: '소화전함 주변 개폐에 지장이 되는 장애물은 없는가?', caution: '장애물 치움, 주의 관찰 필요', bad: '장애물 적재 중 조치 필요' },
      { i: 3, text: '소화전함, 호스, 관창, 앵글밸브 등이 변형, 손상 및 부식된 부분은 없는가?', caution: '손상 주의 항목 : ', bad: '조치 필요 항목 :' },
      { i: 4, text: '결합부 등에서 누수현상은 없는가?', caution: '결합부 누수 주의', bad: '결합부 누수 불량' },
      { i: 5, text: '각 밸브의 개폐조작은 용이한가?', caution: '밸브 개폐 주의', bad: '밸브 개폐 불량' },
      { i: 6, text: '옥내 소화전 사용방법이 부착되어 있는가?', caution: '사용방법 부착 주의', bad: '사용방법 부착 불량' },
    ],
  },
  '비상콘센트': {
    itemCount: 7,
    hasSymptomPicker: false,
    items: [
      { i: 0, text: '비상콘센트 내,외부 관리상태는 양호한가?', caution: '내,외부 관리상태 주의 관찰 필요', bad: '내,외부 관리상태 불량' },
      { i: 1, text: '전원회로의 전압은 정상적으로 유지되고 있는가?', caution: '전압 주의 관찰 필요', bad: '전압 주의 불량' },
      { i: 2, text: '비상콘센트 표시램프는 정상인가?', caution: '표시램프 주의 관찰 필요', bad: '표시램프 불량' },
      { i: 3, text: '비상콘센트의 파손은 없는가?', caution: '파손 여부 주의 관찰 필요', bad: '파손' },
      { i: 4, text: '분기배선용 차단기 설치 및 보호함의 상태는 양호한가?', caution: '차단기 및 보호함 주의 관찰 필요', bad: '차단기 및 보호함 불량' },
      { i: 5, text: '"비상콘센트"라고 표시한 표지는 부착하고 있는가?', caution: '표지 주의 관찰 필요', bad: '표지 불량' },
      { i: 6, text: '전원 배선 비상전원의 정상 여부?', caution: '비상전원 주의 관찰 필요', bad: '비상전원 불량' },
    ],
  },
  '소방펌프': {
    itemCount: 20,
    hasSymptomPicker: false,
    meta: { checkpointCount: 1, checkpointHint: 'CP-B4-소방펌프' },
    items: [
      { i: 0, text: '규정 유효 수량은 확보되었는가?', caution: '수량 주의 관찰 필요', bad: '수량 불량' },
      { i: 1, text: '수조의 변형, 손상, 누수, 현자한 부식 등은 없는가?', caution: '수조 손상 주의 관찰 필요', bad: '수조 손상 불량' },
      { i: 2, text: '수조의 급수장치는 변형, 손상, 부식등이 없고 기능은 정상인가?', caution: '수조 급수 장치 주의 관찰 필요', bad: '수조 급수 장치 불량' },
      { i: 3, text: '수조의 수위계는 변형, 손상 등이 없고 지시 값은 적정한가?', caution: '수위계 주의 관찰 필요', bad: '수위계 불량' },
      { i: 4, text: '수조 외부 사다리 상태는 이상이 없는가? (고정상태 등)', caution: '사다리 주의 관찰 필요', bad: '사다리 불량' },
      { i: 5, text: '주개폐밸브는 개방상태를 유지하고 있는가?', caution: '주개폐밸브 개방 상태 유지 주의 관찰 필요', bad: '주개폐밸브 개방 상태 불량' },
      { i: 6, text: '펌프, 전동기 등에 변형, 손상, 현저한 부식 등은 없는가?', caution: '펌프, 전동기 주의 관찰 필요', bad: '펌프, 전동기 불량' },
      { i: 7, text: '펌프 및 주변 배관에서 누수 부분은 없는가?', caution: '펌프 및 주변 배관 누수 주의 관찰 필요', bad: '펌프 및 주변 배관 누수 불량' },
      { i: 8, text: '게이지류(압력계) 등은 정상적으로 작동하며 지시 값이 적정한가?', caution: '게이지류 작동 주의 관찰 필요', bad: '게이지류 작동 불량' },
      { i: 9, text: '펌프 성능 시험 결과 이상은 없는가?', caution: '펌프 성능 시험 결과 주의 관찰 필요', bad: '펌프 성능 시험 결과 불량' },
      { i: 10, text: '주펌프 및 충압펌브는 동작점 이하에서 정상 작동을 하는가?', caution: '주펌프 및 충압 펌프 주의 관찰 필요', bad: '주펌프 및 충압 펌프 불량' },
      { i: 11, text: '개폐기 및 스위치류의 단자는 고정되어 있고, 개폐기능은 정상인가?', caution: '개폐기 및 스위치류 주의 관찰 필요', bad: '개폐기 및 스위치류 불량' },
      { i: 12, text: '각 밸브류의 템퍼스위치는 이상이 없는가? (감시제어반 동작 확인 여부)', caution: '템퍼스위치 주의 관찰 필요', bad: '템퍼스위치 불량' },
      { i: 13, text: '주펌프 동작 시 기동표시등이 정상적으로 점등하는가? (옥내소화전에 한함)', caution: '기동표시등 주의 관찰 필요', bad: '기동표시등 불량' },
      { i: 14, text: '펌프 동작 시 감시제어반의 음향 경보 상태는 정상인가?', caution: '음향 경보 주의 관찰 필요', bad: '음량경보 불량' },
      { i: 15, text: '동결방지조치 상태에 대한 훼손 및 변형은 없는가?', caution: '동결방지조치 주의 관찰 필요', bad: '동결방지조치 불량' },
      { i: 16, text: '기동조작부 주위에 점검에 지장을 주는 장애물은 없는가?', caution: '장애물 주의 관찰 필요', bad: '장애물 조치 필요' },
      { i: 17, text: '릴리프 밸브는 정상으로 작동하는가? (제철압력 미만에서 개방 여부)', caution: '릴리프 밸브 주의 관찰 필요', bad: '릴리프 밸브 불량' },
      { i: 18, text: '기동용 수압개폐 장치는 정상 작동 하는가?', caution: '기동용 수압개폐 장치 작동 주의 관찰 필요', bad: '기동용 수압개폐 장치 작동 불량' },
      { i: 19, text: '기동용 수압개폐 장치의 압력계 또는 디지털 게이지는 이상이 없는가?', caution: '기동용 수압개폐 장치 압력계 주의 관찰 필요', bad: '기동용 수압개폐 장치 압력계 불량' },
    ],
  },
  '특별피난계단': {
    itemCount: 5,
    hasSymptomPicker: false,
    meta: { modal: 'StairwellModal', stairwellCount: 5, saveUnit: 'per-floor CP (계단실+층 피커 후 층 CP 1건에 line_results[5], 표준 Family A)' },
    items: [
      { i: 0, text: '방화구획을 관통하는 각종 닥트에 방화댐퍼는 설치되어 있는가?', caution: '방화댐퍼 설치 주의 관찰 필요', bad: '방화댐퍼 불량' },
      { i: 1, text: '방화문의 문틀은 불연재료로 되어있고, 틈은 생기지 아니하는가?', caution: '방화문 문틀 주의 관찰 필요', bad: '방화문 문틀 불량' },
      { i: 2, text: '피난계단 입구 또는 내부에 장애물은 없는가?', caution: '장애물 주의 관찰 필요', bad: '장애물 조치 필요' },
      { i: 3, text: '비상구의 폐쇄 또는 다목적으로 사용하고 있지 않은가?', caution: '비상구 주의 관찰 필요', bad: '비상구 불량' },
      { i: 4, text: '통로에는 피난에 방해가 되는 물건을 방치하지 않았는가?', caution: '적재물 주의 관찰 필요', bad: '적재물 조치 필요' },
    ],
  },
  '전실제연댐퍼': {
    itemCount: 10,
    hasSymptomPicker: false,
    meta: { modal: 'DamperModal (stair mode only; equip mode retired)', activePoints: '계단전실 16개소 (계단전실 2/4/5, floors B5~1F)' },
    special: {
      '0': { symbol: '모터 기능 이상', remediation: '제연댐퍼 모터', note: 'item1 공기유입구: symbol regardless of caution/bad, replaces C/D' },
      '4': { symbol: '기판 조작 불량', remediation: '제연댐퍼 작동 기판', note: 'item5 수동기동: symbol regardless of caution/bad, replaces C/D' },
    },
    items: [
      { i: 0, text: '각 제연구역의 공기유입구는 이상 없는가?', caution: '공기유입구 주의 관찰 필요', bad: '공기유입구 불량' },
      { i: 1, text: '배선의 단선 시 화재수신반의 확인은 정상인가?', caution: '단선 시 화재수신반 확인 주의 관찰 필요', bad: '단선 시 화재수신반 확인 불량' },
      { i: 2, text: '화재감지기의 동작에 의해 제연설비 연동상태는 정상인가?', caution: '제연설비 연동상태 주의 관찰 필요', bad: '제연설비 연동상태 불량' },
      { i: 3, text: '제연구역과 옥내 사이의 차압은 적정한가?', caution: '차압 주의 관찰 필요', bad: '차압 불량' },
      { i: 4, text: '제연설비의 수동기동 시 정상적으로 작동하고 있는가?', caution: '수동기동 시 정상 작동 주의 관찰 필요', bad: '수동기동 시 정상 작동 불량' },
      { i: 5, text: '제연 급/배기팬은 정상작동하고 있는가?', caution: '급/배기팬 작동 주의 관찰 필요', bad: '급/배기팬 작동 불량' },
      { i: 6, text: '특별피난계단 전실에 장애물 방치여부는 어떠한가?', caution: '장애물 주의 관찰 필요', bad: '장애물 조치 필요' },
      { i: 7, text: '비상 전원은 이상 없는가?', caution: '비상 전원 주의 관찰 필요', bad: '비상 전원 불량' },
      { i: 8, text: '수동조작함의 상시전원은 이상이 없는가?', caution: '상시 전원 주의 관찰 필요', bad: '상시 전원 불량' },
      { i: 9, text: '급,배기 댐퍼 수동동작 시 수신반 확인은 정상인가?', caution: '수동 동작 시 수신반 확인 주의 관찰 필요', bad: '수동 동작 시 수신반 확인 불량' },
    ],
  },
  '완강기': {
    itemCount: 4,
    hasSymptomPicker: false,
    meta: {
      checkpoints: ['CP-3F-완강기', 'CP-5F-완강기', 'CP-6F-완강기', 'CP-7F-완강기', 'CP-8F-완강기'],
      output: '피난방화 sheet6 rows 6~9 (shares sheet with 특별피난계단 rows 1~5); 점검일 written by 특별피난계단',
    },
    items: [
      { i: 0, text: '피난기구의 고정상태 등 관리 상태는 양호한가?', caution: '고정상태 주의 관찰 필요', bad: '고정상태 불량' },
      { i: 1, text: '피난기구의 사용방법은 표시되어 있는가?', caution: '사용방법 표시 주의 관찰 필요', bad: '사용방법 표시 불량' },
      { i: 2, text: '피난기구의 설치장소에 위치표시는 되어있는가?', caution: '위치 표시 주의 관찰 필요', bad: '위치 표시 불량' },
      { i: 3, text: '완강기 내부 개구부 파쇄침은 구비되어있는가?', caution: '파쇄침 주의 관찰 필요', bad: '파쇄침 구비 불량' },
    ],
  },
  '방화셔터': {
    itemCount: 10,
    hasSymptomPicker: false,
    meta: { modal: 'InspectionModal (Family A)', activePoints: '방화셔터 CP (CP-{floor}-{n}-FS)', output: '방화셔터 매트릭스 sheet7 rows 11~29 (증분 E: 9→10, 폐쇄기 i4 삽입)' },
    special: {
      '2': { symbol: '연동제어기 기판 작동 불', remediation: '연동제어기 기판', note: 'item3 연동제어기 전원·스위치: 고정심볼(C/D 대신), 조치 자동' },
      '9': { symbol: '방화셔터 라인 표시 필요', remediation: '방화셔터 스티커', note: 'item10 표식: 고정심볼(C/D 대신), 조치 자동' },
    },
    items: [
      { i: 0, text: '파손이나 변형된 부분은 없는가?', caution: '파손 및 변형 주의 관찰 필요', bad: '파손 및 변형' },
      { i: 1, text: '연동제어기함 내부 청결 상태는?', caution: '청결 상태 주의 관찰 필요', bad: '청결 상태 조치 필요' },
      { i: 2, text: '연동제어기의 전원 및 스위치는 정상위치에 놓여 있는가?', caution: '전원 및 스위치 주의 관찰 필요', bad: '전원 및 스위치 위치 불량' },
      { i: 3, text: '방화셔터 모터 작동상태 이상 유무?', caution: '모터 작동 상태 주의 관찰 필요', bad: '모터 작동 상태 불량' },
      { i: 4, text: '방화셔터 폐쇄기 동작 상태는?', caution: '폐쇄기 동작 주의 관찰 필요', bad: '폐쇄기 동작 불량' },
      { i: 5, text: '비상탈출문 주변 도장 및 작동상태는 양호한가?', caution: '비상탈출문 상태 주의 관찰 필요', bad: '비상탈출문 상태 불량' },
      { i: 6, text: '방화셔터 주변에 장애물은 없는가?', caution: '장애물 주의 관찰 필요', bad: '장애물 조치 필요' },
      { i: 7, text: '감지기, 중계기 통신선로 단선 및 작동 여부?', caution: '단선 및 작동 주의 관찰 필요', bad: '단선 및 작동 불량' },
      { i: 8, text: '비상전원이 방전되고 있지 않았는가?', caution: '방전 주의 관찰 필요', bad: '방전' },
      { i: 9, text: '방화셔터 내려오는 곳에 대한 표식은 되어 있는가?', caution: '표식 주의 관찰 필요', bad: '표식 불량' },
    ],
  },
  '소방용전원공급반': {
    itemCount: 2,
    hasSymptomPicker: false,
    // 이 카테고리는 사실상 '자동화재탐지설비' 종합점검(10항목)이나, 소방용전원공급반 페이지에서는
    // 전원공급반에 해당하는 2항목(i6 전원공급반·i9 비상전원)만 카드에 노출한다. line_results 는 위치(i)로
    // 저장되므로 자탐 sheet9 의 7·10행에 그대로 반영되고, 나머지 8행은 엑셀 worstFor 의 checked?'○' 폴백으로
    // 채워져 자탐 점검일지는 기존대로 완성된다. i 값(6,9)을 renumber 하면 안 됨(행 정합 깨짐).
    meta: { modal: 'PowerPanelModal (Family A)', activePoints: '7개소 (research 3·office 1·underground 3, PP-R/O/U)', output: '자탐 매트릭스 sheet9 — 카드 i6·i9 만 노출→7·10행 반영, 나머지 8행 ○ 폴백' },
    items: [
      { i: 6, text: '소방설비 전원공급반은 정상적으로 관리되고 있는가?', caution: '전원 공급반 주의 관찰 필요', bad: '전원 공급반 불량' },
      { i: 9, text: '비상 전원의 관리 상태는 양호한가?', caution: '비상 전원 주의 관찰 필요', bad: '비상 전원 불량' },
    ],
  },
  'DIV': {
    itemCount: 4,
    hasSymptomPicker: false,
    meta: {
      modal: 'DivModal (유수검지장치)',
      activePoints: '34측정점 (CP-DIV-{id})',
      output: 'generateDivExcel 34시트: 밸브 D/N·압력상태 F/P·압력스위치 H/Q·청소 I/T = i0/i1/i2/i3',
      note: 'i1 압력상태 = detectDivTrend 압력 추세 자동판정(수동 체크 없음, 카드 인라인 사유). 저장=div_pressures.line_results(timing별). i0/i2/i3 수동 C/D.',
    },
    items: [
      { i: 0, text: '밸브상태는 정상인가?', caution: '밸브 주의 관찰 필요', bad: '밸브 불량' },
      { i: 1, text: '압력상태는 정상인가?', caution: '압력 주의 관찰 필요', bad: '압력 상태 불량' },
      { i: 2, text: '압력스위치는 정상인가?', caution: '압력스위치 주의 관찰 필요', bad: '압력스위치 불량' },
      { i: 3, text: '청소상태는 양호한가?', caution: '청소 상태 관찰 필요', bad: '청소 상태 불량' },
    ],
  },
}

export type InspectionCategoryKey = keyof typeof inspectionContent
