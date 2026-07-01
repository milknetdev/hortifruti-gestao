#!/bin/bash
# ============================================
# HortiFruti Gestao - Script de Setup
# ============================================
# Uso: ./scripts/setup.sh
# 
# Este script configura todo o ambiente de
# desenvolvimento com Docker Compose.
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcao de log
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
echo "   🥬 HortiFruti Gestao - Setup"
echo "=========================================="
echo ""

# Verificar pré-requisitos
info "Verificando pre-requisitos..."

if ! command -v docker &> /dev/null; then
    error "Docker nao encontrado. Instale: https://docs.docker.com/get-docker/"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose nao encontrado."
fi

log "Docker encontrado: $(docker --version)"

# Verificar .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        warn "Arquivo .env nao encontrado. Copiando de .env.example..."
        cp .env.example .env
        log "Arquivo .env criado. Edite com suas configuracoes antes de continuar."
        echo ""
        info "Execute novamente apos configurar o .env"
        exit 0
    else
        error "Arquivo .env.example nao encontrado!"
    fi
fi

log "Arquivo .env encontrado"

# Parar containers existentes
info "Parando containers existentes..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

# Build dos containers
info "Fazendo build dos containers..."
docker compose build 2>/dev/null || docker-compose build

# Subir servicos
info "Subindo servicos..."
docker compose up -d 2>/dev/null || docker-compose up -d

# Aguardar PostgreSQL ficar pronto
info "Aguardando PostgreSQL ficar pronto..."
sleep 10

MAX_RETRIES=30
RETRY=0
until docker compose exec -T postgres pg_isready -U postgres 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        error "PostgreSQL nao ficou pronto apos $MAX_RETRIES tentativas"
    fi
    echo -n "."
    sleep 2
done
echo ""
log "PostgreSQL esta pronto"

# Executar migracoes
info "Executando migracoes do banco de dados..."
docker compose exec -T api npx prisma migrate deploy 2>/dev/null || \
    docker-compose exec -T api npx prisma migrate deploy

log "Migracoes executadas com sucesso"

# Executar seed
info "Executando seed do banco de dados..."
docker compose exec -T api npx prisma db seed 2>/dev/null || \
    docker-compose exec -T api npx prisma db seed

log "Seed executado com sucesso"

# Verificar servicos
echo ""
info "Verificando servicos..."

# Aguardar API ficar pronta
sleep 5
MAX_RETRIES=15
RETRY=0
until curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        warn "API nao respondeu. Verifique os logs: docker compose logs api"
        break
    fi
    echo -n "."
    sleep 2
done

if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    log "API esta rodando: http://localhost:3001"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log "Frontend esta rodando: http://localhost:3000"
fi

# Resumo
echo ""
echo "=========================================="
echo "   ✅ Setup concluido com sucesso!"
echo "=========================================="
echo ""
echo "   Servicos:"
echo "   - Frontend:  http://localhost:3000"
echo "   - API:       http://localhost:3001/api/v1"
echo "   - Swagger:   http://localhost:3001/api/v1/docs"
echo "   - Prisma Studio: npx prisma studio"
echo ""
echo "   Credenciais:"
echo "   - Admin:     admin@hortifruti.com / Admin@123"
echo "   - Cliente:   cliente@exemplo.com / Cliente@123"
echo ""
echo "   Comandos uteis:"
echo "   - docker compose logs -f        # Ver logs"
echo "   - docker compose down           # Parar servicos"
echo "   - docker compose restart        # Reiniciar"
echo "   - ./scripts/backup.sh           # Backup do banco"
echo ""
