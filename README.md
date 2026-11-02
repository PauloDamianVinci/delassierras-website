# De las Sierras — Playing Good Music

Sitio web bilingüe (EN/ES) con React + Vite, listo para Cloudflare Pages.

## Publicación sin instalaciones locales

1. Crear un repositorio GitHub (por ejemplo `delassierras-website`).
2. Subir el **contenido** de este ZIP a la raíz del repositorio (no la carpeta contenedora).
3. En Cloudflare: Workers & Pages > Create > Pages > Connect to Git > seleccionar repositorio.
4. Framework preset: Vite; build command: `npm run build`; output directory: `dist`.
5. Publicar primero en el subdominio temporal `*.pages.dev`. No cambiar el DNS del dominio oficial hasta validar.

## Configuración

- Stream: constante `STREAM_URL` en `src/main.jsx`.
- Textos y traducciones: objeto `copy` en `src/main.jsx`.
- Fondo: `public/Fondo03.jpg` (imagen original aportada por el propietario).
- Idioma: detecta navegador, admite cambio manual y guarda preferencia local.

## Alcance de esta primera versión

- Reproducción HTML5 con Play/Stop. No autoplay por restricciones de navegadores.
- No incluye todavía API de canción actual, enlaces a directorios, redes sociales ni APK: se incorporarán después de verificar las URLs y la integración.
- El stream se solicita directamente a SonicPanel; Cloudflare aloja solamente la web.
- No hay promesa de reconexión automática: esta funcionalidad se evaluará y probará posteriormente.
- Para SEO internacional avanzado, generar rutas `/en/` y `/es/` con HTML prerenderizado en una iteración posterior.

## Desarrollo opcional

`npm install` y `npm run dev` para pruebas locales; **no son necesarios** si se publica desde Cloudflare.
