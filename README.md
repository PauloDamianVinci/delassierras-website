# De las Sierras — Playing Good Music (v2.1)

Sitio web React + Vite para Cloudflare Pages, bilingüe EN/ES, sin instalaciones locales.

## Reproductor

El reproductor principal es un iframe de https://argentinastream.com/delassierras/ . La reproducción, los metadatos visibles dentro del iframe y la reconexión dependen de ArgentinaStream. **No** hay un segundo reproductor HTML Audio en paralelo.

## Historial

El historial separado consulta https://server.streamcasthd.com/cp/get_info.php?p=8682 cada 15 segundos. Conserva la primera pista turquesa (#27F5EE), los sweepers grises (grey), el resto blanco y el encabezado azul (#2A7FFF). Si la primera pista es un sweeper, tiene prioridad el turquesa. Se conserva la última respuesta válida ante fallos. La API debe permitir CORS desde el dominio de Cloudflare Pages.

## Publicación

Subir **todo el contenido** de este ZIP a la raíz del repositorio GitHub (no el ZIP como archivo), reemplazando los archivos existentes. Cloudflare Pages: framework React (Vite), build `npm run build`, output `dist`, branch `main`. La imagen `public/Fondo03.jpg` está incluida.

## Pruebas

1. Confirmar que el iframe se visualiza y reproduce audio (PC y móvil).
2. Verificar artista/título y reconexión dentro del iframe.
3. Comprobar historial y colores (y que no hay dos reproductores simultáneos).
4. Comprobar cambio EN/ES.
5. Si el iframe queda cortado, ajustar `.player-embed` height en `src/style.css` según el tamaño real del reproductor.

No cambiar todavía el dominio personalizado de Google Sites.
