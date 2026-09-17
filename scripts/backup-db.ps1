# ==============================================================================
# Finstaq Automated Daily MySQL Backup Script (PowerShell)
# ==============================================================================

param (
    [string]$BackupDir = ".\backups\mysql",
    [string]$DbHost = "localhost",
    [string]$DbUser = "finstaq_user",
    [string]$DbPass = "FinstaqSecurePass2026!",
    [string]$DbName = "finstaq_production",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "finstaq_backup_$Timestamp.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "[$Timestamp] Starting database backup for '$DbName'..." -ForegroundColor Cyan

# Execute mysqldump
& mysqldump --host=$DbHost --user=$DbUser --password=$DbPass --single-transaction --quick --routines --triggers $DbName > $BackupFile

Write-Host "[$Timestamp] Backup successfully created: $BackupFile" -ForegroundColor Green

# Retention cleanup
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "finstaq_backup_*.sql" | Where-Object { $_.LastWriteTime -lt $CutoffDate } | Remove-Item -Force

Write-Host "Old backups older than $RetentionDays days cleaned up." -ForegroundColor Yellow
