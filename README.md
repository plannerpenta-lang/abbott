# FarmaBogotá — Demo Abbott

Mapa interactivo de las 20 localidades de Bogotá para registrar farmacias.
Single-page estática, sin backend, datos en `localStorage` del navegador.

## Stack

- HTML5 + CSS3 + JavaScript (vanilla, sin frameworks)
- [Leaflet 1.9.4](https://leafletjs.com/) (incluido en `vendor/leaflet/`)
- GeoJSON local con los polígonos de las 20 localidades en `data/localidades.geojson`

## Estructura

```
farmabogota/
├── index.html              # Página principal
├── css/styles.css          # Estilos (paleta Abbott)
├── js/app.js               # Lógica del mapa y CRUD
├── data/
│   └── localidades.geojson # Polígonos de las 20 localidades
├── vendor/leaflet/         # Leaflet 1.9.4 local (sin CDN)
│   ├── leaflet.css
│   ├── leaflet.js
│   └── images/
└── docs/                   # (reservado para capturas/documentación)
```

## Uso local

Necesitas servir los archivos con un servidor HTTP (no se puede abrir
`index.html` directamente porque `fetch()` del GeoJSON requiere HTTP).

```bash
cd farmabogota
python3 -m http.server 8000
# Abrir http://localhost:8000 en el navegador
```

Alternativas: `npx serve .`, `php -S localhost:8000`, VS Code Live Server, etc.

## Desplegar en GitHub Pages

1. Crear repo en GitHub y subir:
   ```bash
   cd farmabogota
   git init
   git add .
   git commit -m "feat: FarmaBogotá demo inicial"
   git branch -M main
   git remote add origin https://github.com/<usuario>/farmabogota.git
   git push -u origin main
   ```

2. En GitHub → **Settings → Pages**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `(root)`
   - Save

3. Esperar ~1 min. La URL pública será:
   `https://<usuario>.github.io/farmabogota/`

## Reemplazar el GeoJSON con datos oficiales

El archivo `data/localidades.geojson` es un mock con coordenadas y formas
aproximadas para el demo. Para producción:

1. Bajar el GeoJSON oficial de IDECA (Infraestructura de Datos
   Espaciales de Bogotá) o Datos Abiertos Bogotá.
2. Validar la estructura (`FeatureCollection` con `Feature` que tengan
   `properties.nombre` y `geometry.type === "Polygon"`).
3. Reemplazar el archivo. No requiere tocar código.

## Limitaciones del demo

- Los polígonos del GeoJSON son **aproximaciones**, no las formas
  oficiales del DANE/IDECA. Para un demo de presentación se ven bien;
  para uso legal/cartografía real usar la fuente oficial.
- El almacenamiento es `localStorage`: cada navegador/dispositivo tiene
  sus propios datos. No hay sync entre usuarios.
- El mapa no tiene tiles de fondo (look cartográfico limpio). Si querés
  ver calles y referencias geográficas, agregar un Tile Layer de
  OpenStreetMap en `js/app.js`.

## Cliente

Demo desarrollado para **Abbott** como presentación del proyecto
FarmaBogotá.
