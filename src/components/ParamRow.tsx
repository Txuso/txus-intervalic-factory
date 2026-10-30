import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  subtitle: string
  value: ReactNode
  onClick: () => void
}

export function ParamRow({ icon, title, subtitle, value, onClick }: Props) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-line px-4 py-4 text-left active:bg-white/5">
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-[1.7rem] leading-none">{title}</span>
        <span className="mt-1 block text-base leading-tight text-muted">{subtitle}</span>
      </span>
      <span className="tabular text-[2.6rem] leading-none">{value}</span>
      <ChevronRight className="h-6 w-6 shrink-0 text-muted" />
    </button>
  )
}
