# ForgeFleet fleet monitoring

Responsive industrial fleet monitoring dashboard built with React, TypeScript and Vite.

## Use it without installing anything

The app can run in a browser through GitHub Pages. The GitHub Actions workflow builds
and publishes it in the cloud, so people using the app do not need Node.js, npm, or
administrator access on their computers.

For the repository owner, open **Settings → Pages**, choose **GitHub Actions** as the
source, then merge or push the `main` branch. After the workflow finishes, GitHub will
show the app link under **Settings → Pages**. It will look like:

`https://mmp2026-cloud.github.io/fleet-monitoring-1.8/`

The first deployment may take a few minutes. After that, users only open the link in
Chrome, Edge, or another modern browser.

## Run locally

```bash
npm install
npm run dev
```

Validation scripts:

```bash
npm run typecheck
npm test
npm run build
```

## Included workflows

- Seeded fleet overview with utilisation chart, attention queue and live status table.
- Equipment registration by light, heavy, or drilling & utility category.
- Unit detail view with generated QR label affordance and printable-label action.
- QR scan/read flow with camera affordance, SMR/odometer, notes and photo evidence upload.
- Forecast status logic and maintenance calendar for PMS, overdue and mechanical-plan work.
- Verification queue, approval action, historical readings and service records.
- LocalStorage persistence behind a small `DataProvider` interface ready for Microsoft Lists,
  Excel or OneDrive adapters.