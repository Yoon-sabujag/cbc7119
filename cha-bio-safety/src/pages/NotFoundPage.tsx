import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh bg-surface-page text-text-primary flex flex-col items-center justify-center gap-4">
      <p className="text-[96px] font-black text-text-tertiary m-0 leading-none tracking-[-0.02em]">404</p>
      <p className="text-title font-semibold m-0">페이지를 찾을 수 없습니다</p>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="h-button px-[28px] rounded-md bg-accent-active border-none text-text-on-accent text-body font-bold cursor-pointer"
      >
        대시보드로 이동
      </button>
    </div>
  )
}
