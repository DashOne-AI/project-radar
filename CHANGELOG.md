# Changelog

Format: one section per version, newest first. A **Migration** line lists database or config steps `radar-update` must run.

## 1.0.0

First public version.

- Dashboard artifact driven by `config/app` in the artifact database: brand, Linear team and workspace, people and colors, calendars, inbox tab, Ask and Code templates, brief task id.
- Skills: `radar-setup`, `radar-sync`, `radar-brief`, `radar-update`.
- Plan board: by stage or by week, status toggles (Backlog, Done and Canceled off by default), multi-select project and user filters, drag and drop to Linear.
- Code button copies its context to the clipboard before opening Claude Code.
- **Migration** (only for radars created before the plugin): write `config/app` from your config file, including `brief_trigger`.
