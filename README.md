# Project Radar

A live project radar for Claude. It is a dashboard artifact that mirrors your Linear projects, plus the skills to install it, sync it, brief you every morning and update it.

- **Linear is the source of truth.** The radar shows it, and moves you make on the board go back to Linear on the next brief.
- **One config per account.** Nothing about you, your team or your clients lives in this repo. Each install reads its own private config.
- **Updates are opt-in.** Install a version, update when you want, keep your link and data.

## What you get

| Part | What it does |
|---|---|
| Dashboard artifact | Jump-in card, weekly progress, key events, due map, kanban by stage or week (drag and drop), projects with health, optional inbox tab. |
| `radar-setup` | Installs a radar in the current Claude account from a config file. |
| `radar-sync` | Makes the radar match Linear (owners, status, dates, new and closed issues). |
| `radar-brief` | Daily brief: applies board moves, syncs, updates health, sends a short calm message. |
| `radar-update` | Moves an installed radar to the latest version without losing its link or data. |

## Install

In Claude Code or Cowork:

```
/plugin marketplace add DashOne-AI/project-radar
/plugin install project-radar@project-radar
```

It is also listed in the DashOne community marketplace (`DashOne-AI/community-plugins`).

Then, in the Claude account where the radar should live:

```
/radar-setup
```

It asks for your config (or reads it from a path you give), publishes the artifact, loads your Linear projects and creates the daily brief.

## Config

One JSON file per radar. Start from `config/example.config.json`; the schema is `config/config.schema.json`.

Keep your config in a private place you control, for example `radar/config.json` in your own context repo. Never commit real configs here.

Typical setups:

| Instance | Where its config lives | Reads |
|---|---|---|
| Personal | your private repo | personal Linear projects, personal calendar, optional inbox |
| Company | the company context repo | company Linear team, work calendar, team members |
| Client | that client's context repo | the client's Linear team and repos |

Each Claude account authorizes its own connectors, so each account gets its own radar. Do not point one radar at several unrelated contexts.

## Connectors

| Connector | Needed for |
|---|---|
| Linear | Required. |
| Google Calendar | Key events. |
| Claude Code Remote | Refresh button and the scheduled brief. |
| Supabase | Optional inbox tab (`brew.enabled`). Read through the connector, never with keys. |
| GitHub, Vercel, Netlify, Gmail, WhatsApp | Optional signals in the brief. |

## Update

```
/plugin update project-radar
/radar-update
```

`radar-update` shows what changed (from `CHANGELOG.md`), republishes the page to the same link and runs any migration.

## Develop

- The page is a single file: `artifact/index.html`. Nothing instance specific goes in it; it reads `config/app` from the artifact database.
- `node scripts/check.mjs` checks the page's JavaScript, the JSON files, version alignment, and that no personal data slipped in.
- Database schema: `docs/db-schema.md`.
- Release: bump the version in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `RADAR_VERSION` in the page, add a `CHANGELOG.md` entry, tag `vX.Y.Z`.

## License

MIT. See `LICENSE`.
