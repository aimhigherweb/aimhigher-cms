# AimHigher CMS

Strapi 5 CMS for the AimHigher website and client portal. It serves the REST API under `/api` and
GraphQL at `/graphql`, and the admin panel at `/admin`.

## Setup

Requires Node 24 (`.nvmrc`; fnm/nvm pick it up).

```sh
npm ci
cp .env.example .env         # fill in op:// references to the 1Password item
npm run build
npm run develop              # http://localhost:1337/admin
```

`.env` holds `op://AimHigher/aimhigher-cms/<FIELD>` references rather than secrets. `develop`, `start`
and `console` run through `scripts/with-env.sh`, which resolves them with `op run` (the 1Password CLI).
On Azure there's no `.env`, so the App Service settings are used instead. Every variable is listed in
`.env.example`.

The database defaults to SQLite in `.tmp/data.db`. Set `DATABASE_CLIENT=postgres` (plus
`DATABASE_URL` or the host/port/name/user vars) to use Postgres. Azure blob uploads, SendGrid and
Sentry each switch on only when their env vars are set. Without Azure, uploads go to
`public/uploads`.

## Scripts

| Script | What it does |
| --- | --- |
| `develop` | Dev server with auto-reload; content types can be edited in the admin |
| `start` | Production server (run `build` first) |
| `build` | Builds the admin panel |
| `console` | REPL with the Strapi app loaded |
| `upgrade` / `upgrade:dry` | Upgrade Strapi with the official codemods |

There's a VS Code task for each script (Terminal › Run Task). `start` runs on its own when the folder
opens.

## Portal tokens

A **Token** entry links a token string to a users-permissions user. A request can send it as
`?token=<value>` or as `Authorization: Bearer <value>`, and it's then handled as that user, with that
user's role permissions (`src/middlewares/portal-token.js`). Only **published** tokens are accepted, so
you can revoke one by unpublishing it.

## Deployment

Pushing to `prod` builds the project in GitHub Actions and deploys it, including `node_modules`, to
the `aimhigher-cms` Azure Web App (`.github/workflows`). Azure doesn't build again.

`scripts/sync-secrets.sh` copies values from 1Password to where they're needed. It prints the plan
first and only changes things with `--apply`:

```sh
scripts/sync-secrets.sh github [--apply]   # Actions secrets (DISCORD_WEBHOOK); removes unused ones
scripts/sync-secrets.sh azure [--apply]    # App Service settings, removes v3 leftovers, sets Node 24
```
