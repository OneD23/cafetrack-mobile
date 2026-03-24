# Evitar conflictos en PR (CafeTrack)

## Flujo recomendado (antes de abrir / actualizar PR)

1. Trae cambios remotos:
   ```bash
   git fetch origin
   ```
2. Rebasea tu rama con `main` frecuentemente:
   ```bash
   git checkout <tu-rama>
   git rebase origin/main
   ```
3. Si hay conflictos, resuélvelos localmente (no en GitHub web), corre checks y luego empuja:
   ```bash
   git add <archivos>
   git rebase --continue
   npm --prefix cafetrack-mobile run ts:check
   git push --force-with-lease
   ```

> Rebase temprano y frecuente reduce muchísimo conflictos en archivos activos como `LoginScreen.tsx`, `POSScreen.tsx` y `SettingsScreen.tsx`.

## Config útil para no repetir resolución manual

Habilita `rerere` para que Git recuerde cómo resolviste conflictos:

```bash
git config --global rerere.enabled true
git config --global rerere.autoupdate true
```

## Buenas prácticas para este repo

- Haz PRs pequeños (una feature por PR).
- Evita mezclar cambios de UI + backend + store en el mismo commit.
- Sincroniza con `main` antes de tocar pantallas de alta colisión.
- Si tu PR toca `LoginScreen.tsx`, `POSScreen.tsx` o `SettingsScreen.tsx`, rebasea justo antes de subir.

## Comando rápido (atajo)

```bash
git fetch origin && git rebase origin/main && npm --prefix cafetrack-mobile run ts:check
```

Si pasa, sube con:

```bash
git push --force-with-lease
```
