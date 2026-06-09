# MCMVR Rural — Validador Documental

Sistema de Validação de Documentos para o Programa Habitacional Rural.

## Deploy no Vercel (5 minutos)

### Opção 1 — GitHub + Vercel (recomendado)

1. Crie um repositório no GitHub e suba esta pasta
2. Acesse vercel.com → "Add New Project"
3. Conecte o repositório
4. Vercel detecta Vite automaticamente — clique **Deploy**
5. Link permanente gerado — nunca muda

### Opção 2 — Vercel CLI (deploy direto)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Na pasta do projeto
npm install
vercel

# Seguir as instruções no terminal
# Link permanente gerado ao final
```

## Desenvolvimento local

```bash
npm install
npm run dev
# Abre em http://localhost:5173
```

## Credenciais de demo

### EOs (Entidades Organizadoras)
| EO | Código | Email | Senha | Perfil |
|---|---|---|---|---|
| Araguaia | EO-2025-001 | admin@araguaia.org.br | admin123 | Administrador |
| Xingu | EO-2025-002 | gerente@xingu.org.br | ger456 | Gerente |

### Super Admin (triplo-clique no logo)
| Nível | Código | Senha |
|---|---|---|
| Master | ADMIN-MCMVR-2025 | master@2025 |
| Gerente | GER-MCMVR-2025 | gerente@2025 |
| Operador | OP-MCMVR-2025 | oper@2025 |
