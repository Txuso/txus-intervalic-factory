// Recorta las fotos de assets/climbers/ en cuadrado alrededor de la cara y las reduce
// a 256 px en src/assets/climbers/. Coordenadas en píxeles del original; `rotate` endereza la cara.
import sharp from 'sharp'

const CROPS = {
  sharma: { cx: 270, cy: 170, size: 340 },
  // Cuelga boca abajo del techo
  ondra: { cx: 515, cy: 320, size: 230, rotate: 270 },
  janja: { cx: 455, cy: 390, size: 360 },
  // La foto está tomada de lado
  margo: { cx: 470, cy: 300, size: 210, rotate: -90 },
  andrada: { cx: 240, cy: 265, size: 250 },
  josune: { cx: 720, cy: 530, size: 620 },
  michaela: { cx: 765, cy: 410, size: 300 },
  patxi: { cx: 160, cy: 125, size: 210 },
}

for (const [id, { cx, cy, size, rotate = 0 }] of Object.entries(CROPS)) {
  const src = `assets/climbers/${id}.jpg`
  const { width, height } = await sharp(src).metadata()
  const s = Math.min(size, width, height)
  const left = Math.min(Math.max(0, Math.round(cx - s / 2)), width - s)
  const top = Math.min(Math.max(0, Math.round(cy - s / 2)), height - s)
  // Recorte y giro en dos pasos: sharp aplicaría el giro antes del recorte
  const square = await sharp(src).extract({ left, top, width: s, height: s }).toBuffer()
  await sharp(square)
    .rotate(rotate)
    .resize(256, 256)
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`src/assets/climbers/${id}.jpg`)
  console.log(id, { left, top, size: s })
}
