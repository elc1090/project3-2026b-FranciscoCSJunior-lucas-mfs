# Painel de administração: o que falta no backend

> Implementação: branch `codex/admin-backend`. O roteiro para o responsável pelo deploy está em [admin-deploy.md](admin-deploy.md). As seções abaixo preservam os requisitos originais do frontend.

O frontend do painel já está pronto. Este documento descreve o que o backend precisa fazer para ligá-lo aos dados reais.

O formato exato dos dados que cada página espera está em [`resources/js/types/admin.ts`](../resources/js/types/admin.ts). **Esse arquivo é o contrato.** Se algum nome precisar mudar, mude nos dois lados.

## O que foi decidido

- **Vários administradores.** Cada pessoa da equipe do Chile tem a própria conta, e um admin pode tornar outro usuário admin.
- **As empresas são só para ver.** O admin vê a lista e o detalhe de cada empresa, mas não edita nem exclui.
- **Usuários novos recebem uma senha provisória** criada pelo admin. A pessoa é avisada para trocá-la no primeiro acesso.
- **O admin usa só o painel de administração.** Ele não usa o site como empresa e não aparece na lista de empresas.

## Páginas do frontend (já prontas)

| Página (`Inertia::render`) | Arquivo | URL |
|---|---|---|
| `admin/dashboard` | `resources/js/pages/admin/dashboard.tsx` | `GET /admin` |
| `admin/companies` | `resources/js/pages/admin/companies.tsx` | `GET /admin/companies` |
| `admin/company` | `resources/js/pages/admin/company.tsx` | `GET /admin/companies/{company}` |
| `admin/users` | `resources/js/pages/admin/users.tsx` | `GET /admin/users` |

O frontend também já tem:
- o menu lateral do admin, que aparece quando `auth.user.role === 'admin'`;
- o aviso de senha provisória, que aparece quando `auth.user.must_change_password` é `true` e leva para `/settings/password`;
- uma frase no cadastro avisando que a equipe do SOSTENPYME pode ver os dados da empresa.

---

## 1. Banco de dados

Crie uma migration nova na tabela `users`:

| Coluna | Tipo | Observação |
|---|---|---|
| `role` | `string(16)`, default `'company'` | `'company'` ou `'admin'` |
| `must_change_password` | `boolean`, default `false` | `true` quando a senha foi definida por um admin |
| `last_login_at` | `timestamp`, nullable | Mostrado nas listas como "Último acesso" |

No model `User`:
- adicione `role`, `must_change_password` e `last_login_at` ao `$fillable`;
- adicione os casts `'must_change_password' => 'boolean'` e `'last_login_at' => 'datetime'`;
- **não** coloque essas colunas em `$hidden`, porque o frontend lê `auth.user.role` e `auth.user.must_change_password` do `auth.user` que já é compartilhado no `HandleInertiaRequests`;
- crie um helper `isAdmin(): bool`, que retorna `$this->role === 'admin'`.

## 2. Primeiro administrador

O Render gratuito não tem terminal, então o primeiro admin é criado por seeder a partir de variáveis de ambiente. O `docker/start.sh` já roda `db:seed` a cada deploy.

Crie o `AdminSeeder` e chame-o no `DatabaseSeeder`:
- leia `ADMIN_EMAIL`, `ADMIN_NAME` e `ADMIN_PASSWORD`. Se `ADMIN_EMAIL` estiver vazio, não faça nada;
- se **não existir** um usuário `local` com esse e-mail, crie-o com `role = 'admin'`, `must_change_password = true` e a senha com hash;
- se **já existir**, só garanta `role = 'admin'`. **Nunca sobrescreva a senha de um usuário que já existe**, porque o seeder roda em todo deploy;
- adicione as três variáveis ao `.env.example`, com o valor vazio.

Depois disso, os outros admins são criados pelo próprio painel.

## 3. Acesso: quem entra em quê

- Crie o middleware **`admin`** (`EnsureUserIsAdmin`): se o usuário não for admin, `abort(403)`.
- Crie o middleware **`company`** (`EnsureUserIsCompany`): se o usuário for admin, redirecione para `/admin` nos GET e responda `abort(403)` nos POST, PUT, PATCH e DELETE.
- Aplique `company` no grupo de rotas das páginas da empresa (`routes/web.php`: dashboard, company, diagnosis, ..., carbon, iso, results/ai).
  - Assim, depois do login, que redireciona para `/dashboard`, o admin cai automaticamente em `/admin`, tanto no login com senha quanto no login com Google.
  - Isso também impede que `SustainabilityController::company()` crie uma empresa vazia para o admin.

## 4. Último acesso e senha provisória

- **`last_login_at`:** registre um listener do evento `Illuminate\Auth\Events\Login` que faça `$event->user->forceFill(['last_login_at' => now()])->save()`. Ele cobre o login com senha e com Google.
- **Trocar a senha encerra o aviso:** no `Settings\PasswordController::update`, junto com a nova senha, salve `must_change_password = false`.

## 5. Rotas do painel

Todas ficam dentro de `Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')`.

| Método | URL | Nome | Faz |
|---|---|---|---|
| GET | `/admin` | `admin.dashboard` | Renderiza `admin/dashboard` |
| GET | `/admin/companies` | `admin.companies.index` | Renderiza `admin/companies` |
| GET | `/admin/companies/{company}` | `admin.companies.show` | Renderiza `admin/company` |
| GET | `/admin/users` | `admin.users.index` | Renderiza `admin/users` |
| POST | `/admin/users` | `admin.users.store` | Cadastra um usuário |
| PATCH | `/admin/users/{user}` | `admin.users.update` | Muda o tipo (`role`) |
| PUT | `/admin/users/{user}/password` | `admin.users.password` | Define uma senha provisória |

As ações (POST, PATCH e PUT) respondem com `return back();`. Os erros devem ser de validação, com as chaves abaixo, porque o frontend mostra cada erro embaixo do campo correspondente.

### 5.1 `GET /admin`: `AdminDashboardProps`

Considere só as **empresas cujo dono tem `role = 'company'`**.

- `stats.companies`: quantidade dessas empresas.
- `stats.diagnosedCompanies`: quantas delas têm pelo menos um diagnóstico.
- `stats.companyUsers`: usuários com `role = 'company'`.
- `stats.admins`: usuários com `role = 'admin'`.
- `stats.averageScore`: média, arredondada, da nota total do **último** diagnóstico de cada empresa. É `null` se nenhuma empresa tiver diagnóstico.
- `averageScores`: média, arredondada, por dimensão (`environmental`, `social`, `economic`, `governance`) e por subgrupo social (`workers`, `community`), usando o último diagnóstico de cada empresa. É `null` se nenhuma empresa tiver diagnóstico.
  - Calcule com `DiagnosisScoring::calculate()`, que já devolve `dimensionScores` e `scores`. Assim o resultado bate com o que a empresa vê.
- `companiesBySector`: `{ food: 2, tourism: 1, ... }`.
- `recentCompanies`: as 5 empresas mais recentes, no formato `AdminCompanyRow` descrito abaixo.

### 5.2 `GET /admin/companies`: `{ companies: AdminCompanyRow[] }`

Mostra todas as empresas de usuários `company`, ordenadas por `created_at` decrescente. A busca e o filtro de setor já são feitos no frontend.

Cada `AdminCompanyRow` tem:

| Campo | Origem |
|---|---|
| `id`, `name`, `sector`, `size`, `workers`, `region` | Colunas da empresa |
| `owner` | `{ name, email }` do usuário dono |
| `createdAt` | `created_at` da empresa (`Y-m-d`) |
| `lastDiagnosisAt` | Data do último diagnóstico (`Y-m-d`) ou `null` |
| `totalScore` | Nota total do último diagnóstico, com a mesma fórmula do `history.total` em `SustainabilityController::show()`, ou `null` |
| `scores` | `scores` do último diagnóstico ou `null` |
| `carbonLastMonth` | Registro de carbono mais recente (por `period`): `{ period: 'Y-m', total }`, com `total` vindo de `CarbonFootprint::calculate()`. É `null` sem registros |
| `isoDone` / `isoTotal` | Requisitos ISO marcados / `IsoRequirement::count()` |
| `planDone` / `planTotal` | Ações do plano com status `done` / total de ações |

Use eager loading (`with(['user', 'diagnoses', 'carbonRecords', ...])`, `withCount`) para não fazer uma consulta por empresa.

### 5.3 `GET /admin/companies/{company}`: mesmos props da empresa, mais o dono

A página de detalhe **reaproveita os gráficos e componentes da área da empresa**. Por isso, ela espera **exatamente as mesmas chaves** que `SustainabilityController::show()` envia (`company`, `answers`, `plan`, `history`, `questions`, `recommendations`, `carbonRecords`, `isoRequirements`, `completedIsoRequirements`, `scores`, `dimensionScores`, `totalScore`, `priorities`, ...), mais estas:

```php
'companyId' => $company->id,
'owner' => ['name' => ..., 'email' => ..., 'lastLoginAt' => $user->last_login_at?->toDateString()],
```

Sugestão: extraia o corpo do `show()` para um método, por exemplo `companyProps(Company $company): array`, usado pelos dois controllers. Assim não há código duplicado e as duas telas sempre mostram os mesmos números.

- Se a empresa for de um admin, responda `404`.
- `CompanyPolicy::view` precisa permitir admins. Por exemplo: `return $user->isAdmin() || $company->user_id === $user->id;`. Já o `update` **continua só para o dono**, porque o painel é somente leitura.

### 5.4 `GET /admin/users`: `{ users: AdminUserRow[] }`

Mostra todos os usuários, ordenados por `created_at` decrescente:

| Campo | Origem |
|---|---|
| `id`, `name`, `email`, `role` | Colunas do usuário |
| `authProvider` | `auth_provider` (`'local'` ou `'google'`) |
| `companyId`, `companyName` | Empresa do usuário, ou `null`. Para admins, envie `null` |
| `createdAt`, `lastLoginAt` | `Y-m-d`, ou `null` para quem nunca entrou |
| `mustChangePassword` | `must_change_password` |

### 5.5 `POST /admin/users`: cadastrar

Campos enviados: `name`, `email`, `role`, `companyName`, `password`.

| Campo | Regras |
|---|---|
| `name` | `required`, `string`, `max:255` |
| `email` | `required`, `email`, `max:255`, único entre usuários `local`: `Rule::unique('users')->where('auth_provider', 'local')` |
| `role` | `required`, `in:company,admin` |
| `companyName` | `required_if:role,company`, `nullable`, `string`, `max:255` |
| `password` | `required`, `string`, `min:8` |

Crie o usuário com `auth_provider = 'local'`, a senha com hash, `must_change_password = true` e o `role` escolhido. Se o `role` for `company`, crie também a empresa com `name = companyName`. Os outros campos ficam com os defaults da tabela.

### 5.6 `PATCH /admin/users/{user}`: mudar o tipo

Campo enviado: `role` (`in:company,admin`).

Recuse com um erro de validação na chave `role` quando:
- o admin tentar mudar o próprio tipo, porque ele perderia o acesso. O frontend já esconde essa opção, mas o backend também precisa recusar;
- a mudança deixaria o sistema sem nenhum admin.

A empresa de quem vira admin **não é apagada**; ela só deixa de aparecer nas listas. Se a pessoa voltar a ser `company`, os dados continuam lá.

### 5.7 `PUT /admin/users/{user}/password`: senha provisória

Campo enviado: `password` (`required`, `string`, `min:8`).

- Só vale para usuários `local`. Para usuários do Google, retorne um erro de validação na chave `password`.
- Salve a senha com hash e `must_change_password = true`.
- Recomendado: encerre as sessões abertas dessa pessoa com `DB::table('sessions')->where('user_id', $user->id)->delete()`.

## 6. Testes sugeridos

- Usuário `company` recebe `403` em todas as rotas `/admin`, e visitante sem login é redirecionado para `/login`.
- Admin que abre `/dashboard` é redirecionado para `/admin`, e admin que faz POST em `/diagnosis` recebe `403`.
- Os números de `/admin` batem com dados conhecidos, e empresas de admins não entram na conta.
- O detalhe da empresa traz os mesmos `scores` e `totalScore` que o dono vê em `/results`.
- O cadastro cria o usuário com `must_change_password = true` e cria a empresa quando o tipo é `company`. Também recusa e-mail repetido.
- Mudar o tipo funciona, mas o admin não muda o próprio tipo e o último admin não é removido.
- A senha provisória vale para `local` e é recusada para `google`. Trocar a senha em `/settings/password` limpa `must_change_password`.
- O `AdminSeeder` cria o admin, roda de novo sem mudar a senha e promove um usuário que já existe.
- `last_login_at` é preenchido no login.

## 7. Depois do deploy

No Render, adicione `ADMIN_EMAIL`, `ADMIN_NAME` e `ADMIN_PASSWORD` em **Environment**. Depois do primeiro deploy, entre com esse e-mail, troque a senha e cadastre os outros admins pelo painel.
