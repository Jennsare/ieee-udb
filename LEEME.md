# Sitio web IEEE UDB

Página estática hecha **desde cero con HTML + CSS + JS puros** (sin dependencias ni build).

## Cómo verla

Doble clic en `index.html`, o con un servidor local:

```bash
npx serve .
# o
python -m http.server 8000
```

## Estructura

```
ieee-udb/
├── index.html        # Todas las secciones
├── css/estilos.css   # Paleta IEEE (azul #00629B, azul oscuro, cian)
├── js/script.js      # Menú, contadores, gráficos, tabla y carruseles
└── img/              # Logos y fotos reales del evento y actividades
```

## Qué personalizar

1. **Datos del dashboard**: edita el objeto `datos` al inicio de `js/script.js`
   (asistentes por mes, crecimiento de miembros, distribución y tabla de actividades).
2. **Evento insignia**: en `index.html`, sección `#evento`, reemplaza
   `[Nombre del evento insignia]`, fecha, lugar, asistentes y programa.
3. **Fotos**: sustituye cualquier foto de `img/` por las tuyas
   (misma ruta y nombre, formato jpg/png) sin tocar el HTML.
4. **Colores**: todas las variables están en `:root` dentro de `css/estilos.css`.
