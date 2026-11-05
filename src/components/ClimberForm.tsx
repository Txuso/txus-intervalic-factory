import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fileToAvatar } from '../domain/myPhoto'
import { useT } from '../i18n'
import { BottomSheet } from './BottomSheet'

interface Props {
  open: boolean
  /** Escalador a editar; sin él se crea uno nuevo */
  initial?: { name: string; photo?: string }
  onCancel: () => void
  onConfirm: (name: string, photo?: string) => void
}

const SIZE = 112

/** Nombre y foto de un escalador añadido por el usuario */
export function ClimberForm({ open, initial, onCancel, onConfirm }: Props) {
  const t = useT()
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()
  const [nameError, setNameError] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setPhoto(initial?.photo)
      setNameError(false)
    }
  }, [open, initial])

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    try {
      setPhoto(await fileToAvatar(file))
    } catch {
      // Formato que el navegador no sabe leer: se ignora
    }
  }

  const confirm = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(true)
      return
    }
    onConfirm(trimmed, photo)
  }

  return (
    <BottomSheet open={open} title={initial ? t.editClimber : t.newClimber} onCancel={onCancel} onConfirm={confirm} confirmLabel={t.save}>
      <div className="flex flex-col items-center gap-4 pb-2">
        <button onClick={() => photoInput.current?.click()} className="flex flex-col items-center gap-1 active:opacity-70" aria-label={t.photo}>
          {photo ? (
            <img src={photo} alt="" width={SIZE} height={SIZE} className="rounded-full object-cover ring-2 ring-accent" style={{ width: SIZE, height: SIZE }} />
          ) : (
            <span
              className="flex items-center justify-center rounded-full border-2 border-dashed border-accent text-accent"
              style={{ width: SIZE, height: SIZE }}
            >
              <Camera className="h-10 w-10" />
            </span>
          )}
          <span className="text-lg text-accent">{t.photo}</span>
        </button>
        <input
          value={name}
          onChange={(e) => {
            setNameError(false)
            setName(e.target.value)
          }}
          onKeyDown={(e) => e.key === 'Enter' && confirm()}
          placeholder={t.climberName}
          className={`w-full rounded-lg bg-bg px-4 py-3 text-3xl uppercase text-white outline-none placeholder:text-muted/60 ${nameError ? 'ring-2 ring-rest' : ''}`}
        />
      </div>
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onPhoto(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </BottomSheet>
  )
}
