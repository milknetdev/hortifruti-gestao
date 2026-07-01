# 🥬 HortiFruti Web

Frontend do sistema de gestão de hortifrúti, construído com Next.js 14, Tailwind CSS e shadcn/ui.

## 📋 Pré-requisitos

- Node.js 20+
- Yarn 1.22+
- API rodando (ver [packages/api](../api/README.md))

## 🚀 Instalação

```bash
# Instale as dependencias
cd packages/web
yarn install

# Configure as variaveis de ambiente
cp .env.example .env.local
# Edite .env.local

# Inicie o servidor de desenvolvimento
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Padrao |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL da API | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_APP_URL` | URL da aplicacao | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Nome da app | `HortiFruti` |
| `NEXT_PUBLIC_STRIPE_KEY` | Chave publica Stripe | - |

## 📁 Estrutura

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Rotas de autenticacao
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/       # Rotas do painel
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (store)/           # Loja virtual
│   │   ├── page.tsx
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── layout/            # Componentes de layout
│   ├── products/          # Componentes de produtos
│   ├── orders/            # Componentes de pedidos
│   └── shared/            # Componentes compartilhados
├── hooks/                 # Custom hooks
├── lib/                   # Utilitarios
│   ├── api.ts             # Cliente HTTP (Axios)
│   ├── auth.ts            # Utilitarios de auth
│   └── utils.ts           # Funcoes utilitarias
├── providers/             # Context providers
├── services/              # Servicos de API
├── store/                 # Zustand stores
└── types/                 # Tipos TypeScript
```

## 🎨 Stack Tecnologica

- **Framework**: Next.js 14 (App Router)
- **Estilo**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand + React Query
- **Formularios**: React Hook Form + Zod
- **HTTP**: Axios
- **Icones**: Lucide React
- **Graficos**: Recharts
- **Tabelas**: TanStack Table

## 📱 Responsividade

O frontend e totalmente responsivo:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com sidebar colapsavel
- **Mobile**: Layout mobile com menu hamburguer

## 🧪 Testes

```bash
# Testes unitarios
yarn test

# Testes com watch
yarn test:watch

# Cobertura
yarn test:coverage
```

## 🏗️ Build

```bash
# Build para producao
yarn build

# Iniciar em producao
yarn start

# Build standalone (Docker)
yarn build:standalone
```

## 📄 Licenca

MIT © HortiFruti Gestao
