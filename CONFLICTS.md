# Evitar conflictos en PR (CafeTrack)

> **Realidad importante:** no existe “cero conflictos para siempre” si varias ramas editan las mismas líneas.
> Lo que sí puedes lograr es **casi eliminarlos** con una estrategia de flujo + automatización.

## Estrategia recomendada (la que más reduce conflictos)

1. **Ramas cortas y PRs pequeños**
   - 1 feature o bug por PR.
   - Evita mezclar backend + store + UI en el mismo cambio si no es necesario.

2. **Sincronización diaria con `main`**
   - Rebasea tu rama con `origin/main` al empezar el día y antes de push.

3. **Resolver conflictos siempre en local**
   - No uses el editor web de GitHub para conflictos complejos.
   - Corre `ts:check` antes de subir.

4. **Git recuerda tus soluciones (`rerere`)**
   - Actívalo una sola vez globalmente para que Git reaplique resoluciones anteriores.

5. **No commitear artefactos de entorno**
   - Evita subir cambios accidentales en `node_modules` o archivos generados.

---

## Setup una sola vez (global)

```bash
git config --global rerere.enabled true
git config --global rerere.autoupdate true
git config --global pull.rebase true
git config --global rebase.autoStash true
```

---

## Flujo diario (sin dolores)

Usa este script desde la raíz del repo:

```bash
./scripts/git/sync_branch.sh <tu-rama>
```

Qué hace:
- valida que estés en un repo git,
- cambia a la rama indicada,
- trae cambios de remoto,
- ejecuta `rebase origin/main`,
- corre `npm --prefix cafetrack-mobile run ts:check`.

Si todo pasa, sube con:

```bash
git push --force-with-lease
```

---

## Si aparece conflicto de todas formas

```bash
git status
# editar archivos con conflicto
# eliminar <<<<<<< ======= >>>>>>>
git add <archivos>
git rebase --continue
```

Si te equivocas:

```bash
git rebase --abort
```

---

## Zonas calientes de este repo

Rebasea justo antes de push si tocas:
- `cafetrack-mobile/src/screens/LoginScreen.tsx`
- `cafetrack-mobile/src/screens/POSScreen.tsx`
- `cafetrack-mobile/src/screens/SettingsScreen.tsx`
- `cafetrack-mobile/src/components/RecipeModal.tsx`

---

## Checklist antes de abrir/actualizar PR

- [ ] `git fetch origin`
- [ ] `git rebase origin/main`
- [ ] `npm --prefix cafetrack-mobile run ts:check`
- [ ] `git status` limpio (sin `node_modules` cambiados)
- [ ] `git push --force-with-lease`

---

## ¿Qué hacer en la pantalla **Resolve conflicts** de GitHub?

Si estás en `github.com/.../pull/.../conflicts`:

1. En cada archivo en conflicto, usa **Accept incoming change** cuando quieras conservar lo que viene de `main`.
2. Usa **Accept current change** cuando quieras conservar lo de tu rama del PR.
3. Si necesitas ambas cosas, usa **Accept both changes** y luego limpia manualmente líneas duplicadas.
4. Elimina cualquier marcador `<<<<<<<`, `=======`, `>>>>>>>`.
5. Revisa que el archivo compile (sobre todo `LoginScreen.tsx` y `RecipeModal.tsx`).
6. Haz clic en **Mark as resolved** por archivo.
7. Al final, haz **Commit merge**.

> Recomendado: para conflictos grandes, mejor resolver en local con rebase y luego `git push --force-with-lease`.
