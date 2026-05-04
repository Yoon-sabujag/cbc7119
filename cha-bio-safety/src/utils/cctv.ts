// 출처: 작업용/점검 항목 정리/CCTV 녹화 설비 현황 251205.xlsx
export type CctvPort = { p: number; cap: string; replaced: string }
export type CctvDvr = {
  no: string
  label: string
  desc: string
  retention: string
  channels: number
  ports: CctvPort[]
}

export const CCTV_INFO_UPDATED = '2025-12-05'

export const CCTV_DVRS: CctvDvr[] = [
  { no: 'DVR-01', label: 'DVR 1',  desc: '8F, 7F',            retention: '50일',           channels: 16, ports: [{ p:4, cap:'2TB', replaced:'기존' }, { p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-02', label: 'DVR 2',  desc: '6F, 5F',            retention: '50일',           channels: 16, ports: [{ p:4, cap:'2TB', replaced:'기존' }, { p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-03', label: 'DVR 3',  desc: '5F, 2F',            retention: '39일',           channels: 16, ports: [{ p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'2TB', replaced:'2025-12-05' }] },
  { no: 'DVR-04', label: 'DVR 4',  desc: '3F',                retention: '50일',           channels: 16, ports: [{ p:3, cap:'2TB', replaced:'기존' }, { p:4, cap:'2TB', replaced:'기존' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-05', label: 'DVR 5',  desc: '3F, 2F',            retention: '47일',           channels: 14, ports: [{ p:4, cap:'2TB', replaced:'기존' }, { p:6, cap:'2TB', replaced:'2025-12-05' }] },
  { no: 'DVR-06', label: 'DVR 6',  desc: '1F, B1F',           retention: '56일',           channels: 15, ports: [{ p:3, cap:'2TB', replaced:'기존' }, { p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-07', label: 'DVR 7',  desc: 'B1F, B2F',          retention: '63일',           channels: 15, ports: [{ p:4, cap:'2TB', replaced:'2025-12-05' }, { p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'2TB', replaced:'2025-12-05' }] },
  { no: 'DVR-08', label: 'DVR 8',  desc: 'B2F~B4F',           retention: '57일',           channels: 14, ports: [{ p:4, cap:'2TB', replaced:'2025-12-05' }, { p:5, cap:'2TB', replaced:'2025-12-05' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-09', label: 'DVR 9',  desc: 'B3F (주차장)',       retention: '55일',           channels: 14, ports: [{ p:4, cap:'2TB', replaced:'기존' }, { p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-10', label: 'DVR 10', desc: 'B4F (주차장)',       retention: '45일',           channels: 15, ports: [{ p:4, cap:'2TB', replaced:'2025-08-19' }, { p:5, cap:'2TB', replaced:'2025-12-05' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-11', label: 'DVR 11', desc: 'B5F (주차장)',       retention: '52일',           channels: 15, ports: [{ p:3, cap:'2TB', replaced:'기존' }, { p:5, cap:'2TB', replaced:'기존' }, { p:6, cap:'1TB', replaced:'기존' }] },
  { no: 'DVR-12', label: 'DVR 12', desc: '리서치프라자, 서버실', retention: '91일',           channels: 8,  ports: [{ p:2, cap:'2TB', replaced:'기존' }] },
  { no: 'DVR-13', label: 'DVR 13', desc: '국제회의실, 대강당',   retention: '120일 (추정)',    channels: 7,  ports: [{ p:1, cap:'4TB', replaced:'2026-04-28' }] },
]
