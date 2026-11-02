# De las Sierras — Playing Good Music (v2.2)

Sitio React + Vite para Cloudflare Pages, bilingüe EN/ES.

## Funciones
- Reproductor ArgentinaStream embebido: audio, metadatos y reconexión administrados por el proveedor.
- Historial SonicPanel actualizado cada 15 segundos; primera pista turquesa, sweepers grises, restantes blancas.
- Directorios: TuneIn, Online Radio Box, radio.net, Live Online Radio.
- Reproductores externos: Winamp, VLC, Windows Media y Apple Music (enlaces PLS/ASX).
- Descarga de aplicación Android mediante GitHub Releases.
- Playlist de Spotify.
- Ko-fi con imagen QR original provista, alojada en `public/kofi-qr.png`.

## Despliegue
Subir el contenido del ZIP a la raíz del repositorio GitHub, conservando carpetas `src/` y `public/`. En Cloudflare Pages usar `npm run build` y directorio `dist`. No cambiar todavía el dominio de Google Sites.

## Pruebas
Verificar el iframe, el historial y el selector de idiomas, además de los enlaces externos, la descarga APK y el QR de Ko-fi. Los enlaces de reproductores PLS/ASX requieren aplicaciones compatibles instaladas.


## Version 2.3
- Simplified hero: removed the three centered promotional texts.
- Enlarged the brand in the upper left and added bilingual station descriptors.
- Renamed the navigation item to Ways to listen / Formas de escuchar.
- Removed the Listen wherever you are heading, description and direct stream link.
- Retained external player links and Android APK download under Ways to listen.
