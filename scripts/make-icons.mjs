// Genera los iconos de la PWA a partir del logo (assets/logo-source.png).
import sharp from 'sharp'

const SRC = 'assets/logo-source.png'
const BG = '#1A1A1A'

async function icon(out, size, scale) {
  const inner = Math.round(size * scale)
  const logo = await sharp(SRC).resize(inner, inner).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(out)
}

await icon('public/pwa-192.png', 192, 0.88)
await icon('public/pwa-512.png', 512, 0.88)
await icon('public/apple-touch-icon.png', 180, 0.88)
await icon('public/maskable-512.png', 512, 0.72)
await sharp(SRC).resize(512, 512).png().toFile('public/logo-512.png')
console.log('Iconos generados')
