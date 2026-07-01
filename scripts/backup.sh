#!/bin/bash
# ============================================
# HortiFruti Gestao - Script de Backup
# ============================================
# Uso: ./scripts/backup.sh [diretorio]
#
# Cria backup do banco de dados PostgreSQL.
# Pode ser usado com cron para backups automaticos.
#
# Exemplo cron (todo dia as 2h):
# 0 2 * * * /path/to/scripts/backup.sh /path/to/backups
# ============================================

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuracoes
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="hortifruti_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Carregar variaveis de ambiente se existir
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuracoes do banco (com valores padrao)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-hortifruti}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASSWORD:-postgres}"

# Funcoes
log() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Banner
echo ""
echo "=========================================="
echo "   HortiFruti - Backup do Banco"
echo "=========================================="
echo ""

# Criar diretorio de backup se nao existir
mkdir -p "$BACKUP_DIR"
log "Diretorio de backups: $BACKUP_DIR"

# Verificar se pg_dump esta disponivel
if command -v pg_dump &> /dev/null; then
    # Backup direto com pg_dump
    info "Usando pg_dump local..."
    PGPASSWORD="${DB_PASS}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        -f "${BACKUP_DIR}/${BACKUP_FILE%.gz}.dump" 2>/dev/null

    # Tambem criar versao SQL compactada
    PGPASSWORD="${DB_PASS}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        | gzip > "${BACKUP_DIR}/${BACKUP_FILE}" 2>/dev/null

    log "Backup criado: ${BACKUP_DIR}/${BACKUP_FILE}"
    log "Backup dump: ${BACKUP_DIR}/${BACKUP_FILE%.gz}.dump"
elif command -v docker &> /dev/null; then
    # Backup via Docker
    info "pg_dump nao encontrado. Usando Docker..."
    
    docker compose exec -T postgres pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        > "${BACKUP_DIR}/${BACKUP_FILE%.gz}.dump" 2>/dev/null

    docker compose exec -T postgres pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        | gzip > "${BACKUP_DIR}/${BACKUP_FILE}" 2>/dev/null

    log "Backup criado via Docker: ${BACKUP_DIR}/${BACKUP_FILE}"
else
    error "Nem pg_dump nem Docker encontrados. Instale um dos dois."
fi

# Calcular tamanho do backup
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_FILE}" 2>/dev/null | cut -f1)
log "Tamanho do backup: $BACKUP_SIZE"

# Limpar backups antigos
if [ -d "$BACKUP_DIR" ]; then
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "hortifruti_backup_*" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
    if [ "$DELETED_COUNT" -gt 0 ]; then
        log "Backups antigos removidos: $DELETED_COUNT (mais de ${RETENTION_DAYS} dias)"
    fi
fi

# Listar backups existentes
echo ""
echo "Backups disponiveis:"
ls -lh "${BACKUP_DIR}"/hortifruti_backup_* 2>/dev/null | tail -10 || echo "  Nenhum backup encontrado"

echo ""
echo "=========================================="
echo "   Backup concluido com sucesso!"
echo "=========================================="
echo ""
echo "   Para restaurar:"
echo "   pg_restore -U postgres -d hortifruti ${BACKUP_DIR}/${BACKUP_FILE%.gz}.dump"
echo ""
echo "   Ou via Docker:"
echo "   cat ${BACKUP_DIR}/${BACKUP_FILE} | gunzip | docker compose exec -T postgres psql -U postgres -d hortifruti"
echo ""
