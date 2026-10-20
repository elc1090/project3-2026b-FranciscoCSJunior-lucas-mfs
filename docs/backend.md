# Backend SOSTENPYME

## Inicialização

Com PHP 8.4, Composer e Node instalados:

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run build
php artisan serve
```

Os seeders são idempotentes e carregam apenas o catálogo, sem usuário ou senha de demonstração. O conteúdo foi copiado integralmente de `resources/js/data/catalog.ts` para `database/data/catalog.json`. Alterações no catálogo precisam atualizar as duas fontes enquanto a integração do frontend estiver pendente.

Cada cadastro cria uma empresa na mesma transação. Contas antigas recebem uma empresa ao acessar o sistema. Exclusão do usuário remove os dados da empresa por chaves estrangeiras.

## Integração do frontend

As oito rotas GET autenticadas fornecem `company`, `answers`, `plan`, `completedGoals`, `history`, `questions`, `recommendations`, `pathGoals` e `sdgs`, com os formatos de `types/sostenpyme.ts`. Também fornecem `scores`, `dimensionScores`, `totalScore` e `priorities` (cada prioridade contém `area`, `score`, `recommendationIds`). `answers` começa como objeto vazio, e plano, metas e histórico começam vazios.

Conforme a divisão do README, as páginas React ainda usam `demo-store.ts`. A pessoa responsável pelo frontend deve passar a ler as props do Inertia e usar estas rotas:

| Nome | Método e endereço | Corpo |
|---|---|---|
| `company.update` | `PUT /company` | `{ name, sector, size, workers, region }` |
| `diagnosis.store` | `POST /diagnosis` | `{ answers: { "env-1": 0, ... } }` |
| `plan.store` | `POST /plan` | `{ recommendationId: "r-env-1" }` |
| `plan.update` | `PATCH /plan/{action}` | Campos alterados: `{ owner, dueDate, indicator, status }` |
| `plan.destroy` | `DELETE /plan/{action}` | Sem corpo |
| `goals.toggle` | `POST /goals/{goal}/toggle` | Sem corpo; `goal` é o código, por exemplo `g1-env` |

`action` é o ID numérico enviado como string em `plan[].id`. `dueDate` aceita `YYYY-MM-DD`, string vazia ou `null` para limpar. Adicionar duas vezes a mesma recomendação mantém uma única ação. Todos os writes retornam redirecionamento Inertia; o diagnóstico redireciona para `/results`, os demais voltam à página anterior. Erros de validação retornam pelo mecanismo normal de sessão/Inertia.

O diagnóstico exige todas as 20 respostas gerais e as perguntas do setor atual. Cada resposta deve ser um inteiro de 0 a 3. Códigos desconhecidos ou de outro setor são rejeitados. Campos de notas e de propriedade enviados pelo cliente são ignorados. As perguntas setoriais geram recomendações, mas não entram nas notas. O histórico usa notas guardadas no momento de cada diagnóstico; mudar o setor não recalcula diagnósticos antigos.

## Segurança e testes

Todos os endpoints exigem autenticação. A empresa é obtida exclusivamente a partir do usuário autenticado. Policies protegem a empresa e ações do plano; tentar editar/excluir ação de outra empresa retorna 403. O cookie não criptografado `locale` aceita `pt` (pt_BR); os demais valores usam espanhol. As traduções locais cobrem as regras de validação utilizadas pelo sistema.

```sh
php artisan test
vendor/bin/pint --test
```

Os testes usam SQLite em memória, chave exclusiva de teste e dispensam os arquivos compilados do Vite. Seguem PHPUnit, já instalado e utilizado pelos testes existentes, sem adicionar Pest como dependência.

Validação local em 20/10/2026: 36 testes passaram (168 assertions), incluindo os testes anteriores de autenticação e perfil. A verificação de estilo PHP e a verificação de espaços do Git passaram. O build Docker não foi executado neste ambiente.

## Render e Neon

O `Dockerfile` compila o frontend e executa Laravel com Apache/PHP 8.4. `render.yaml` define o serviço e as variáveis. O container executa migrations e seeders idempotentes antes de servir. Não grava um banco SQLite de produção no disco efêmero.

1. Criar um projeto PostgreSQL no Neon e copiar a conexão em `DB_URL`, com SSL obrigatório (`sslmode=require`).
2. Criar o serviço no Render usando o Blueprint do repositório.
3. Preencher `APP_KEY` com uma chave gerada por `php artisan key:generate --show` e mantê-la estável entre deploys. Preencher `APP_URL` com o endereço HTTPS do serviço.
4. Informar a conexão Neon em `DB_URL`; sessões e cache usam o banco. Conferir `/up` e testar cadastro/login após o deploy.

Se a conexão Neon usar parâmetros próprios do cliente PostgreSQL, conservar os parâmetros compatíveis com PDO e usar `DB_SSLMODE=require`. Configurar SMTP nas variáveis do Render para recuperação de senha em produção: o mailer padrão `log` não envia e-mails.

Publicação real e criação do Neon ainda dependem do acesso às contas. Docker e PostgreSQL de produção precisam de validação no ambiente de deploy.
