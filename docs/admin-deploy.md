# Publicação do backend administrativo — Francisco

As alterações estão na branch `codex/admin-backend`, baseada na `main` que contém o frontend administrativo (`bda54e9`). Nenhuma configuração de produção foi alterada por esta implementação.

## Antes de publicar

1. Revisar o diff da branch e integrar na branch usada pelo serviço Render. Confirmar o repositório configurado no serviço, pois o projeto já usou outro remoto.
2. Fazer um backup do PostgreSQL e conferir a conexão usada pelo Render. A migration nova apenas acrescenta `role`, `must_change_password` e `last_login_at`; usuários existentes ficam com `role=company`.
3. No serviço existente do Render, em Environment, cadastrar:

   ```dotenv
   ADMIN_EMAIL=email-do-primeiro-admin
   ADMIN_NAME=Nome do primeiro administrador
   ADMIN_PASSWORD=senha-provisoria-com-pelo-menos-8-caracteres
   ```

   Usar uma senha exclusiva. Não colocar esses valores no Git. As outras variáveis do serviço e do Google permanecem conforme a configuração existente.

4. Publicar pelo fluxo habitual do serviço. `docker/start.sh` já executa `php artisan migrate --force` e `php artisan db:seed --force`, antes de iniciar o Apache.

O seeder cria somente uma conta **local** quando o e-mail ainda não existe nesse provedor. Se já existir conta local com esse e-mail, apenas promove para admin e preserva a senha atual. Uma conta Google com o mesmo e-mail continua separada. Sem `ADMIN_EMAIL`, o seeder não faz nada. Para uma conta nova, senha ausente ou curta causa falha explícita, evitando criar um admin sem credencial utilizável.

## Conferência após publicação

1. Entrar pelo login com e-mail e senha. O administrador deve abrir `/admin`, mesmo sem curso/cidade preenchidos, e não deve ganhar uma empresa vazia.
2. Trocar a senha provisória em `/settings/password`; o aviso deve desaparecer. Se a conta já existia, entrar com sua senha anterior.
3. Conferir lista, detalhe de empresas e gráficos. As empresas de admins ficam ocultas, mas seus dados são preservados.
4. Criar uma conta company com empresa, testar seu login e a troca da senha provisória. Criar o segundo administrador pelo painel e conferir seu acesso.
5. Como usuário company, conferir que `/admin` responde 403. Como admin, conferir que `/dashboard` redireciona para `/admin` e que não é possível alterar dados das empresas.
6. Conferir `Último acesso` após novo login, inclusive para contas Google já configuradas.

Depois de confirmar o primeiro acesso, remover `ADMIN_PASSWORD` do ambiente é possível: nos deploys seguintes, com a conta local já criada, o seeder preserva a senha. Manter `ADMIN_EMAIL` faz com que essa conta seja novamente garantida como admin em todo deploy; remover também esse e-mail desativa o bootstrap. Não remover antes de conferir o primeiro login.

## Validação local

Executar com PHP 8.4 e dependências instaladas:

```sh
php artisan test
php vendor/bin/pint --dirty
npm run typecheck
npm run build
```

O PHPUnit usa SQLite em memória e não executa migrations no banco de produção. No PHP portátil do Windows, definir `OPENSSL_CONF` para `extras/ssl/openssl.cnf` antes dos testes Google.

Validação desta entrega: 74 testes passaram (690 verificações), TypeScript sem erros, build Vite concluído e formatação PHP conferida. A migration foi exercitada no SQLite dos testes; a aplicação no PostgreSQL de produção e a conferência final do painel cabem ao responsável pelo deploy.

O painel apenas lê empresas. A redefinição de senha no painel atende somente contas locais, marca a senha como provisória, apaga sessões no banco e troca o token de “lembrar de mim”. Contas Google continuam autenticando pelo Google.
