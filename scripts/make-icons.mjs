// Genera los iconos de la PWA sobre fondo blanco: mitad izquierda cronómetro (blanco con
// borde negro y detalles en rojo), mitad derecha el logo de Txus Climb Factory (assets/logo-source.png).
// Dentro de la app se sigue usando el logo original (public/logo-512.png).
import sharp from 'sharp'

const SRC = 'assets/logo-source.png'
const BG = '#FFFFFF'
const BLACK = '#111111'
const WHITE = '#FFFFFF'
const RED = '#C8455A' // el rojo del cielo del logo
const S = 1024
const CX = S / 2
const CY = 540 // centro común de la esfera y del rombo

function stopwatchSvg() {
  const r = 360
  let ticks = ''
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const big = i % 5 === 0
    const r1 = r - 34
    const r2 = r - (big ? 92 : 60)
    ticks += `<line x1="${CX + Math.sin(a) * r1}" y1="${CY - Math.cos(a) * r1}" x2="${CX + Math.sin(a) * r2}" y2="${CY - Math.cos(a) * r2}" stroke="${big ? RED : WHITE}" stroke-width="${big ? 16 : 7}" stroke-linecap="round"/>`
  }
  const ha = (-50 / 360) * Math.PI * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    <rect x="${CX - 60}" y="86" width="120" height="66" rx="20" fill="${RED}" stroke="${BLACK}" stroke-width="10"/>
    <rect x="${CX - 22}" y="140" width="44" height="60" fill="${WHITE}" stroke="${BLACK}" stroke-width="10"/>
    <rect x="${CX + 230}" y="168" width="66" height="42" rx="14" fill="${WHITE}" stroke="${BLACK}" stroke-width="10" transform="rotate(45 ${CX + 263} 189)"/>
    <circle cx="${CX}" cy="${CY}" r="${r + 26}" fill="${BLACK}"/>
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="${BLACK}" stroke="${WHITE}" stroke-width="42"/>
    <circle cx="${CX}" cy="${CY}" r="${r - 26}" fill="none" stroke="${BLACK}" stroke-width="10"/>
    ${ticks}
    <line x1="${CX}" y1="${CY}" x2="${CX + Math.sin(ha) * (r - 105)}" y2="${CY - Math.cos(ha) * (r - 105)}" stroke="${RED}" stroke-width="26" stroke-linecap="round"/>
    <circle cx="${CX}" cy="${CY}" r="34" fill="${RED}"/>
  </svg>`
}

async function appIcon() {
  // El rombo a la misma altura que la esfera y sin tocar los bordes
  const L = 900
  const logo = await sharp(SRC).resize(L, L).png().toBuffer()
  const logoLayer = await sharp({ create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, left: CX - L / 2, top: CY - L / 2 }])
    .png()
    .toBuffer()
  const watch = await sharp(Buffer.from(stopwatchSvg())).png().toBuffer()
  const left = await sharp(watch).extract({ left: 0, top: 0, width: S / 2, height: S }).toBuffer()
  const right = await sharp(logoLayer).extract({ left: S / 2, top: 0, width: S / 2, height: S }).toBuffer()
  const seam = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect x="${CX - 6}" y="${CY - 430}" width="12" height="860" rx="6" fill="${RED}"/></svg>`
  return sharp({ create: { width: S, height: S, channels: 4, background: BG } })
    .composite([
      { input: left, left: 0, top: 0 },
      { input: right, left: S / 2, top: 0 },
      { input: Buffer.from(seam), left: 0, top: 0 },
    ])
    .png()
    .toBuffer()
}

const art = await appIcon()
await sharp(art).toFile('assets/app-icon.png')

async function icon(out, size, scale) {
  const inner = Math.round(size * scale)
  const img = await sharp(art).resize(inner, inner).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: img, gravity: 'center' }])
    .png()
    .toFile(out)
}

await icon('public/pwa-192.png', 192, 1)
await icon('public/pwa-512.png', 512, 1)
await icon('public/apple-touch-icon.png', 180, 1)
// Android recorta los maskable en círculo: el dibujo va más pequeño
await icon('public/maskable-512.png', 512, 0.8)
await sharp(SRC).resize(512, 512).png().toFile('public/logo-512.png')
console.log('Iconos generados')
