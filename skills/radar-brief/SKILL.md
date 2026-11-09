---
name: radar-brief
description: Runs the daily Project Radar brief, or a manual refresh from the dashboard. Applies the moves made on the board to Linear, syncs the radar, updates project health and the weekly summary, and sends a short calm brief. Use when a scheduled task asks for the radar brief, when the dashboard sends "MANUAL REFRESH", or when someone says "run the radar brief" or "corre el brief del radar".
---

# Radar brief

Usually runs unattended from a scheduled task. Nobody answers questions during the run: never ask, decide with the rules below and report.

## Inputs

- Radar artifact URL (in the scheduled task prompt).
- Its `config/app`: `linear_team`, `linear_workspace`, `timezone`, `brief_language`, `people`, `calendars`, `delivery`, `brew`.
- If the run text starts with `MANUAL REFRESH scope=<scope> id=<id>`: set `refresh/<id>` to `running`, limit the work to that scope (`all` or one project slug), skip delivery, and at the end set it to `done` (or `error` with a short reason).

## Hard rules

- Linear is the source of truth. Every radar project maps 1:1 to a Linear project.
- Never close, cancel, delete or re-date an issue unless the user did it on the board (`bucket_request`, `status_request`) or reacted to a proposal.
- New issues are assigned to the person with `is_me: true` unless the source names someone else.
- No questions in the output. Calm tone: no alarm words, no all-caps, at most one item marked urgent.
- Never print secrets. Read databases through connectors only.

## Steps

1. **Apply board moves.** For each item with `bucket_request` or `status_request`:
   - `bucket_request` → set the Linear due date: `today` = today, `this_week` = this Friday, `next_iteration` = Friday next week, `someday` = remove the date and move to Backlog, `done` = completed state.
   - `status_request` → set that Linear status.
   - Then clear the request fields. If Linear refuses, leave the request and note it.
2. **Sync.** Run the `radar-sync` steps for the scope.
3. **Signals per project** (only from connectors that are present; skip silently otherwise):
   - GitHub: open PRs and their age, open issues, red CI on the default branch, for each repo in `projects/<slug>.repos`.
   - Deploys: failed production deploys in the last 48 h (Vercel, Netlify).
   - Messages: Gmail threads and WhatsApp chats from the last 24 h that need a reply from the user and relate to a project.
   - Calendar: events in the next 7 days from `calendars`; keep non-recurring ones or ones that match a project.
4. **Update `projects/<slug>`:** `stats`, `alerts` (max 3, each with a link), `health` (`on_track`, `at_risk`, `off_track`), `progress_pct` (done / total in the current milestone or cycle), one-line `summary` and `next_milestone`, `updated_at`.
5. **Update `meta/latest`:** `generated_at`, `headline` (one calm line about the most useful next action), `summary_lines` (max 5), `counts`, `week` (`done` = issues completed since Monday in the time zone, `since`), `calendar`, `messages`.
6. **Deliver** (scheduled runs only), in `brief_language`, at most 12 lines:

```
✅ This week: <done> done, <in progress> in progress
👉 Start with: <KEY> <title> (<why, few words>)
To organize: <n> without date, <n> without owner, <n> without priority
<1 to 3 lines: deploys, PRs or messages worth a look, each with a link>
React: 👍 keep the plan · 📅 move <KEY> to <day> · ✋ skip today
Radar: <artifact URL>
```

   Send it to every channel enabled in `delivery`: the session's final message, a push notification, and the WhatsApp chat (find the WhatsApp tool with a tool search; if a send needs confirmation, confirm it because the user set this channel in the config).

## Reactions

When the user reacts to a brief (in the session or WhatsApp), apply exactly what the reaction says in Linear, then run step 2 for the affected project. Anything ambiguous: do nothing and mention it in the next brief.
