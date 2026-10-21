#!/usr/bin/env bash
# Ops monetización El Coro — solo AdMob (sin IAP / RevenueCat).
# Uso:
#   cp .env.monetization.example .env.monetization
#   ./scripts/ops_monetization.sh check|ready|sync-env|eas-env|build-preview|build-production|manual
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/apps/mobile"
ENV_FILE="${MONETIZATION_ENV_FILE:-$ROOT/.env.monetization}"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    red "Falta $ENV_FILE"
    yellow "Copia: cp .env.monetization.example .env.monetization"
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    red "Variable vacía: $name (en $ENV_FILE)"
    exit 1
  fi
}

cmd_sync_env() {
  node "$ROOT/scripts/sync_monetization_env.mjs"
}

cmd_check() {
  yellow "== Checklist ops (ads-only) =="
  echo "Modelo:            AdMob intersticial (sin Pro / IAP)"
  echo "Play Advertising:  Declarar ID publicidad = Sí"
  echo "Docs:              docs/MONETIZATION_OPS.md"
  echo
  if [[ -f "$ENV_FILE" ]]; then
    green "✓ $ENV_FILE existe"
    load_env
    for v in EXPO_PUBLIC_ADMOB_ANDROID_APP_ID EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID; do
      if [[ -n "${!v:-}" ]]; then green "✓ $v"; else yellow "○ $v vacío"; fi
    done
  else
    yellow "○ Crea $ENV_FILE desde .env.monetization.example"
  fi
  cmd_sync_env || true
  if [[ -f "$MOBILE/.env" ]]; then green "✓ apps/mobile/.env"; else yellow "○ apps/mobile/.env"; fi
  [[ ! -f "$MOBILE/src/iap.ts" ]] && green "✓ sin iap.ts" || yellow "○ iap.ts aún presente"
  [[ ! -f "$ROOT/apps/server/src/revenueCat.ts" ]] && green "✓ sin revenueCat.ts" || yellow "○ revenueCat.ts aún presente"
  echo
  if command -v eas >/dev/null; then
    eas whoami 2>/dev/null | head -3 || yellow "○ eas: no logueado"
  else
    red "○ eas CLI no instalado"
  fi
}

cmd_ready() {
  cmd_sync_env
  load_env
  local ok=1
  yellow "== Monetization ready (ads-only) =="
  [[ -n "${EXPO_PUBLIC_ADMOB_ANDROID_APP_ID:-}" ]] && green "✓ AdMob app id" || { red "✗ AdMob app id"; ok=0; }
  [[ -n "${EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID:-}" ]] && green "✓ interstitial" || { red "✗ interstitial"; ok=0; }
  [[ -f "$MOBILE/src/ads.ts" ]] && green "✓ ads.ts" || { red "✗ ads.ts"; ok=0; }
  [[ ! -f "$MOBILE/src/iap.ts" ]] && green "✓ Pro/IAP removido" || { red "✗ iap.ts sigue"; ok=0; }
  [[ ! -f "$ROOT/apps/server/src/revenueCat.ts" ]] && green "✓ RC server removido" || { red "✗ revenueCat.ts"; ok=0; }
  if [[ "$ok" -eq 1 ]]; then
    green "READY. Siguiente: Play AD_ID=Sí + eas build nativo"
    exit 0
  fi
  red "Faltan piezas — docs/MONETIZATION_OPS.md"
  exit 1
}

eas_env_set() {
  local name="$1" value="$2" environment="$3"
  if [[ -z "$value" ]]; then
    yellow "Skip $name (vacío)"
    return 0
  fi
  if eas env:create "$environment" \
      --name "$name" \
      --value "$value" \
      --visibility plaintext \
      --force \
      --non-interactive; then
    green "Set $name ($environment)"
  else
    red "Falló eas env:create $name ($environment)"
    return 1
  fi
}

cmd_eas_env() {
  load_env
  require_var EXPO_PUBLIC_ADMOB_ANDROID_APP_ID
  require_var EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID
  : "${EXPO_PUBLIC_ADMOB_IOS_APP_ID:=ca-app-pub-3940256099942544~1458002511}"
  : "${EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS:=ca-app-pub-3940256099942544/4411468910}"

  cd "$MOBILE"
  yellow "Subiendo AdMob env a EAS…"
  for env_name in production preview; do
    eas_env_set EXPO_PUBLIC_ADMOB_ANDROID_APP_ID "$EXPO_PUBLIC_ADMOB_ANDROID_APP_ID" "$env_name"
    eas_env_set EXPO_PUBLIC_ADMOB_IOS_APP_ID "$EXPO_PUBLIC_ADMOB_IOS_APP_ID" "$env_name"
    eas_env_set EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID "$EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID" "$env_name"
    eas_env_set EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS "$EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS" "$env_name"
  done
  green "Listo. Verifica: cd apps/mobile && eas env:list production"
}

cmd_build_preview() {
  cd "$MOBILE"
  yellow "EAS build preview (APK)…"
  eas build -p android --profile preview --non-interactive
}

cmd_build_production() {
  cd "$MOBILE"
  yellow "EAS build production (AAB)…"
  eas build -p android --profile production --non-interactive
}

cmd_print_manual() {
  cat <<'EOF'
=== Manual (ads-only) ===

1) AdMob → app com.yonnunca.party + Interstitial → .env.monetization
2) Play → ID de publicidad = Sí + Data safety (ads)
3) ./scripts/ops_monetization.sh eas-env
4) ./scripts/ops_monetization.sh build-preview

Detalle: docs/MONETIZATION_OPS.md
EOF
}

usage() {
  cat <<EOF
Usage: $0 <check|ready|sync-env|eas-env|build-preview|build-production|manual>
EOF
}

main() {
  local cmd="${1:-check}"
  case "$cmd" in
    check) cmd_check ;;
    ready) cmd_ready ;;
    sync-env) cmd_sync_env ;;
    eas-env) cmd_eas_env ;;
    build-preview) cmd_build_preview ;;
    build-production) cmd_build_production ;;
    manual) cmd_print_manual ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
