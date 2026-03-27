import { useState, useEffect } from 'react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function fmt(d: Date) {
  const mo  = d.getMonth() + 1
  const day = d.getDate()
  const dow = DAYS[d.getDay()]
  const hh  = String(d.getHours()).padStart(2, '0')
  const mm  = String(d.getMinutes()).padStart(2, '0')
  return `${mo}.${day}(${dow})  ${hh}:${mm}`
}

export function useDateTime() {
  const [text, setText] = useState(() => fmt(new Date()))
  useEffect(() => {
    const id = setInterval(() => setText(fmt(new Date())), 10_000)
    return () => clearInterval(id)
  }, [])
  return text
}

export function getWeekLabel(d = new Date()) {
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const wk   = Math.ceil(((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7)
  const dow  = new Date(d.getFullYear(), d.getMonth(), 1).getDay()
  const wom  = Math.ceil((d.getDate() + dow) / 7)
  return `${d.getFullYear()} W${String(wk).padStart(2, '0')}  ${d.getMonth() + 1}월 ${wom}주차`
}
