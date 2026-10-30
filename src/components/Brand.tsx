export function Brand({ size = 160 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center py-6">
      <img src="/logo-512.png" alt="Txus Climb Factory" width={size} height={size} draggable={false} />
      <div className="mt-3 text-3xl tracking-wide text-accent">Txus Intervalic Factory</div>
    </div>
  )
}
