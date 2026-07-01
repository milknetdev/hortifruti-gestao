# 🥬 HortiFruti API

API RESTful para gestão de hortifrúti, construída com NestJS, Prisma e PostgreSQL.

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (opcional, para cache)
- Docker & Docker Compose (recomendado)

## 🚀 Instalação

### Com Docker (Recomendado)

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/hortifruti-gestao.git
cd hortifruti-gestao

# Copie o arquivo de ambiente
cp .env.example .env

# Suba os servicos
docker-compose up -d

# Execute as migracoes
docker-compose exec api npx prisma migrate deploy

# Execute o seed
docker-compose exec api npx prisma db seed
```

### Instalacao Manual

```bash
# Instale as dependencias
cd packages/api
yarn install

# Configure o banco de dados
cp .env.example .env
# Edite o .env com suas credenciais

# Execute as migracoes
npx prisma migrate deploy

# Gere o Prisma Client
npx prisma generate

# Execute o seed
npx prisma db seed

# Inicie o servidor
yarn start:dev
```

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Padrao |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexao PostgreSQL | `postgresql://postgres:***@localhost:5432/hortifruti` |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `JWT_EXPIRES_IN` | Duracao do access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Duracao do refresh token | `7d` |
| `PORT` | Porta do servidor | `3001` |
| `NODE_ENV` | Ambiente | `development` |
| `API_PREFIX` | Prefixo das rotas | `api/v1` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:3000` |
| `REDIS_HOST` | Host do Redis | `localhost` |
| `REDIS_PORT` | Porta do Redis | `6379` |
| `REDIS_PASSWORD` | Senha do Redis | - |
| `SMTP_HOST` | Host SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | - |
| `SMTP_PASS` | Senha SMTP | - |

## 📡 Endpoints da API

### Autenticacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `POST` | `/api/v1/auth/register` | Registrar usuario |
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/refresh` | Renovar token |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/auth/me` | Dados do usuario logado |

### Produtos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/products` | Listar produtos |
| `GET` | `/api/v1/products/:id` | Detalhes do produto |
| `POST` | `/api/v1/products` | Criar produto |
| `PATCH` | `/api/v1/products/:id` | Atualizar produto |
| `DELETE` | `/api/v1/products/:id` | Excluir produto |
| `GET` | `/api/v1/products/search?q=` | Buscar produtos |

### Categorias

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/categories` | Listar categorias |
| `GET` | `/api/v1/categories/:id` | Detalhes da categoria |
| `POST` | `/api/v1/categories` | Criar categoria |
| `PATCH` | `/api/v1/categories/:id` | Atualizar categoria |
| `DELETE` | `/api/v1/categories/:id` | Excluir categoria |

### Pedidos

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/orders` | Listar pedidos |
| `GET` | `/api/v1/orders/:id` | Detalhes do pedido |
| `POST` | `/api/v1/orders` | Criar pedido |
| `PATCH` | `/api/v1/orders/:id/status` | Atualizar status |
| `PATCH` | `/api/v1/orders/:id/cancel` | Cancelar pedido |

### Clientes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/customers` | Listar clientes |
| `GET` | `/api/v1/customers/:id` | Detalhes do cliente |
| `POST` | `/api/v1/customers` | Criar cliente |
| `PATCH` | `/api/v1/customers/:id` | Atualizar cliente |
| `DELETE` | `/api/v1/customers/:id` | Excluir cliente |
| `GET` | `/api/v1/customers/:id/orders` | Pedidos do cliente |

### Cupons

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/coupons` | Listar cupons |
| `POST` | `/api/v1/coupons` | Criar cupom |
| `PATCH` | `/api/v1/coupons/:id` | Atualizar cupom |
| `DELETE` | `/api/v1/coupons/:id` | Excluir cupom |
| `POST` | `/api/v1/coupons/validate` | Validar cupom |

### Entregas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/delivery-zones` | Listar zonas |
| `POST` | `/api/v1/delivery-zones` | Criar zona |
| `PATCH` | `/api/v1/delivery-zones/:id` | Atualizar zona |
| `DELETE` | `/api/v1/delivery-zones/:id` | Excluir zona |
| `POST` | `/api/v1/delivery/calculate` | Calcular frete |

### Relatorios

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/reports/sales` | Relatorio de vendas |
| `GET` | `/api/v1/reports/inventory` | Relatorio de estoque |
| `GET` | `/api/v1/reports/customers` | Relatorio de clientes |
| `GET` | `/api/v1/reports/dashboard` | Dashboard consolidado |

### Upload

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `POST` | `/api/v1/upload/image` | Upload de imagem |
| `DELETE` | `/api/v1/upload/:id` | Excluir imagem |

### Health Check

| Metodo | Rota | Descricao |
|--------|------|-----------|
| `GET` | `/api/v1/health` | Status da API |

## 🔐 Fluxo de Autenticacao

```
┌─────────────┐     POST /auth/login      ┌─────────────┐
│   Cliente    │ ─────────────────────────→ │    API      │
│              │ ←───────────────────────── │             │
│              │   { access_token,          │  JWT        │
│              │     refresh_token }         │  Service    │
│              │                             │             │
│              │  GET /resource              │             │
│              │  Authorization: Bearer xxx  │             │
│              │ ─────────────────────────→ │             │
│              │ ←───────────────────────── │             │
│              │   { data }                  │             │
│              │                             │             │
│              │  POST /auth/refresh         │             │
│              │  { refresh_token }          │             │
│              │ ─────────────────────────→ │             │
│              │ ←───────────────────────── │             │
│              │   { new tokens }            │             │
└─────────────┘                             └─────────────┘
```

### Fluxo detalhado:

1. **Registro**: `POST /auth/register` com email, senha e nome → retorna tokens
2. **Login**: `POST /auth/login` com email e senha → retorna access_token (15min) e refresh_token (7 dias)
3. **Acesso**: Envie `Authorization: Bearer <access_token>` no header
4. **Renovacao**: Quando o access_token expirar, use `POST /auth/refresh` com o refresh_token
5. **Logout**: `POST /auth/logout` invalida o refresh_token

## 🏗️ Arquitetura Multi-Tenant

O sistema utiliza **isolamento por tenant** no nivel do banco de dados:

```
┌─────────────────────────────────────────────┐
│                   API                        │
│  ┌─────────────────────────────────────────┐│
│  │         Tenant Middleware               ││
│  │  (extrai tenant_id do JWT/header)       ││
│  └─────────────┬───────────────────────────┘│
│                │                             │
│  ┌─────────────▼───────────────────────────┐│
│  │         Prisma ORM                      ││
│  │  WHERE tenant_id = :currentTenant       ││
│  └─────────────┬───────────────────────────┘│
│                │                             │
│  ┌─────────────▼───────────────────────────┐│
│  │       PostgreSQL Database               ││
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐  ││
│  │  │ Tenant A │ │ Tenant B │ │Tenant C│  ││
│  │  │ Products │ │ Products │ │Products│  ││
│  │  │ Orders   │ │ Orders   │ │Orders  │  ││
│  │  │ Users    │ │ Users    │ │Users   │  ││
│  │  └──────────┘ └──────────┘ └────────┘  ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

Cada tenant possui:
- Configuracoes proprias (cores, horarios, taxas)
- Produtos e categorias independentes
- Usuarios e permissoes isolados
- Zonas de entrega proprias

## 📊 Schema do Banco de Dados

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    Tenant      │────→│   Settings    │     │   Permission  │
│                │     └───────────────┘     └───────┬───────┘
│  id            │                                   │
│  name          │     ┌───────────────┐     ┌───────▼───────┐
│  slug          │────→│    User       │←────│  UserPermission│
│  email         │     │               │     └───────────────┘
│  phone         │     │  id           │
│  document      │     │  email        │     ┌───────────────┐
│  address       │     │  password     │────→│    Address    │
│  city          │     │  role         │     └───────────────┘
│  state         │     │  tenantId     │
└───────┬───────┘     └───────┬───────┘     ┌───────────────┐
        │                     │              │   Category    │
        │                     │              │               │
        │     ┌───────────────▼───────┐     │  id           │
        ├────→│      Order            │     │  name         │
        │     │                       │     │  slug         │
        │     │  id                   │     │  tenantId     │
        │     │  customerId           │     └───────┬───────┘
        │     │  tenantId             │             │
        │     │  status               │     ┌───────▼───────┐
        │     │  total                │     │   Product     │
        │     │  deliveryFee          │     │               │
        │     └───────┬───────┘       │     │  id           │
        │             │               │     │  name         │
        │     ┌───────▼───────┐       │     │  price        │
        │     │  OrderItem    │       │     │  unit         │
        │     │               │       │     │  stock        │
        │     │  id           │       │     │  categoryId   │
        │     │  orderId      │       │     │  tenantId     │
        │     │  productId    │       │     └───────────────┘
        │     │  quantity     │       │
        │     │  unitPrice    │       │     ┌───────────────┐
        │     └───────────────┘       ├────→│ DeliveryZone  │
        │                             │     │               │
        │     ┌───────────────┐       │     │  name         │
        ├────→│    Coupon     │       │     │  fee          │
        │     │               │       │     │  minOrder     │
        │     │  code         │       │     │  neighborhoods│
        │     │  discount     │       │     └───────────────┘
        │     │  tenantId     │       │
        └─────┴───────────────┘       │
                                      │     ┌───────────────┐
                                      └────→│  ProductImage │
                                            └───────────────┘
```

## 🧪 Testes

```bash
# Testes unitarios
yarn test

# Testes e2e
yarn test:e2e

# Cobertura
yarn test:cov
```

## 📝 Comandos Uteis

```bash
# Gerar migracao
npx prisma migrate dev --nome-da-migracao

# Resetar banco
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Executar seed
npx prisma db seed
```

## 📄 Licenca

MIT © HortiFruti Gestao
