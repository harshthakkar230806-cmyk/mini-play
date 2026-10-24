# Mini Code Playground

A 3D, glass-style code playground: HTML / CSS / JS editors, live preview, ZIP download and shareable links.
Static site, no build step, no database.

## Files
- `index.html` – page structure
- `style.css` – premium 3D theme (responsive: laptop + phone)
- `app.js` – editors, live preview, console, share link, ZIP export
- `scene.js` – Three.js 3D background
- `zip.js` – dependency-free ZIP builder
- `vercel.json` – static hosting config

## Deploy on Vercel
**Option A: CLI (fastest)**
1. `npm i -g vercel`
2. `cd mini-code-playground`
3. `vercel --prod` (Framework: **Other**, no build command, output directory: `.`)

**Option B: GitHub**
1. Push this folder to a GitHub repo.
2. In Vercel: Add New > Project > import the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Deploy.

## Run locally
Open `index.html` directly, or run `npx serve .`

## Notes
- Three.js and CodeMirror load from cdnjs, so visitors need internet access. If a CDN is blocked, the app falls back to plain textareas / a CSS background.
- The preview runs in a sandboxed iframe (no access to the parent page or its storage), so shared links are safe to open.
- Share links store the whole project inside the URL hash (compressed), so nothing is saved on a server.
