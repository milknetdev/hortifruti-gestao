# 🥬 HortiFruti Gestão

Plataforma completa de gestão para hortifrúti, delivery e e-commerce de produtos frescos.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20+-blue)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![NestJS](https://img.shields.io/badge/nestjs-10-red)
![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue)
![TypeScript](https://img.shields.io/badge/typescript-5+-blue)

## 📸 Screenshots

<!-- Adicione screenshots aqui -->
![Dashboard](docs/screenshots/dashboard.png)
![Loja](docs/screenshots/store.png)
![Pedidos](docs/screenshots/orders.png)

## 🏗️ Visão da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        HortiFruti Gestão                         │
├─────────────────────────┬───────────────────────────────────────┤
│     Frontend (Web)      │           Backend (API)               │
│  ┌───────────────────┐  │  ┌─────────────────────────────────┐  │
│  │    Next.js 14     │  │  │         NestJS 10               │  │
│  │    App Router     │  │  │    ┌───────────────────────┐    │  │
│  │                   │  │  │    │   Multi-Tenant Auth   │    │  │
│  │  ┌─────────────┐ │  │  │    │   JWT + RBAC          │    │  │
│  │  │  Dashboard  │ │  │  │    └───────────────────────┘    │  │
│  │  │  Loja       │ │  │  │    ┌───────────────────────┐    │  │
│  │  │  Pedidos    │ │  │  │    │   Prisma ORM          │    │  │
│  │  │  Clientes   │ │  │  │    │   PostgreSQL          │    │  │
│  │  └─────────────┘ │  │  │    └───────────────────────┘    │  │
│  └───────────────────┘  │  └─────────────────────────────────┘  │
│                         │                                       │
│  Port: 3000             │  Port: 3001                           │
└─────────────────────────┴───────────────────────────────────────┘
         │                           │
         └─────────┬─────────────────┘
                   │
    ┌──────────────▼──────────────┐
    │      Docker Compose         │
    │  ┌───────────────────────┐  │
    │  │  PostgreSQL 15        │  │
    │  │  Redis 7              │  │
    │  │  API (NestJS)         │  │
    │  │  Web (Next.js)        │  │
    │  └───────────────────────┘  │
    └─────────────────────────────┘
```

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Banco**: PostgreSQL 15
- **Cache**: Redis 7
- **Auth**: JWT + Refresh Token + RBAC
- **Validação**: class-validator / class-transformer
- **Documentação**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Estilo**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand + React Query
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Ícones**: Lucide React

### Infraestrutura
- **Containers**: Docker + Docker Compose
- **Banco**: PostgreSQL 15
- **Cache**: Redis 7
- **CI/CD**: GitHub Actions

## 🚀 Início Rápido (Docker)

```bash
# 1. Clone o repositorio
git clone https://github.com/seu-usuario/hortifruti-gestao.git
cd hortifruti-gestao

# 2. Copie e configure o ambiente
cp .env.example .env
# Edite .env com suas configuracoes

# 3. Suba tudo com um comando
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Acesse
# Frontend: http://localhost:3000
# API: http://localhost:3001/api/v1
# Swagger: http://localhost:3001/api/v1/docs
```

### Credenciais Padrão

| Usuario | Email | Senha | Role |
|---------|-------|-------|------|
| Super Admin | admin@hortifruti.com | Admin@123 | SUPER_ADMIN |
| Cliente Teste | cliente@exemplo.com | Cliente@123 | CUSTOMER |

## 🔧 Instalação Manual

### Pré-requisitos

- Node.js 20+
- Yarn 1.22+
- PostgreSQL 15+
- Redis 7+ (opcional)

### Passo a passo

```bash
# 1. Clone e instale dependencias
git clone https://github.com/seu-usuario/hortifruti-gestao.git
cd hortifruti-gestao
yarn install

# 2. Configure o banco de dados
createdb hortifruti

# 3. Configure as variaveis de ambiente
cp .env.example .env
# Edite DATABASE_URL, JWT_SECRET, etc.

# 4. Execute migracoes e seed
cd packages/api
npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# 5. Inicie os servicos
# Terminal 1 - API
cd packages/api && yarn start:dev

# Terminal 2 - Frontend
cd packages/web && yarn dev
```

## 📁 Estrutura do Projeto

```
hortifruti-gestao/
├── packages/
│   ├── api/                        # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── migrations/         # Migracoes do banco
│   │   │   ├── schema.prisma       # Schema do banco
│   │   │   ├── seed.ts             # Dados iniciais
│   │   │   └── seed-utils.ts       # Utilitarios do seed
│   │   ├── src/
│   │   │   ├── auth/               # Modulo de autenticacao
│   │   │   ├── products/           # Modulo de produtos
│   │   │   ├── categories/         # Modulo de categorias
│   │   │   ├── orders/             # Modulo de pedidos
│   │   │   ├── customers/          # Modulo de clientes
│   │   │   ├── coupons/            # Modulo de cupons
│   │   │   ├── delivery/           # Modulo de entregas
│   │   │   ├── reports/            # Modulo de relatorios
│   │   │   ├── upload/             # Modulo de upload
│   │   │   ├── tenant/             # Modulo multi-tenant
│   │   │   ├── common/             # Utilitarios compartilhados
│   │   │   ├── app.module.ts       # Modulo raiz
│   │   │   └── main.ts             # Entry point
│   │   ├── test/                   # Testes e2e
│   │   ├── Dockerfile
│   │   ├── jest.config.ts
│   │   └── package.json
│   │
│   └── web/                        # Frontend Next.js
│       ├── src/
│       │   ├── app/                # App Router
│       │   ├── components/         # Componentes React
│       │   ├── hooks/              # Custom hooks
│       │   ├── lib/                # Utilitarios
│       │   ├── services/           # Servicos de API
│       │   ├── store/              # Estado global
│       │   └── types/              # Tipos TypeScript
│       ├── public/                 # Assets estaticos
│       ├── Dockerfile
│       └── package.json
│
├── scripts/
│   ├── setup.sh                    # Script de setup
│   └── backup.sh                   # Script de backup
│
├── docker-compose.yml              # Configuracao Docker
├── .env.example                    # Variaveis de ambiente
├── .gitignore
└── README.md
```

## ✨ Funcionalidades

### 🛒 Loja Virtual
- Catálogo de produtos com fotos
- Busca e filtros avançados
- Carrinho de compras
- Checkout com múltiplos métodos de pagamento
- Acompanhamento de pedidos em tempo real

### 📊 Painel Administrativo
- Dashboard com métricas de vendas
- Gestão de produtos e categorias
- Gestão de pedidos e status
- Gestão de clientes
- Relatórios de vendas e estoque
- Gestão de cupons e promoções

### 🚚 Delivery
- Zonas de entrega configuráveis
- Cálculo automático de frete
- Rastreamento de entregas
- Agendamento de entregas

### 👥 Multi-Tenant
- Isolamento de dados por tenant
- Configurações personalizadas por loja
- Temas e cores customizáveis
- Usuários e permissões por tenant

### 🔐 Segurança
- Autenticação JWT com refresh token
- Controle de acesso baseado em roles (RBAC)
- Senhas criptografadas com bcrypt
- Rate limiting
- CORS configurável
- Validação de dados com class-validator

## 📖 Documentação da API

A documentação completa da API está disponível em:
- **Swagger**: [http://localhost:3001/api/v1/docs](http://localhost:3001/api/v1/docs)
- **README**: [packages/api/README.md](packages/api/README.md)

## 🧪 Testes

```bash
# Todos os testes
yarn test

# Testes unitarios (API)
cd packages/api && yarn test

# Testes e2e (API)
cd packages/api && yarn test:e2e

# Testes (Frontend)
cd packages/web && yarn test

# Cobertura
yarn test:cov
```

## 🗄️ Backup do Banco

```bash
# Backup manual
chmod +x scripts/backup.sh
./scripts/backup.sh

# Backup automatico (cron)
0 2 * * * /path/to/scripts/backup.sh
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrão de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` manutenção

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

- **Email**: contato@hortifruti.com
- **GitHub**: [github.com/seu-usuario/hortifruti-gestao](https://github.com/seu-usuario/hortifruti-gestao)

---

Feito com ❤️ para o mercado brasileiro de hortifrúti 🍎🥬
