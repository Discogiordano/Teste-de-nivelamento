# Teste de Nivelamento — Frontend (Vue 3 + Vite + Vuetify)

Aplicação frontend para gerenciamento de fichas de pacientes. Este projeto consome a Hospital API (Quarkus) e oferece telas para cadastrar, visualizar e atualizar fichas.

## Requisitos
- Node.js 20+ (ou 22+)
- NPM 10+
- Backend rodando em http://localhost:8080 (já configurado via `.env.local` presente no projeto)
- Visual Studio Code

## Como baixar e rodar o projeto

1) Clonar o repositório

Repositório do frontend:
`https://github.com/Discogiordano/Teste-de-nivelamento.git`

```powershell
# escolha uma pasta de trabalho e rode no git:
git clone https://github.com/Discogiordano/Teste-de-nivelamento.git

```

- Abrir A Pasta Clonada no VS Code

- Digite no terminal: cd Teste-de-Nivelamento-Front

3) Trocar para a branch de desenvolvimento

```powershell
git fetch origin
git checkout dev
git pull origin dev
```

4) Instalar dependências

## Instalação
No PowerShell, na pasta `Teste-De-Nivelamento-Front/`:

Se for o primeiro setup e não tiver `package-lock.json`, use:
```powershell
npm install
```

## Executar (Ambiente Local)
```powershell
npm run dev
```
- Acesse: http://localhost:5173

## Como acessar
- Frontend: http://localhost:5173
- Swagger da API (backend): http://localhost:8080/q/swagger-ui
- Healthcheck da API: http://localhost:8080/q/health

## Integração com o Backend
- O frontend utiliza `VITE_API_BASE_URL` do `.env.local` já existente para formar as chamadas `fetch`.
- Endpoints esperados (exemplos):
  - `GET /fichas-paciente/listar-fichas-todas`
  - `GET /fichas-paciente/buscar-ficha/:id`
  - `PUT /fichas-paciente/atualizar-ficha/:id`
  - `GET /planosdesaude/listar-planosdesaude`
  - `GET /especialidades/listar-especialidades`

## Dicas e Solução de Problemas
- CORS: a API Quarkus está configurada para permitir `http://localhost:5173`.
- 404/500 na API: confirme se o backend está em execução e se `VITE_API_BASE_URL` no `.env.local` aponta para a URL correta do backend.
- Erros de tipo/TypeScript: rode `npm run type-check` para validar tipos.

## Observações
- Este projeto está focado apenas em execução local (sem build de produção).
