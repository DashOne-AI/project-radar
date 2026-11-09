# Artifact database schema

The dashboard reads and writes the artifact's own shared database. The skills write it with the artifact data tool (`ArtifactData` or `db_write`). Field names are stable across versions; new versions only add fields.

## `config/app` (one document)

The instance config. `radar-setup` writes it from the config JSON (see `config/config.schema.json`), minus `projects`, plus:

| Field | Type | Notes |
|---|---|---|
| `brief_trigger` | string | Scheduled task id of the daily brief. The Refresh button fires it. |
| `installed_version` | string | Plugin version that last published the page. |
| `installed_at` | ISO datetime | |

## `config/main` (one document)

| Field | Type | Notes |
|---|---|---|
| `projects` | map slug → `{ linear_project }` | Maps a radar project to its Linear project name when they differ. |

## `projects/{slug}`

| Field | Type | Notes |
|---|---|---|
| `slug`, `name`, `client` | string | |
| `order` | number | Sort order on the Projects tab. |
| `linear_project`, `linear_url` | string | |
| `repos` | `[{ name, url }]` | First repo is the default for the Code button. |
| `deploy_url` | string | |
| `health` | `on_track` \| `at_risk` \| `off_track` | Set by the brief. |
| `progress_pct` | number | |
| `summary`, `next_milestone` | string | One line each. |
| `stats` | `{ linear_open, overdue, no_date, open_prs, gh_issues, failed_deploys }` | |
| `alerts` | `[{ kind, text, url }]` | |
| `target_date` | date or null | |
| `updated_at` | ISO datetime | |

## `items/{KEY}`

One document per open Linear issue (doc id = issue key, e.g. `ABC-123`).

| Field | Type | Notes |
|---|---|---|
| `id`, `ref` | string | Issue key. |
| `kind` | `linear` | |
| `project` | string | Project slug. |
| `title`, `url` | string | |
| `status` | string | Linear status name (Backlog, Todo, In Progress, In Review, ...). |
| `owner` | `{ kind: "user", name }` or null | Linear assignee display name. |
| `due` | `YYYY-MM-DD` or null | |
| `bucket` | `today` \| `this_week` \| `next_iteration` \| `someday` \| `unscheduled` \| `done` | Derived from `due`, see below. |
| `flags` | string[] | `no_date`, `overdue`, `stale`, `blocker`. |
| `github` | `{ issue_url, issue_state, pr_url, pr_state }` or null | |
| `updated_at` | ISO datetime | |
| `bucket_request`, `bucket_request_at` | string, ISO | Set by the page when you drag a card. The brief applies it in Linear and clears it. |
| `status_request`, `status_changed_at` | string, ISO | Same for status changes. |
| `owner_changed_at` | ISO | |

Bucket rule, in the instance time zone: no due date → `unscheduled`; due today or earlier → `today`; due by Sunday → `this_week`; due within 14 days → `next_iteration`; later → `someday`.

## `meta/latest` (one document)

Written by the brief.

| Field | Type | Notes |
|---|---|---|
| `generated_at` | ISO datetime | |
| `headline` | string | One calm line. |
| `summary_lines` | string[] | |
| `counts` | `{ overdue, today, failed_deploys }` | |
| `week` | `{ done, since }` | Issues completed since Monday. |
| `calendar` | `[{ title, start, end, url, needs_rsvp }]` | |
| `messages` | `[{ from, source, subject, url, why }]` | Messages that need a reply. |

## `refresh/{id}`

Written by the page when you press Refresh; the brief updates it.

| Field | Type | Notes |
|---|---|---|
| `scope` | string | `all` or a project slug. |
| `status` | `queued` \| `running` \| `done` \| `error` | |
| `requested_at`, `finished_at` | ISO | |
| `source` | `dashboard` | |
| `error` | string | |
