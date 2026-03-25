#!/usr/bin/env bash
set -euo pipefail

# Auto-resolve known recurring conflicts in this repo.
# Usage:
#   ./scripts/git/auto_resolve_conflicts.sh ours
#   ./scripts/git/auto_resolve_conflicts.sh theirs
#   ./scripts/git/auto_resolve_conflicts.sh ours path/to/file1 path/to/file2

STRATEGY="${1:-ours}"
shift || true

if [[ "$STRATEGY" != "ours" && "$STRATEGY" != "theirs" ]]; then
  echo "Uso: $0 <ours|theirs> [archivos...]"
  exit 1
fi

DEFAULT_FILES=(
  "cafetrack-mobile/src/components/RecipeModal.tsx"
  "cafetrack-mobile/src/screens/InventoryScreen.tsx"
  "cafetrack-mobile/src/screens/LoginScreen.tsx"
  "cafetrack-mobile/src/screens/POSScreen.tsx"
  "cafetrack-mobile/src/store/index.ts"
)

if [[ $# -gt 0 ]]; then
  FILES=("$@")
else
  FILES=("${DEFAULT_FILES[@]}")
fi

# Ensure there is an in-progress merge/rebase conflict state.
if ! git diff --name-only --diff-filter=U | grep -q .; then
  echo "No hay conflictos sin resolver (diff-filter=U vacío)."
  exit 0
fi

for f in "${FILES[@]}"; do
  if git ls-files -u -- "$f" | grep -q .; then
    echo "Resolviendo $f con estrategia: $STRATEGY"
    if [[ "$STRATEGY" == "ours" ]]; then
      git checkout --ours -- "$f"
    else
      git checkout --theirs -- "$f"
    fi
    git add "$f"
  else
    echo "Sin conflicto activo en: $f"
  fi
done

echo
echo "Estado de conflictos restante:"
git diff --name-only --diff-filter=U || true

echo
echo "Siguiente paso:"
echo "  - Si ya no hay conflictos: git rebase --continue  (o git commit si estabas en merge)"
echo "  - Luego: npm --prefix cafetrack-mobile run check:screens && npm --prefix cafetrack-mobile run ts:check"
