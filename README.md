# De las Sierras — Playing Good Music (v2.4)

Sitio React + Vite para Cloudflare Pages, bilingüe EN/ES.

## Funciones
- Reproductor ArgentinaStream embebido: audio, metadatos y reconexión administrados por el proveedor.
- Historial SonicPanel actualizado cada 15 segundos; primera pista turquesa, sweepers grises, restantes blancas.
- Directorios: TuneIn, Online Radio Box, radio.net, Live Online Radio.
- Reproductores externos: Winamp, VLC, Windows Media y Apple Music (enlaces PLS/ASX).
- Descarga de aplicación Android desde Cloudflare Pages (`public/downloads/DeLasSierrasRadio.apk`).
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
- Retained external player links and direct Android APK download under Ways to listen.

## Version 2.4
- Navigation and section names: Listen Anywhere / Escucha desde cualquier lugar, The Station / La radio.
- History heading: Recently Played / Últimas canciones.
- Updated station description in both languages.
- Neutral Spanish copy throughout the website.
- Audio player, history polling, links, styles and images unchanged.

## Version 2.5

- Replaced the provider-identifying iframe title with a neutral accessible title. Third-party iframe tooltips remain outside the site's control.
- Localized external player, radio directory and Spotify link tooltips for English and Spanish, including accessible labels.
- Combined the footer into one copyright line.
- Kept the audio iframe, SonicPanel polling, styling and other functionality unchanged.


## v2.6.2 — Social links

Added Facebook, Instagram and email contact icons to the existing footer, with responsive styling and accessible labels. No changes to streaming or track metadata.

## v2.6.4 — APK alojada en Cloudflare Pages

- La APK firmada v1.9.0 está en `public/downloads/DeLasSierrasRadio.apk`. Vite la copiará a `dist/downloads/DeLasSierrasRadio.apk` durante el build.
- El botón de descarga usa `/downloads/DeLasSierrasRadio.apk` y no expone el usuario de GitHub.
- Para futuras versiones, reemplazar ese archivo APK y volver a desplegar.
- No publicar el ZIP del proyecto como sitio estático sin ejecutar `npm run build`.
