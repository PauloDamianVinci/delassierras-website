# De las Sierras — Radio Monitor v1.0 — Etapa 2.1
Dashboard React/Vite en español para Cloudflare Pages.

## Despliegue sin instalación local
1. Crear repositorio GitHub y subir los archivos de este ZIP (incluida carpeta `.github`).
2. En Actions ejecutar «Compilar monitor»; descargar artifact `radio-monitor-dist`.
3. Subir el contenido compilado a Cloudflare Pages (Direct Upload), o conectar el repositorio con comando `npm run build` y directorio `dist`.

## Fuentes
- Oyentes: Google Apps Script existente, cada 20 s.
- Geolocalización: Google Apps Script existente, caché navegador de 24 h.
- Historial: SonicPanel, cada 15 s.
- Mapa: Leaflet/OpenStreetMap.

## Advertencias
El monitor es público y expone IP completas. Los endpoints originales también son públicos. Verificar CORS y cuotas en el navegador tras publicar. La clasificación humano/bot es heurística y puede dar falsos positivos. El acceso al mapa usa los servidores comunitarios de teselas de OpenStreetMap y debe respetar su política de uso.

## Etapa 2.1: optimización de geolocalización
- Conserva los mismos servicios y la misma presentación de v1.0.
- Reutiliza una única solicitud pendiente por IP entre ciclos de refresco.
- Cancela consultas geográficas que superen 8 segundos.
- Caché de éxitos: 24 horas; fallos: 60 segundos; límite: 500 IP en memoria.
- Mantiene los lotes de hasta 5 IP por ciclo.
- La caché es temporal del navegador, no persiste tras cerrar la pestaña.

### Prueba de aceptación
Comparar con la v1.0: mismo número de conexiones y ubicaciones, mismo mapa e historial.
Abrir herramientas del navegador > Network y verificar que la misma IP no provoca solicitudes geográficas simultáneas.

## Etapa 2.2
- Ajuste del mapa cuando cambia el conjunto de ubicaciones humanas (sin reajustar cada refresco).
- Indicador de conexiones repetidas por IP.
- Orden de contadores: Total, Humanos, IP únicas humanas, Bots.


## Etapa 2.3
Diseño compacto, mapa oscuro por defecto mediante filtro CSS de teselas OSM, historial a la derecha en escritorio, contadores compactos, ubicación junto a IP e iconos para reproductor y duración.

## Etapa 2.3.6
- Oyentes humanos ordenados por ciudad (A–Z) y luego por IP en orden natural numérico. Las ciudades desconocidas quedan al final de los humanos. Los bots conservan su orden original.

## Etapa 2.3.7
- Resaltado de ciudad exclusivo de humanos; el mapa recibe solo humanos y mantiene su filtro interno de bots.
