interface GlobalHeaderProps {
  title: string
  onMenuOpen: () => void
  rightSlot?: React.ReactNode
  leftSlot?: React.ReactNode  // 햄버거 대신 표시 (예: 뒤로가기 버튼)
}

export function GlobalHeader({ title, onMenuOpen, rightSlot, leftSlot }: GlobalHeaderProps) {
  return (
    <header className="flex items-center h-12 px-3 bg-surface-raised border-b border-border-default shrink-0">
      {leftSlot ?? (
        <button
          onClick={onMenuOpen}
          aria-label="메뉴 열기"
          className="w-7 h-7 rounded-[7px] bg-surface-sunken text-text-secondary border-none cursor-pointer flex items-center justify-center shrink-0"
        >
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <span
        className={`flex-1 text-title font-semibold text-text-primary ${rightSlot ? 'text-left ml-2' : 'text-center'}`}
      >
        {title}
      </span>
      {rightSlot || <div className="w-7 shrink-0" />}
    </header>
  )
}
