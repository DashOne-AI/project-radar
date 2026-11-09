---
name: radar-setup
description: Installs Project Radar in the current Claude account. Reads or builds the instance config, publishes the dashboard artifact, fills its database from Linear and creates the daily brief scheduled task. Use when someone says "install the radar", "set up project radar", "instala el radar", "configura el radar en esta cuenta", or runs /radar-setup.
---

# Radar setup

Installs one radar instance. One Claude account or context gets one radar (for example: personal, a company, a client). Never mix instances: each one reads only its own Linear team, calendars and data.

Works with requests in English or Spanish. Reply in the user's language.

## 0. Preconditions

1. Linear connector is connected. If a Linear tool is not loaded, search for it by exact name (for example `select:mcp__Linear__list_issues`) before saying it is missing.
2. Optional connectors, only if the config uses them: Google Calendar, Claude Code Remote (Refresh button and scheduled task), Supabase (only if `brew.enabled`), a WhatsApp connector (only if `delivery.whatsapp_chat`).
3. If a required connector is missing, stop and tell the user which one to connect in Settings, Connectors.

## 1. Get the config

In this order:

1. The user gave a path or URL to a config JSON (for example a private context repo at `radar/config.json`). Read it.
2. The current project or repo has `radar/config.json` or `radar.config.json`. Read it.
3. Otherwise build it with the user, asking at most these, all in one message:
   - Instance id and brand name.
   - Linear team (offer the list from `list_teams`) and workspace slug (from any issue URL).
   - People: name, color, and which one is the user (`is_me`). Offer the Linear users list.
   - Calendars for Key events (default `primary`).
   - Time zone and brief time (default 09:00).
   - Optional inbox tab (Supabase project ref) and WhatsApp delivery chat.
   Then show the JSON and offer to save it where the user keeps private config. Never commit it to the project-radar repo.

Validate against `config/config.schema.json` in this plugin. Fix obvious issues and say what you changed.

## 2. Projects

1. `list_projects` for the team. For every Linear project that is not completed or canceled, there must be a radar project, and the reverse. Use `config.projects` when present; otherwise propose slugs and names and confirm in one message.
2. Never invent a radar project that has no Linear project.

## 3. Publish the artifact

1. Take `artifact/index.html` from this plugin as is. Do not edit it per instance: everything instance specific goes in the database.
2. Build the capabilities from `artifact/capabilities.json`: drop the `required` and `why` keys, and drop optional servers the config does not use (Supabase when `brew.enabled` is false; Google Calendar when `calendars` is empty; Claude Code Remote if the user does not want the Refresh button).
3. Publish it as a new artifact titled `<brand> Project Radar` (or `Project Radar` without a brand), icon `radar`. Save the URL.
4. If the user already has a radar for this instance (listed by the artifact tools, or an URL in the config as `artifact_url`), update that one instead and keep its database.

## 4. Fill the database

Write with the artifact data tool, in batches of 50:

1. `config/app`: the config without `projects`, plus `installed_version` (from `.claude-plugin/plugin.json`) and `installed_at`.
2. `config/main`: `{ projects: { <slug>: { linear_project } } }`.
3. `projects/<slug>` for every project (schema in `docs/db-schema.md`).
4. Run the `radar-sync` skill to create `items/*` from Linear.

## 5. Scheduled task for the daily brief

1. Create one recurring scheduled task in the user's time zone at `brief_time` on weekdays (jitter the minute off :00, as the scheduler guidance says). Its prompt: "Run the radar-brief skill of the project-radar plugin for the radar at <artifact URL>. Instance: <instance>." Add the plugin to the task if the scheduler supports enabled plugins; otherwise paste the radar-brief steps into the prompt.
2. Write its id to `config/app.brief_trigger` so the Refresh button works.
3. Say which approval setting the task got.

## 6. Default rules for the instance

- New Linear issues created by the radar are assigned to the person with `is_me: true`, unless the user names someone else.
- The brief never closes, cancels, deletes or re-dates anything without an explicit reaction from the user.

## 7. Finish

Reply in one short paragraph: artifact link, number of projects and items loaded, brief time, and anything left to connect.
