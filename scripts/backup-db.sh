#!/usr/bin/env bash
# ==============================================================================
# Finstaq Automated Daily MySQL Backup Script
# Performs compressed gzip mysqldump with timestamping and 7-day retention.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/mysql}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/finstaq_backup_${TIMESTAMP}.sql.gz"

DB_HOST="${DB_HOST:-mysql}"
DB_USER="${DB_USER:-finstaq_user}"
DB_PASS="${DB_PASS:-FinstaqSecurePass2026!}"
DB_NAME="${DB_NAME:-finstaq_production}"

mkdir -p "${BACKUP_DIR}"

echo "[$TIMESTAMP] Starting automated database backup for '${DB_NAME}'..."

# Execute mysqldump and pipe through gzip
mysqldump \
  --host="${DB_HOST}" \
  --user="${DB_USER}" \
  --password="${DB_PASS}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

echo "[$TIMESTAMP] Backup successfully created: ${BACKUP_FILE} ($(du -sh "${BACKUP_FILE}" | cut -f1))"

# Retention Policy: Delete backups older than 7 days
echo "Cleaning up backups older than 7 days..."
find "${BACKUP_DIR}" -type f -name "finstaq_backup_*.sql.gz" -mtime +7 -exec rm -f {} \;

echo "Backup and rotation completed successfully!"
