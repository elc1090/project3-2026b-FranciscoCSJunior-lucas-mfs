# SOSTENPYME

Sistema de diagnóstico e planejamento de sustentabilidade para pequenas e médias empresas (pymes), feito em colaboração com a turma de Administração do Chile.
Projeto 3 da disciplina ELC1090 – Desenvolvimento de Software para Web (UFSM).

- **Prazo de entrega:** 21/10 · **Apresentações:** 22/10 e 27/10
- **Divisão:** frontend (já feito, ver abaixo) · backend (Lucas)

> Este README é o guia interno da dupla. Quando a professora publicar o template oficial, o conteúdo útil daqui pode ser movido para lá.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 12 (PHP 8.4) |
| Frontend | React 19 + TypeScript via Inertia.js, Tailwind CSS 4 |
| Banco | SQLite (local) · PostgreSQL no Neon (produção) |
| Deploy | Render (frontend e backend juntos, via Docker) |

Com Inertia, o React fica dentro do projeto Laravel: cada rota do Laravel retorna `Inertia::render('pagina', [props])` e o React recebe esses dados como props. Não existe uma API REST separada.

---

## Como rodar no seu computador

### Primeira vez

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

**Windows:**
- O banco local é SQLite. Se der erro `could not find driver`, abra o `php.ini` (descubra onde fica com `php --ini`) e adicione as linhas `extension=pdo_sqlite` e `extension=sqlite3`.
- No PowerShell, `npm` pode ser bloqueado ("a execução de scripts foi desabilitada"). Use `npm.cmd` no lugar (ex.: `npm.cmd install`) ou rode no Prompt de Comando/Git Bash.

### Para desenvolver (dois terminais)

```bash
php artisan serve
```

```bash
npm run dev
```

Abra http://localhost:8000 e crie uma conta em "Regístrate". (O atalho `composer dev` não funciona bem no Windows, porque o `pail` precisa da extensão `pcntl`.)

### Testes

```bash
php artisan test
```

---

## O que já está feito

### Autenticação (veio do starter kit do Laravel)
Cadastro, login, logout, recuperação de senha, configurações de perfil/senha/aparência e exclusão de conta. Senhas com hash bcrypt. Os 26 testes do starter kit passam.

### Frontend completo das 8 páginas (com dados de demonstração)

| Rota | Página | O que faz |
|---|---|---|
| `/dashboard` | Inicio | Pontuação geral, 4 dimensões, prioridades, resumo do plano, passos do fluxo |
| `/company` | Mi empresa | Nome, setor, porte, nº de trabalhadores, região |
| `/diagnosis` | Diagnóstico | 20 perguntas em 4 etapas + etapa extra do setor (ex.: Alimentos) |
| `/results` | Resultado | Notas 0–100, Social dividida em Trabajadores/Comunidad, lacunas < 50, prioridades com "Agregar al plan" |
| `/path` | Ruta sostenible | 12 metas em 3 níveis que a empresa marca como cumpridas |
| `/plan` | Mi plan | Ações com status, responsável, prazo e indicador |
| `/tracking` | Seguimiento | Compara diagnóstico anterior × atual e histórico |
| `/explore` | Explorar ODS | Os 17 ODS explicados, com as perguntas relacionadas |

Outras coisas prontas:
- **Idiomas espanhol/português** em todo o site (botão ES/PT no topo). A escolha fica salva no `localStorage` **e num cookie `locale`**, para o backend também saber o idioma.
- Identidade visual própria (cores por dimensão, fontes, ícone), modo claro/escuro e layout responsivo.
- `/` redireciona para `/dashboard` (ou para o login, se não estiver logado).

### ⚠️ Importante: integração das páginas pendente
O backend já persiste os dados da empresa e entrega props pelo Inertia. As páginas React ainda usam `resources/js/lib/demo-store.ts`, que guarda dados de demonstração no `localStorage`, e o catálogo fixo em `resources/js/data/catalog.ts`. Falta o responsável pelo frontend trocar essas leituras pelas props e usar as rotas implementadas, conforme [o contrato de integração](docs/backend.md).

---

## Arquivos importantes do frontend

| Arquivo | Para que serve |
|---|---|
| `resources/js/types/sostenpyme.ts` | **Contrato frontend ↔ backend**: formato dos dados que cada página espera |
| `resources/js/data/catalog.ts` | Catálogo: 20 perguntas + 2 do setor alimentos, 22 recomendações, 12 metas, 17 ODS (em `es` e `pt`). **Base para os seeders** |
| `resources/js/lib/scoring.ts` | Regras de pontuação e prioridades (**o backend precisa repetir este cálculo**) |
| `resources/js/lib/demo-store.ts` | Dados temporários no navegador — **apagar quando o backend estiver pronto** |
| `resources/js/pages/*.tsx` | As páginas. Comentários `// Com o backend: ...` indicam onde chamar o servidor |
| `resources/js/i18n/es.ts` e `pt.ts` | Textos da interface |
| `routes/web.php` | As rotas das páginas (hoje só renderizam, sem dados) |

---

## Regras do diagnóstico (do documento do Chile)

- Cada resposta vale **0 a 3** (No / Ocasionalmente / Frecuentemente / Sistemáticamente).
- 4 dimensões × 5 perguntas = **máximo 60 pontos**, convertido para 0–100.
- Nota de cada dimensão = `round(soma / (nº perguntas × 3) × 100)`.
- **Social** também tem dois sub-resultados: **Trabajadores** (perguntas soc-1 a soc-3) e **Comunidad** (soc-4 e soc-5).
- Área com nota **< 50** é lacuna e recebe pelo menos uma ação.
- Toda pergunta respondida com 0 ou 1 sugere a recomendação ligada a ela.
- Prioridades ordenadas da área com menor nota para a maior.
- Perguntas do setor **não entram na nota**; só sugerem ações.

Implementação de referência: `resources/js/lib/scoring.ts`.

---

## O que o Lucas precisa fazer (backend)

**Implementação do backend adicionada em 20/10/2026.** Banco, catálogo, criação de empresa, controllers, rotas, policies, validações, cálculo no servidor e idiomas foram implementados. Dockerfile e Blueprint do Render estão preparados. Veja [contrato das rotas e instruções de deploy](docs/backend.md). A integração das páginas React com as props/rotas continua com o responsável pelo frontend, conforme combinado abaixo; a publicação Render/Neon exige acesso às contas.

### 1. Banco de dados (migrations + models)

Sugestão de tabelas — os nomes de campos seguem `types/sostenpyme.ts`:

| Tabela | Campos principais |
|---|---|
| `companies` | `id`, `user_id` (FK, único), `name`, `sector`, `size`, `workers`, `region` |
| `questions` | `id`, `code` (ex.: `env-1`, único), `dimension`, `group` (nullable: `workers`/`community`), `sector` (nullable), `text_es`, `text_pt`, `sdgs` (json) |
| `recommendations` | `id`, `code` (ex.: `r-env-1`), `question_id` (FK), `title_es`, `title_pt`, `description_es`, `description_pt` |
| `path_goals` | `id`, `code`, `level` (1–3), `dimension`, `title_es`, `title_pt` |
| `sdgs` | `number` (PK), `title_es`, `title_pt`, `description_es`, `description_pt` |
| `diagnoses` | `id`, `company_id` (FK), `created_at`, notas calculadas por área (`environmental`, `workers`, `community`, `economic`, `governance`) |
| `answers` | `id`, `diagnosis_id` (FK), `question_id` (FK), `value` (0–3) |
| `plan_actions` | `id`, `company_id` (FK), `recommendation_id` (FK), `owner`, `due_date`, `indicator`, `status` (`pending`/`in_progress`/`done`) |
| `company_goal` (pivot) | `company_id`, `path_goal_id` |

Dica: manter o campo `code` (`env-1`, `r-env-1`...) evita mexer no frontend, que usa esses códigos como `id`.

### 2. Seeders
Copiar o conteúdo de `resources/js/data/catalog.ts` para seeders (`QuestionSeeder`, `RecommendationSeeder`, `PathGoalSeeder`, `SdgSeeder`).

### 3. Cadastro cria a empresa
Em `app/Http/Controllers/Auth/RegisteredUserController.php`, ao criar o usuário, criar também a `Company` dele (pode começar só com o nome e completar em "Mi empresa").

### 4. Controllers e rotas
Substituir os `Route::inertia(...)` de `routes/web.php` por controllers que enviam os dados **da empresa do usuário logado**. Os textos do catálogo devem ir no formato `{ es: '...', pt: '...' }` (tipo `Localized`).

| Ação no frontend | Rota sugerida | Comentário no código |
|---|---|---|
| Salvar perfil da empresa | `PUT /company` → `company.update` | `pages/company.tsx` |
| Salvar diagnóstico | `POST /diagnosis` → `diagnosis.store` | `pages/diagnosis.tsx` |
| Adicionar recomendação ao plano | `POST /plan` → `plan.store` | `pages/results.tsx` |
| Editar ação do plano | `PATCH /plan/{action}` → `plan.update` | `pages/plan.tsx` |
| Remover ação do plano | `DELETE /plan/{action}` → `plan.destroy` | `pages/plan.tsx` |
| Marcar/desmarcar meta da rota | `POST /goals/{goal}/toggle` → `goals.toggle` | `pages/path.tsx` |

Depois que cada rota existir, me avisa: eu troco o `updateDemo(...)` da página pela chamada `router.post/patch/delete` e passo a ler das props.

### 5. Segurança (é o que a professora mais vai avaliar)
- Todas as rotas acima dentro do middleware `auth` (já estão).
- **Policies** (`PlanActionPolicy`, `CompanyPolicy`): um usuário só pode ver/alterar dados da **própria** empresa. Ex.: `PATCH /plan/5` de outra empresa → 403.
- **Validação** em todos os `store/update` (ex.: `value` entre 0 e 3, `status` só os 3 valores).
- **Recalcular a pontuação no servidor** ao salvar o diagnóstico (não confiar em nota vinda do navegador).
- Testes de autorização (Pest): tentar acessar/alterar dados de outra empresa e confirmar o bloqueio.

### 6. Idioma no backend
As mensagens de validação do Laravel ainda saem em inglês. Ler o cookie `locale` (`es`/`pt`) num middleware e chamar `App::setLocale()`; instalar as traduções (ex.: pacote `laravel-lang/lang`, idiomas `es` e `pt_BR`). Obs.: o cookie é criado pelo JavaScript (sem criptografia), então o Laravel precisa ser avisado para não tentar descriptografá-lo: em `bootstrap/app.php`, dentro de `withMiddleware`, adicionar `$middleware->encryptCookies(except: ['locale']);`.

### 7. Deploy (Render + Neon)
- Criar o banco PostgreSQL no Neon e usar a URL no `DB_URL`/`DB_*` do Render.
- Dockerfile para o Render (PHP + Node para rodar `npm run build`).
- No start do container: `php artisan migrate --force` (e os seeders do catálogo na primeira vez).
- `SESSION_DRIVER=database` e `CACHE_STORE=database` (o disco do Render é apagado a cada deploy).
- Fazer um primeiro deploy cedo, mesmo só com o login funcionando.

---

## A validar com a equipe do Chile

Estas partes foram **propostas nossas** e estão marcadas em `catalog.ts`:
- Qual ODS corresponde a cada pergunta.
- Textos das 22 recomendações, das 12 metas da Ruta sostenible e das descrições dos ODS.
- Divisão Trabajadores (soc-1 a 3) × Comunidad (soc-4 e 5).
- Limite de lacuna em 50 (o documento cita "por exemplo, 50").
- Perguntas do setor não contam na nota.

---

## Combinados da dupla

- Uma branch por funcionalidade (`feature/diagnosis-backend`, `feature/plan-backend`...) e Pull Request revisado pelo outro antes do merge.
- Commits pequenos e frequentes, cada um com a própria conta (a professora avalia o processo).
- Nomes de variáveis, chaves, tabelas e rotas em **inglês**; textos da interface em espanhol/português.
