// DIV 측정점 단일 정의 (DivPage, InspectionPage, dailyReportCalc 공통)
// 수정 시 이 파일 한 곳만 고치면 됨.
export const DIV_POINTS = [
  // 층 숫자(floor), 위치번호(pos), ID
  { floor: 9,  pos: 3, id: '9-3',  floorLabel: '8-1층', loc: '사) 8층 계단 위' },
  { floor: 8,  pos: 1, id: '8-1',  floorLabel: '8층',   loc: '연) 8층 공조실' },
  { floor: 8,  pos: 2, id: '8-2',  floorLabel: '8층',   loc: '연) 8층 PS실'   },
  { floor: 8,  pos: 3, id: '8-3',  floorLabel: '8층',   loc: '사) 8층 PS실'   },
  { floor: 7,  pos: 1, id: '7-1',  floorLabel: '7층',   loc: '연) 7층 공조실' },
  { floor: 7,  pos: 2, id: '7-2',  floorLabel: '7층',   loc: '연) 7층 PS실'   },
  { floor: 7,  pos: 3, id: '7-3',  floorLabel: '7층',   loc: '사) 7층 PS실'   },
  { floor: 6,  pos: 1, id: '6-1',  floorLabel: '6층',   loc: '연) 6층 공조실' },
  { floor: 6,  pos: 2, id: '6-2',  floorLabel: '6층',   loc: '연) 6층 PS실'   },
  { floor: 6,  pos: 3, id: '6-3',  floorLabel: '6층',   loc: '사) 6층 PS실'   },
  { floor: 5,  pos: 1, id: '5-1',  floorLabel: '5층',   loc: '연) 5층 공조실' },
  { floor: 5,  pos: 2, id: '5-2',  floorLabel: '5층',   loc: '연) 5층 PS실'   },
  { floor: 5,  pos: 3, id: '5-3',  floorLabel: '5층',   loc: '사) 5층 PS실'   },
  { floor: 3,  pos: 1, id: '3-1',  floorLabel: '3층',   loc: '연) 3층 공조실' },
  { floor: 3,  pos: 2, id: '3-2',  floorLabel: '3층',   loc: '연) 3층 PS실'   },
  { floor: 3,  pos: 3, id: '3-3',  floorLabel: '3층',   loc: '사) 3층 PS실'   },
  { floor: 2,  pos: 2, id: '2-2',  floorLabel: '2층',   loc: '연) 2층 PS실'   },
  { floor: 2,  pos: 3, id: '2-3',  floorLabel: '2층',   loc: '사) 2층 PS실'   },
  { floor: 1,  pos: 1, id: '1-1',  floorLabel: '1층',   loc: '연) 1층 공조실' },
  { floor: 1,  pos: 2, id: '1-2',  floorLabel: '1층',   loc: '연) 1층 PS실'   },
  { floor: 1,  pos: 3, id: '1-3',  floorLabel: '1층',   loc: '사) 1층 PS실'   },
  { floor: -1, pos: 1, id: '-1-1', floorLabel: 'B1층',  loc: '지) B1층 공조실' },
  { floor: -1, pos: 2, id: '-1-2', floorLabel: 'B1층',  loc: '지) B1층 화장실' },
  { floor: -1, pos: 3, id: '-1-3', floorLabel: 'B1층',  loc: '지) B1층 식당 뒤' },
  { floor: -2, pos: 1, id: '-2-1', floorLabel: 'B2층',  loc: '지) B2층 공조실' },
  { floor: -2, pos: 2, id: '-2-2', floorLabel: 'B2층',  loc: '지) B2층 CPX실'  },
  { floor: -2, pos: 3, id: '-2-3', floorLabel: 'B2층',  loc: '지) B2층 PS실'   },
  { floor: -3, pos: 2, id: '-3-2', floorLabel: 'B3층',  loc: '지) B3층 팬룸'   },
  { floor: -3, pos: 3, id: '-3-3', floorLabel: 'B3층',  loc: '지) B3층 기사대기실' },
  { floor: -4, pos: 1, id: '-4-1', floorLabel: 'B4층',  loc: '지) B4층 팬룸'   },
  { floor: -4, pos: 2, id: '-4-2', floorLabel: 'B4층',  loc: '지) B4층 기계실' },
  { floor: -4, pos: 3, id: '-4-3', floorLabel: 'B4층',  loc: '지) B4층 창고'   },
  { floor: -5, pos: 2, id: '-5-2', floorLabel: 'B5층',  loc: '지) B5층 2번팬룸' },
  { floor: -5, pos: 3, id: '-5-3', floorLabel: 'B5층',  loc: '지) B5층 1번팬룸' },
] as const

export type DivPoint = typeof DIV_POINTS[number]

// div_id → { floorLabel, loc } 조회용 맵
export const DIV_POINT_LABEL: Record<string, { floorLabel: string; loc: string }> =
  Object.fromEntries(DIV_POINTS.map(p => [p.id, { floorLabel: p.floorLabel, loc: p.loc }]))
