# Publishing LibGale

Two separate channels, both manual.

## Web build (surge.sh)

Live at **https://libgale.surge.sh**

```bash
npm run build
surge dist libgale.surge.sh
```

`surge` is already logged in on this machine. The first deploy claims the
subdomain for the account; later deploys just replace the files. `surge`
writes `dist/CNAME`, which is ignored by git.

## GitHub

Public repo: **https://github.com/GhoSci-Tech/LibGale**

The GitHub repo is a **snapshot** of this folder, not a mirror of the outer
course workspace. It is rebuilt on purpose so only the game is published:

1. Only tracked files from this folder are copied out.
2. Raw asset archives are excluded: `*.zip` and `tools/vendor/`
   (the Metroidvania Library pack must not be redistributed as a stand-alone
   pack; only the processed art the game loads is committed).
3. `node_modules/`, `dist/`, `screenshots/` are excluded by `.gitignore`.
4. The snapshot is committed as its own repo and pushed to `main`.

When the game changes, repeat the export. The repo intentionally keeps a short
history rather than the full course-workspace history.
