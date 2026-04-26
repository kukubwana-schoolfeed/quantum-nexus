#!/usr/bin/env bash
# ============================================================================
# QUANTUM NEXUS — Database Seed Runner
# Phase: 3
# Terminal: 4 (Database)
#
# Applies all migrations in timestamp order, then seeds in dependency order.
# Designed for: Supabase local dev, CI pipelines, and fresh environment setup.
#
# Usage:
#   ./seed-runner.sh                # Full reset: nuke → migrate → seed
#   ./seed-runner.sh --migrate      # Migrate only (no seed data)
#   ./seed-runner.sh --seed         # Seed only (assumes migrations exist)
#   ./seed-runner.sh --verify       # Verify schema without modifying data
#
# Environment variables (required):
#   SUPABASE_DB_URL   — PostgreSQL connection string
#                       e.g. postgresql://postgres:password@127.0.0.1:54322/postgres
#
#   Or use Supabase CLI:
#     supabase start
#     export SUPABASE_DB_URL=$(supabase status | grep 'DB URL' | awk '{print $3}')
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${SCRIPT_DIR}/migrations"
SEEDS_DIR="${SCRIPT_DIR}/seeds"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log_header() {
  echo -e "\n${CYAN}========================================${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}========================================${NC}\n"
}

log_step() {
  echo -e "${GREEN}  ✓ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}  ⚠ $1${NC}"
}

log_error() {
  echo -e "${RED}  ✗ $1${NC}"
}

run_sql_file() {
  local label="$1"
  local filepath="$2"

  if [[ ! -f "$filepath" ]]; then
    log_error "${label}: file not found — ${filepath}"
    return 1
  fi

  psql "${DB_URL}" -v ON_ERROR_STOP=1 --quiet -f "$filepath" 2>&1 | while IFS= read -r line; do
    # Suppress normal psql output, only show errors
    if [[ "$line" == ERROR* ]] || [[ "$line" == FATAL* ]]; then
      log_error "${label}: ${line}"
      return 1
    fi
  done

  log_step "${label}"
}

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

check_db_connection() {
  log_header "PRE-FLIGHT: Database Connection"

  if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
    # Try Supabase CLI as fallback
    if command -v supabase &>/dev/null; then
      local cli_db_url
      cli_db_url=$(supabase status 2>/dev/null | grep 'DB URL' | awk '{print $3}' || true)
      if [[ -n "$cli_db_url" ]]; then
        DB_URL="$cli_db_url"
        log_warn "SUPABASE_DB_URL not set — using Supabase CLI detected URL"
      fi
    fi

    if [[ -z "${DB_URL:-}" ]]; then
      log_error "SUPABASE_DB_URL environment variable is not set"
      echo ""
      echo "  Set it with:"
      echo "    export SUPABASE_DB_URL='postgresql://postgres:password@127.0.0.1:54322/postgres'"
      echo ""
      echo "  Or start Supabase locally:"
      echo "    supabase start"
      echo "    export SUPABASE_DB_URL=\$(supabase status | grep 'DB URL' | awk '{print \$3}')"
      exit 1
    fi
  else
    DB_URL="$SUPABASE_DB_URL"
  fi

  # Test connection
  if psql "${DB_URL}" -c "SELECT 1" &>/dev/null; then
    log_step "Database connection OK"
  else
    log_error "Cannot connect to database"
    exit 1
  fi
}

check_psql() {
  if ! command -v psql &>/dev/null; then
    log_error "psql not found — install PostgreSQL client tools"
    exit 1
  fi
  log_step "psql available"
}

# ---------------------------------------------------------------------------
# Operations
# ---------------------------------------------------------------------------

do_nuke() {
  log_header "NUKE: Dropping all Quantum Nexus tables"

  # Drop in reverse dependency order to avoid FK constraint errors
  psql "${DB_URL}" -v ON_ERROR_STOP=1 --quiet <<'NUKE_SQL'
SET client_min_messages TO WARNING;

DROP TABLE IF EXISTS dead_jobs CASCADE;
DROP TABLE IF EXISTS birthday_tokens CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS analytics_snapshots CASCADE;
DROP TABLE IF EXISTS cannibalisation_reports CASCADE;
DROP TABLE IF EXISTS entity_listings CASCADE;
DROP TABLE IF EXISTS client_health_scores CASCADE;
DROP TABLE IF EXISTS reputation_velocity CASCADE;
DROP TABLE IF EXISTS business_audits CASCADE;
DROP TABLE IF EXISTS trends CASCADE;
DROP TABLE IF EXISTS indexed_pages CASCADE;
DROP TABLE IF EXISTS seo_tasks CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS content_posts CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;
DROP TABLE IF EXISTS encrypted_keys CASCADE;
DROP TABLE IF EXISTS niche_profiles CASCADE;
DROP TABLE IF EXISTS platform_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS resellers CASCADE;
NUKE_SQL

  log_step "All tables dropped"
}

do_migrate() {
  log_header "MIGRATE: Applying schema in dependency order"

  local migration_count=0
  local failed=0

  for file in $(ls "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
    local basename
    basename=$(basename "$file")
    migration_count=$((migration_count + 1))

    echo -e "  ${CYAN}[${migration_count}]${NC} ${basename}"

    if ! psql "${DB_URL}" -v ON_ERROR_STOP=1 --quiet -f "$file"; then
      log_error "FAILED: ${basename}"
      failed=$((failed + 1))
    fi
  done

  if [[ $failed -gt 0 ]]; then
    log_error "${failed} migration(s) failed out of ${migration_count}"
    exit 1
  fi

  log_step "${migration_count} migrations applied successfully"
}

do_seed() {
  log_header "SEED: Inserting test data in dependency order"

  local seed_files=(
    "01_platform_seed.sql"
    "02_business_data_seed.sql"
    "03_analytics_operations_seed.sql"
  )

  local seed_count=0
  local failed=0

  for seed_file in "${seed_files[@]}"; do
    local filepath="${SEEDS_DIR}/${seed_file}"

    if [[ ! -f "$filepath" ]]; then
      log_error "Seed file not found: ${filepath}"
      failed=$((failed + 1))
      continue
    fi

    seed_count=$((seed_count + 1))

    echo -e "  ${CYAN}[${seed_count}]${NC} ${seed_file}"

    if ! psql "${DB_URL}" -v ON_ERROR_STOP=1 --quiet -f "$filepath"; then
      log_error "FAILED: ${seed_file}"
      failed=$((failed + 1))
    fi
  done

  if [[ $failed -gt 0 ]]; then
    log_error "${failed} seed file(s) failed out of ${seed_count}"
    exit 1
  fi

  log_step "${seed_count} seed files applied successfully"
}

do_verify() {
  log_header "VERIFY: Checking schema integrity"

  # Check all expected tables exist
  local expected_tables=(
    "resellers"
    "tenants"
    "platform_users"
    "niche_profiles"
    "encrypted_keys"
    "business_profiles"
    "content_posts"
    "customers"
    "seo_tasks"
    "indexed_pages"
    "trends"
    "business_audits"
    "reputation_velocity"
    "client_health_scores"
    "entity_listings"
    "cannibalisation_reports"
    "analytics_snapshots"
    "invoices"
    "notifications"
    "loyalty_transactions"
    "birthday_tokens"
    "knowledge_base"
    "dead_jobs"
  )

  local missing=0
  local table_count=0

  for table in "${expected_tables[@]}"; do
    table_count=$((table_count + 1))
    local exists
    exists=$(psql "${DB_URL}" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}')" 2>/dev/null | tr -d ' ')

    if [[ "$exists" == "t" ]]; then
      log_step "Table exists: ${table}"
    else
      log_error "Table MISSING: ${table}"
      missing=$((missing + 1))
    fi
  done

  echo ""

  # Check tenant_id indexes on all tenant-scoped tables
  local tenant_tables=(
    "encrypted_keys"
    "business_profiles"
    "content_posts"
    "customers"
    "seo_tasks"
    "indexed_pages"
    "trends"
    "business_audits"
    "reputation_velocity"
    "client_health_scores"
    "entity_listings"
    "cannibalisation_reports"
    "analytics_snapshots"
    "invoices"
    "notifications"
    "loyalty_transactions"
    "birthday_tokens"
    "knowledge_base"
    "dead_jobs"
    "platform_users"
  )

  local index_missing=0

  for table in "${tenant_tables[@]}"; do
    local has_index
    has_index=$(psql "${DB_URL}" -t -c "
      SELECT COUNT(*) FROM pg_indexes
      WHERE tablename = '${table}'
        AND indexdef LIKE '%tenant_id%'
    " 2>/dev/null | tr -d ' ')

    if [[ "$has_index" -gt 0 ]]; then
      log_step "tenant_id index OK: ${table}"
    else
      log_error "tenant_id index MISSING: ${table}"
      index_missing=$((index_missing + 1))
    fi
  done

  echo ""

  # Check RLS is enabled on tenant-scoped tables
  local rls_missing=0

  for table in "${tenant_tables[@]}"; do
    # dead_jobs and platform_users are platform-level — skip RLS check
    if [[ "$table" == "dead_jobs" ]] || [[ "$table" == "platform_users" ]]; then
      log_step "RLS not required (platform-level): ${table}"
      continue
    fi

    local rls_enabled
    rls_enabled=$(psql "${DB_URL}" -t -c "
      SELECT relrowsecurity FROM pg_class
      WHERE relname = '${table}'
    " 2>/dev/null | tr -d ' ')

    if [[ "$rls_enabled" == "t" ]]; then
      log_step "RLS enabled: ${table}"
    else
      log_error "RLS NOT enabled: ${table}"
      rls_missing=$((rls_missing + 1))
    fi
  done

  echo ""
  echo -e "${CYAN}--- Verification Summary ---${NC}"
  echo "  Tables checked:    ${table_count}/23"
  echo "  Tables missing:    ${missing}"
  echo "  Indexes missing:   ${index_missing}"
  echo "  RLS missing:       ${rls_missing}"

  if [[ $missing -gt 0 ]] || [[ $index_missing -gt 0 ]] || [[ $rls_missing -gt 0 ]]; then
    log_error "Verification FAILED"
    exit 1
  fi

  log_step "All verifications PASSED"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  local mode="${1:---full}"

  check_psql
  check_db_connection

  case "$mode" in
    --migrate)
      do_nuke
      do_migrate
      ;;
    --seed)
      do_seed
      ;;
    --verify)
      do_verify
      ;;
    --full)
      do_nuke
      do_migrate
      do_seed
      do_verify
      ;;
    *)
      echo "Usage: $0 [--full|--migrate|--seed|--verify]"
      echo ""
      echo "  --full      Full reset: nuke → migrate → seed → verify (default)"
      echo "  --migrate   Nuke and re-apply migrations only"
      echo "  --seed      Apply seed data only (assumes schema exists)"
      echo "  --verify    Verify schema integrity without modifying data"
      exit 1
      ;;
  esac

  log_header "DONE"
}

main "$@"
