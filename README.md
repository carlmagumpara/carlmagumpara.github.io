# From Vercel to GitHub Pages — setup guide

How this portfolio is deployed: the **static site** lives on GitHub Pages, while the
**live APIs and WebSocket** stay on Vercel. GitHub Pages has no server runtime, so
the browser talks to the Vercel deployment for anything dynamic.

```
Visitor on carlmagumpara.github.io
        │
        ├─ HTML / CSS / JS / images ──► GitHub Pages (static, built by Actions)
        │
        ├─ /api/github, /api/spotify ─► Vercel functions (cross-origin fetch)
        │
        └─ WebSocket /api/cursor ─────► Vercel function (live cursors / presence)
```

- GitHub Pages: <https://carlmagumpara.github.io/>
- Vercel (API + WebSocket origin): `https://portfolio-v2-iota-jade.vercel.app`

---

## 1. Keep the Vercel deployment running

Do **not** delete the Vercel project. Pages serves only static files; these
endpoints must stay deployed on Vercel:

| Endpoint | File | Purpose |
| --- | --- | --- |
| `/api/github` | `api/github.mjs` | Live GitHub profile / follower count |
| `/api/spotify` | `api/spotify.mjs` | Live "last played" track |
| `/api/cursor` | `api/cursor.mjs` | WebSocket hub for live cursors and visitor count |

`vercel.json` still governs this deployment:

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client"
}
```

After any change to `lib/api.ts`, `api/*.mjs`, or the Vercel project URL, confirm
the functions still respond (e.g. open `https://<your-project>.vercel.app/api/github`).

> WebSocket note: `api/cursor.mjs` needs Vercel Fluid compute. Projects created
> after 2025-04-23 use it by default; older projects may need it enabled.

---

## 2. Prepare the repo for a user site

A **user site** must be named `<username>.github.io` and is served from `/`.

1. Keep the repository name `carlmagumpara.github.io`.
2. Keep Vite's base path at the domain root in `vite.config.ts`:

   ```ts
   export default defineConfig({
     base: '/', // user site → no /repo-name/ prefix
     // ...
   })
   ```

   If you ever switch to a *project* site (`github.io/<repo>/`), change `base`
   to `/<repo>/` and update the hostname checks in `lib/api.ts` accordingly.
3. Keep `public/.nojekyll` (an empty file). It stops Jekyll from stripping the
   `assets/` and `.vite/` folders that Vike emits, and it is copied into
   `dist/client` during the build.

---

## 3. Set the Pages source to GitHub Actions

In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

If it is still on **Deploy from a branch**, Pages will try to serve the source
tree (which has no `index.html` at the root) and the site will 404. Switch it to
the workflow source. On first-time setup this can also be done with the API:

```bash
curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/carlmagumpara/carlmagumpara.github.io/pages \
  -d '{"build_type":"workflow"}'
```

---

## 4. The deploy workflow

The workflow already exists at `.github/workflows/deploy.yml`. It runs on every
push to `main` and on manual dispatch:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 22, npm cache)
3. `npm ci`
4. `npm run build`
   - `prebuild` refreshes `data/github.json` and `data/last-played.json`
   - `postbuild` runs `scripts/emit-static-api.mjs`
5. `actions/upload-pages-artifact@v3` uploads `dist/client`
6. `actions/deploy-pages@v4` publishes it

Key settings in that file:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false # a slow build can't overwrite a newer one

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
```

If you are adding this from scratch, create that file at
`.github/workflows/deploy.yml` with the content above and commit it to `main`.

---

## 5. Add Actions secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Required? | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Auto | Provided by Actions; raises the GitHub API rate limit (no need to add manually) |
| `SPOTIFY_CLIENT_ID` | Optional | Build-time "last played" refresh |
| `SPOTIFY_CLIENT_SECRET` | Optional | Build-time "last played" refresh |
| `SPOTIFY_REFRESH_TOKEN` | Optional | Build-time "last played" refresh |

The workflow passes these to `npm run build` as environment variables. Without
Spotify secrets the build keeps the committed `data/last-played.json` fallback, so
builds never fail. If the refresh token rotates, update the repository secret.

---

## 6. Handle the static host's missing runtime

GitHub Pages cannot run `api/*.mjs`, so two things bridge the gap:

**a) Build-time JSON snapshots.** `scripts/emit-static-api.mjs` (the `postbuild`
script) writes:

```
dist/client/api/spotify
dist/client/api/github
```

These are snapshots of `data/last-played.json` and `data/github.json`. A direct
visit to `carlmagumpara.github.io/api/github` therefore returns 200 instead of
404 — useful as a fallback and for local inspection.

**b) Runtime calls go to Vercel.** `lib/api.ts` rewrites API and WebSocket URLs
when the page is hosted on `*.github.io`:

```ts
export function apiUrl(path) {
  if (window.location.hostname.endsWith('.github.io')) {
    return `https://portfolio-v2-iota-jade.vercel.app${path}`
  }
  return path // same-origin on Vercel / localhost
}

export function cursorUrl() {
  // ... .github.io → wss://portfolio-v2-iota-jade.vercel.app/api/cursor
}
```

The Vercel handlers send `Access-Control-Allow-Origin: *`, so these cross-origin
browser fetches succeed. If you redeploy Vercel under a different project URL,
update `VERCEL_API_ORIGIN` in `lib/api.ts`. For a custom WebSocket host, set the
build-time env var `VITE_CURSOR_WS_URL` (e.g. `wss://example.com/api/cursor`),
which takes precedence over the default.

---

## 7. Deploy and verify

```bash
npm install
npm run build        # verify the static build locally
git push origin main # triggers the Pages workflow
```

Then check:

1. **Actions** tab → the "Deploy to GitHub Pages" run is green (both `build` and
   `deploy` jobs). The `deploy` step prints the deployed URL.
2. **Settings → Pages** shows the site URL `https://carlmagumpara.github.io/`.
3. Browser smoke test:

   | URL | Expected |
   | --- | --- |
   | `https://carlmagumpara.github.io/` | Prerendered homepage |
   | `/assets/...`, `/avatar.jpg` | 200 (CSS, JS, images load) |
   | `/api/github` | 200 JSON snapshot |
   | `/api/spotify` | 200 JSON snapshot |
   | Vercel `/api/github`, `/api/spotify`, `/api/cursor` | 200 / live socket |

If dev tools show API calls going to `portfolio-v2-iota-jade.vercel.app`, the
runtime routing is working as intended.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Site 404s right after enabling Pages | Source is still "Deploy from a branch" | Set Source to **GitHub Actions** and re-run the workflow |
| Blank page / missing styles | `base` is wrong, or `.nojekyll` is missing | Keep `base: '/'` for a user site; keep `public/.nojekyll` |
| CSS/JS 404 with a `/<repo>/` prefix | Configured as a project site | Rename repo to `<username>.github.io` or set `base: '/<repo>/'` |
| Build fails in Actions but works locally | Missing secret / Node version mismatch | Check Actions secrets and the `node-version: 22` setting |
| Follower count or track never updates | Static snapshot is stale, or Vercel function is down | Check the Vercel `/api/*` URLs and that CORS headers are present |
| Live cursors don't connect | WebSocket origin unreachable or Fluid compute off | Verify `wss://.../api/cursor`, check Vercel Fluid compute, or set `VITE_CURSOR_WS_URL` |
| Old deployment still showing | Workflow run still in progress | `concurrency` serializes deploys — wait for the run to finish |

---

## 9. File map

| File | Role in this setup |
| --- | --- |
| `.github/workflows/deploy.yml` | Build and deploy the static site to Pages |
| `vercel.json` | Vercel build/output config for the API functions |
| `vite.config.ts` | `base: '/'`, dev-server mirrors of the API, WebSocket hub |
| `public/.nojekyll` | Prevents Jekyll from stripping generated folders |
| `scripts/emit-static-api.mjs` | Writes static `/api/*` JSON snapshots at build time |
| `lib/api.ts` | Routes `*.github.io` API/WS calls to Vercel |
| `api/github.mjs`, `api/spotify.mjs`, `api/cursor.mjs` | Vercel serverless functions / socket |
| `data/github.json`, `data/last-played.json` | Build-time data and fallback |

Related notes: `_docs/GITHUB_PAGES_SETUP.md` (implementation notes),
`_docs/GITHUB_SETUP.md`, `_docs/SPOTIFY_SETUP.md`, `_docs/cursor-tracking.md`.

