# Login Google e perfil no SOSTENPYME

Adaptação do fluxo de [demo-auth-profile](https://github.com/elc1090/demo-auth-profile) para o projeto Laravel existente. O exemplo usa Express e Node; aqui mantemos Laravel, React, Inertia e o banco já utilizado pela aplicação.

Todas as alterações desta implementação ficam na branch `codex/auth-profile`, criada a partir da `main` do [repositório oficial](https://github.com/elc1090/project3-2026b-FranciscoCSJunior-lucas-mfs). Não publicar nem executar migrations na produção antes da revisão da branch.

## 1. Preparar o ambiente local

Instalar PHP 8.4 com OpenSSL, PDO SQLite, cURL e mbstring, Composer e Node 22.13+.

```sh
composer install
corepack enable
pnpm install --frozen-lockfile
```

Se ainda não existir `.env`, copiar `.env.example` e executar `php artisan key:generate`. Não substituir um `.env` existente nem mudar uma chave de produção.

Para o teste local, usar:

```dotenv
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
```

Usar um banco SQLite local; não manter `DB_URL` apontando para Neon ou outro banco de produção. Criar `database/database.sqlite` se necessário.

```sh
php artisan migrate --seed
pnpm build
php artisan serve --host=localhost --port=8000
```

Abrir `http://localhost:8000`. Usar sempre esse endereço durante o teste, sem trocar por `127.0.0.1`, porque os cookies da sessão dependem do domínio.

O cadastro e login com senha continuam funcionando sem Google. O botão Google fica desabilitado enquanto as credenciais não estiverem configuradas. Contas novas ou com perfil incompleto são encaminhadas para completar o perfil.

## 2. Configurar a Google Auth Platform

1. Abrir o [Google Cloud Console](https://console.cloud.google.com/) e selecionar o projeto SOSTENPYME.
2. Abrir **APIs e serviços → Tela de permissão OAuth**, que leva à Google Auth Platform.
3. Configurar o nome da aplicação e os e-mails de suporte e contato.
4. Escolher público **Externo**, em modo de teste. Revisar pessoalmente a política de dados antes de aceitar.
5. Em **Clientes**, criar um cliente do tipo **Aplicativo da Web**, com nome `SOSTENPYME Local`.
6. Cadastrar esta URI de redirecionamento autorizada, sem barra adicional:

```text
http://localhost:8000/auth/google/callback
```

7. Guardar o Client ID e o Client secret apenas no `.env` local:

```dotenv
GOOGLE_CLIENT_ID=valor-fornecido-pelo-google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=valor-fornecido-pelo-google
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

8. Executar `php artisan config:clear`, reiniciar o servidor local e recarregar a página de login.

Não colocar credenciais em arquivos públicos ou commits. O código pede apenas `openid email profile`; não é necessário ativar Gmail ou Drive. Não é necessário configurar origens JavaScript para esse fluxo, pois o callback é recebido pelo backend.

## 3. Testar o fluxo completo

1. Criar uma conta com senha, completar nome, curso/área e cidade, salvar, sair e entrar novamente. Conferir a persistência; interesses e apresentação são opcionais.
2. Sair e clicar em **Continuar com Google**. Escolher uma conta e aprovar o consentimento apresentado pelo Google.
3. Completar e salvar o perfil; sair e entrar novamente com a mesma conta Google. Conferir que nome e campos adicionais não foram substituídos.
4. Conferir que o novo usuário Google recebe sua própria empresa.
5. Testar outra conta em uma janela separada: ela deve ter perfil, empresa, diagnósticos e plano próprios.
6. Sem login, abrir `/settings/profile`: o Laravel deve redirecionar para `/login`.
7. Conferir as duas versões da interface, em português e espanhol.

As contas Google e com senha são independentes, mesmo quando têm o mesmo e-mail. O identificador permanente Google (`sub`) identifica a conta Google. Não existe associação automática por e-mail. A recuperação e a alteração de senha afetam somente contas locais. O e-mail de uma conta Google não é editável pelo formulário local.

Para excluir uma conta Google, é necessário ter entrado com Google nos últimos dez minutos e confirmar o próprio e-mail. Se a sessão for mais antiga, sair e entrar novamente antes de excluir. Contas locais continuam exigindo a senha atual.

## 4. Verificar a segurança

O backend usa a biblioteca oficial `google/auth` para validar a assinatura, o emissor e o público do ID token. Também confere validade, e-mail verificado e `nonce`. O fluxo usa `state` aleatório, validade de dez minutos e PKCE; cada tentativa é consumida uma única vez. Após o login, o identificador da sessão é renovado.

O Client secret e a troca do código por tokens ficam no backend. Tokens de acesso e refresh tokens não são gravados no banco. As rotas de gravação continuam usando a proteção CSRF do Laravel; as rotas de perfil continuam protegidas por sessão. As Policies do SOSTENPYME continuam isolando os dados das empresas. Não usar `stateless()` nem desativar a validação de certificados para resolver problemas de configuração.

```sh
php artisan test
vendor/bin/pint --test
pnpm typecheck
pnpm build
```

Os testes de autenticação usam chaves RSA geradas durante a execução e respostas HTTP locais para exercitar a verificação criptográfica, sem credenciais reais. Cobrem tokens inválidos, assinatura incorreta, estado, nonce, separação entre provedores, perfil persistente e restrições de senha. Isso não substitui o teste manual de consentimento e login com uma conta Google real.

O banco de testes é forçado para SQLite em memória, incluindo a remoção de `DB_URL`, para que os testes não usem a conexão de produção do `.env`.

## 5. Escopo local e branch de trabalho

Esta implementação deve permanecer na branch `codex/auth-profile`. O cliente Google criado, `SOSTENPYME Local`, autoriza somente o callback `http://localhost:8000/auth/google/callback`. As credenciais ficam apenas no `.env` local e não entram no Git.

Não fazer merge na `main`, deploy, alteração de variáveis no Render ou migration no Neon como parte deste trabalho. O teste usa um SQLite separado em `.local-tools/auth-profile.sqlite`. Publicar a branch para revisão não significa implantar a aplicação em produção.

A migration local adiciona os campos de perfil e de identidade, torna a senha opcional e troca a unicidade do e-mail por `(email, auth_provider)`. Os usuários existentes mantêm suas contas, senhas, IDs e dados. O rollback dessa migration é recusado para não apagar perfis ou tentar juntar contas com o mesmo e-mail; uma reversão precisa de backup e planejamento.

## Problemas comuns

| Problema | O que conferir |
|---|---|
| `redirect_uri_mismatch` | URI cadastrada no Google e `GOOGLE_REDIRECT_URI` devem coincidir exatamente. |
| Botão Google desabilitado | Preencher ID e secret, limpar o cache de configuração e reiniciar o servidor. |
| Solicitação inválida ou expirada | Iniciar novamente pelo botão Google, no mesmo navegador e domínio, com cookies permitidos. |
| `invalid_client` | ID e secret devem pertencer ao mesmo cliente Web. |
| Senha não acessa a conta Google | Usar o mesmo método empregado no cadastro; os provedores são separados. |
| Banco ou migration com erro | Conferir se o ambiente local aponta para SQLite e se `composer install` foi executado. |
| PHP portátil no Windows não gera chaves nos testes | Definir `OPENSSL_CONF` para o arquivo `extras/ssl/openssl.cnf` da instalação PHP. |
| Erro cURL 60 ao consultar o Google | Configurar `curl.cainfo` e `openssl.cafile` no `php.ini` com uma lista atual de certificados CA confiáveis. |
| Identidade recusada com `BeforeValidException` no diagnóstico | Sincronizar o relógio do computador. A verificação aceita até 30 segundos de diferença, preservando a rejeição de tokens expirados. O diagnóstico registra somente a etapa, o tipo e a localização da exceção, sem credenciais ou tokens. |

## Referências

- [Exemplo da disciplina](https://github.com/elc1090/demo-auth-profile)
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [Biblioteca oficial Google Auth para PHP](https://github.com/googleapis/google-auth-library-php)
