# Violet dark theme assets

The palette is derived from the supplied purple AR monogram. All UI tokens live in `src/styles/theme.css`; layouts and journey behavior are unchanged.

- `src/assets/violet-silk.png`: dark silk background, used by `src/App.css`.
- `src/components/Header/img/logo.png`: the supplied violet logo prepared on transparency; shared by header, footer and favicon.
- `src/assets/research-tools-atlas.png`: restored original violet researcher tools, with their original eight crop regions.

## Image generation

The background and transparent logo were prepared with the built-in image-generation tool.

Background prompt: Preserve the satin reference composition, flowing ribbon shapes, quiet dark center/right region and subtle silk texture. Recolor all burgundy to dark violet: near-black #0d0914, shadow folds #21112f, silk body #42166a, softly lit edges #8b35cc and restrained lavender #b97ef0. Keep the center almost black for gray text. No neon glare, magenta, red, text, logos, objects, particles or UI. Wide 2.2:1 texture.

Logo prompt: Preserve the supplied purple AR monogram's original violet colors, exact letter geometry, circular ring, proportions, 3D bevels and highlights. Remove only the white background and enclosed white gaps to genuine transparency. Center with transparent padding. No redesign, recoloring or added elements.
