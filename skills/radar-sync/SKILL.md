---
name: radar-sync
description: Syncs a Project Radar artifact's database with Linear (owners, status, due dates, new and closed issues). Use when someone says "update the radar from Linear", "sync the radar", "actualiza el radar desde Linear", or after bulk changes in Linear.
---

# Radar sync

Makes the radar's `items` match Linear. Linear is the source of truth; the radar never writes Linear in this skill.

## Inputs

- The radar artifact URL (ask if there is more than one and the user did not say which).
- `config/app` from its database: `linear_team`, `timezone`, `people`.

## Steps

1. **Read Linear.** `list_issues` for the team with state `backlog`, `unstarted` and `started`, `limit` 250, paging with the cursor until `hasNextPage` is false. Ask only for the fields you need: `id`, `status`, `assignee`, `dueDate`, `project` (add `title`, `url` only for issues not in the radar yet).
2. **Read the radar.** List `items` with `out_dir` so documents land in files, not in the conversation. Keep each document's `version`.
3. **Diff** in a script, not by hand:
   - Existing item, changed `owner`, `status` or `due` → `update` with only the changed fields, plus `updated_at`. When `due` changes, recompute `bucket` and the `no_date` / `overdue` flags (rules in `docs/db-schema.md`). Never touch an item that has a pending `bucket_request` or `status_request`.
   - If `only_listed_projects` is true, ignore Linear issues whose project is not in the radar's projects, and treat radar items from other projects as closed.
   - Open in Linear, missing in the radar → `set` a new item. Map the Linear project name to a radar slug through `config/main.projects` or `projects/*.linear_project`. If there is no radar project, put it under `general` and tell the user.
   - In the radar, not open in Linear anymore → set `bucket: "done"` and its final status. Do not delete.
4. **Write** with `batch` (50 per call), each entry pinned with `if_version`. For many identical updates, put the shared data in one local JSON file and pass it as `file_path` per entry to keep calls short.
5. **Stamp** `meta/latest.generated_at` with the sync time.

## Report

One or two lines: how many items changed, by field; new and closed issues by key with links; anything that could not be mapped.
