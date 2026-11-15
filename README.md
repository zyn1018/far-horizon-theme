# Far Horizon

A film-trailer look for the Claude desktop app (Code tab). A dusty beige-to-peach sky over a curved
steel-blue planet horizon whose ripples drift like slow water. A family of hikers — a man, a woman
and a little girl, with a small terracotta pixel pet — walks across the horizon past a pixel campsite
with a crackling fire, each on their own stride, while pixel sparks breathe softly in the sky and a
small column of readings scrolls by, a line at a time.
Light and dark modes each get their own palette, and the interface colors follow the scene.

The look draws in the desktop and mobile apps; the terminal and editor extensions don't draw themes.
Animations stop when the system's "reduce motion" setting is on.

## Screenshots

The backdrop on its own, as it sits behind the app's frosted panels. Still frames; in the app
everything moves.

**Light** — a dusty peach sky over the steel-blue horizon.

![Far Horizon backdrop in light mode](screenshots/light.png)

**Dark** — the same scene at deep-blue dusk, with the rim glowing ember-orange.

![Far Horizon backdrop in dark mode](screenshots/dark.png)

**The family** — the pet, the woman, the girl and the man walk the horizon at their own pace, past
the tent and the crackling campfire. The ripples underfoot drift like slow water.

![Close-up of the family walking past the campsite](screenshots/family.png)

**The family log** — fixed readings for each walker, with a feed below that pushes up a line at a
time.

![Close-up of the family log readings in dark mode](screenshots/log.png)

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install theme-example --marketplace zyn1018/far-horizon-theme
```

Answer `y` to add the marketplace, then pick a scope (user scope applies it to every session).

From a shell:

```bash
claude plugin install theme-example --marketplace zyn1018/far-horizon-theme
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins,
Add marketplace with `zyn1018/far-horizon-theme`, then Add plugin.

This repository is private: it installs only for people who can read it on GitHub and whose machine
already holds a git credential for github.com (an SSH key, or `gh auth login` then `gh auth setup-git`).
