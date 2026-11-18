# AimHigher CMS

Strapi 5 CMS for the AimHigher website and client portal. It serves the REST API under `/api` and
GraphQL at `/graphql`, and the admin panel at `/admin`.

## Setup

Requires Node 24 (`.nvmrc`; fnm/nvm pick it up).

```sh
npm ci
npm run build
op run --env-file=config/.env.1password -- npm run develop   # http://localhost:1337/admin
```

`config/.env.1password` lists every variable, as `op://AimHigher/aimhigher-cms/<FIELD>` references
or plain values that aren't secret. It holds no secrets, so it's committed. The npm scripts don't
load it themselves. Locally, `op run` (the 1Password CLI) resolves it and passes the values to the
command. The VS Code `start`, `develop` and `console` tasks do this for you. On Azure, `npm start`
reads the App Service settings instead.

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

There's a VS Code task for each script (Terminal › Run Task). `develop` runs on its own when the folder
opens, so you can edit content types straight away.

## Ordering FAQs

FAQs are ordered by their `sortOrder` field, which you set by dragging them in the admin list view
(the drag icon next to Settings, from `strapi-plugin-sortable-entries`). New FAQs go to the end. The
website's FAQ page sorts by `sortOrder`.

## Portal tokens

A **Token** entry links a token string to a users-permissions user. A request can send it as
`?token=<value>` or as `Authorization: Bearer <value>`, and it's then handled as that user, with that
user's role permissions (`src/middlewares/portal-token.js`). Only **published** tokens are accepted, so
you can revoke one by unpublishing it.

## Deployment

Pushing to `prod` builds the project in GitHub Actions and deploys it, including `node_modules`, to
the `aimhigher-cms` Azure Web App (`.github/workflows`). Azure doesn't build again.

Secrets live in 1Password. To copy them to GitHub Actions or the App Service, use `sync-secrets`
from the terminal setup (`~/.zsh/conf/core.zsh`). It prints the plan first and only changes things
with `--apply`:

```sh
sync-secrets config/.env.1password github --apply
sync-secrets config/.env.1password azure -g aimhigher --app aimhigher-cms \
  --runtime 'NODE|24-lts' --set NODE_ENV=production --apply
```

Azure skips `HOST` and `PORT` (App Service sets the port). Add `--prune` to remove the old v3
settings (MongoDB, Algolia, `STRAPI_UUID`).
