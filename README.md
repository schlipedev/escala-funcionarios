# Escala de Funcionários

Aplicativo de gestão de escala semanal de funcionários. Construído com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** e **Supabase**, projetado para deploy como site estático no **GitHub Pages**.

## Funcionalidades

- Visualização semanal (segunda a domingo) com navegação entre semanas.
- Gestão de **locais**, **funcionários** e **turnos**.
- CRUD completo de turnos (criar, editar, excluir, duplicar).
- Duplicar a semana inteira para a semana seguinte.
- Interface responsiva em português.

## Configuração local

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Crie o arquivo `.env.local` a partir do exemplo:

   ```bash
   cp .env.local.example .env.local
   ```

   Preencha com as credenciais do seu projeto Supabase (Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```

3. Provisione o banco: abra o **SQL Editor** do Supabase e rode o conteúdo de
   [`supabase/schema.sql`](./supabase/schema.sql) (inclui dados de exemplo opcionais).

4. Rode o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

## Deploy no GitHub Pages

O projeto usa **static export** (`output: 'export'`), gerando a pasta `out/`.

1. Crie um repositório no GitHub com o nome desejado (ex.: `escala-funcionarios`).
   O `basePath`/`assetPrefix` é derivado automaticamente do nome do repositório
   pela variável `NEXT_PUBLIC_BASE_PATH` no workflow.

2. Em **Settings → Secrets and variables → Actions**, adicione os secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Em **Settings → Pages**, defina **Source** como **GitHub Actions**.

4. Faça push para a branch `main`. O workflow em
   [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) irá buildar e
   publicar o site em `https://<usuario>.github.io/<repo>/`.

## Estrutura

- `app/` — páginas e layout (App Router).
- `components/` — grade da escala e diálogos de turno/gestão.
- `lib/` — cliente Supabase, tipos, utilitários de data e camada de dados.
- `supabase/schema.sql` — schema SQL e dados de exemplo.
