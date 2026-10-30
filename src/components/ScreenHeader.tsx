import { ChevronLeft } from 'lucide-react'
import { RopeDivider } from './RopeDivider'

interface Props {
  title: string
  onBack: () => void
}

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <header className="pt-safe rock sticky top-0 z-10">
      <div className="relative flex items-center justify-center px-4 py-4">
        <button onClick={onBack} className="absolute left-2 flex items-center text-xl text-accent">
          <ChevronLeft className="h-7 w-7" />
          Volver
        </button>
        <h1 className="text-3xl">{title}</h1>
      </div>
      <RopeDivider />
    </header>
  )
}
