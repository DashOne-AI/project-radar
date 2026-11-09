---
name: radar-update
description: Updates an installed Project Radar artifact to the plugin's current version without losing its link or data. Use when someone says "update the radar", "upgrade project radar", "actualiza la versión del radar", or after updating the plugin.
---

# Radar update

## Steps

1. Find the radar: the URL the user gives, or the user's artifacts titled "... Project Radar". If there are several, ask which one, or offer all.
2. Read its `config/app`. Compare `installed_version` with this plugin's version (`.claude-plugin/plugin.json`). If equal, say so and stop unless the user asks to force it.
3. Read `CHANGELOG.md` entries newer than `installed_version`. Show them in a few lines, including any step marked **Migration**.
4. Republish `artifact/index.html` from this plugin to the same artifact URL. Keep the stored capabilities unless the changelog adds a connector tool; then pass the full set from `artifact/capabilities.json`, trimmed the same way `radar-setup` does.
5. Run each **Migration** step from the changelog in order (database field renames, new config keys with defaults).
6. Update `config/app.installed_version` and `installed_at`.
7. Reply with one line: from version, to version, and what changed for the user.

## Rules

- Never delete database collections. Migrations only add or rename fields.
- If the user changed the page by hand (the live HTML differs from the previous plugin version in more than the config), show the diff summary and ask before overwriting.
