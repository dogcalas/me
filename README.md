# abrahamcalas.dev

Portfolio estático desplegado en Cloudflare Pages.

- `index.html`: página en español (fuente de verdad, incluye el objeto `translations`).
- `en/index.html`: versión en inglés, **generada**. No se edita a mano.
- `scripts/build-en.js`: genera `en/index.html` a partir de `index.html`.

Tras cualquier cambio en `index.html`:

```
node scripts/build-en.js
```

Las fotos de `img/` se sirven en WebP (max 1400 px). Para añadir una:

```
magick foto.jpg -auto-orient -strip -resize '1400x1400>' -quality 80 img/nombre.webp
```

`img/og-image.jpg` es la imagen de previsualización para redes (1200x630).
