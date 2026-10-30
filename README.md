# Txus Intervalic Factory

Temporizador Tabata instalable como app (PWA) en iPhone y Android, con el estilo de Timer Plus.

- Parámetros: Prepárate, Entrenar, Descansar, Rondas, Ciclos, Descansar entre ciclos y Enfriamiento.
- Entrenos guardados con nombre ("Mis entrenos").
- Historial de los últimos 10 entrenos (completados y parados), que se pueden repetir o guardar con nombre.
- Avisos independientes: pitidos, voz y vibración, con control de volumen.
- Funciona sin conexión. Los datos se guardan solo en el dispositivo (con exportar/importar en Ajustes).

## Desarrollo

```bash
npm install
npm run dev       # servidor local
npm test          # tests del motor del timer
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ en local
npm run icons     # regenera los iconos desde assets/logo-source.png
```

## Despliegue en Vercel

Vercel detecta Vite automáticamente (build `npm run build`, salida `dist`).

- Desde la web: importa el repo de GitHub en vercel.com → Deploy. Cada push a `master` vuelve a desplegar.
- Desde la terminal: `npx vercel` (preview) y `npx vercel --prod`.

## Instalar en el móvil

- **iPhone**: abre la URL en Safari → botón Compartir → "Añadir a pantalla de inicio".
- **Android**: abre la URL en Chrome → menú ⋮ → "Instalar aplicación".

## Notas de iPhone

- Si bloqueas el móvil o sales de la app, iOS la congela y no suenan los avisos. Al volver, el timer se pone al día solo. Por eso "Mantener pantalla encendida" viene activado.
- El sonido funciona aunque el iPhone esté en modo silencio (Safari 17 o superior).
- La vibración en iPhone es un toque háptico suave (iOS 18 o superior); Safari no permite vibraciones largas.
