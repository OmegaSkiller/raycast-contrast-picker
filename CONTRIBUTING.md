# Contributing

This repository is the source of the Contrast Picker Raycast extension. It holds more than the Raycast Store accepts:
tests, the Tailwind palette generator and a license file. `scripts/sync-to-raycast.sh` copies only the Store files.

## Develop

```bash
npm install
npm run dev        # ray develop: builds the Swift eyedropper and loads the extension in Raycast
npm test           # unit tests for color math, WCAG, APCA, slots and fixes
npm run lint       # Raycast lint (manifest, icon, ESLint, Prettier)
npm run build      # production build
```

Requires macOS 12+ and Xcode (for the Swift eyedropper).

## Update the Tailwind palette

```bash
npm run generate:tailwind   # writes src/lib/tailwind-colors.json from the installed tailwindcss
```

## Update the pull request in `raycast/extensions`

```bash
scripts/sync-to-raycast.sh   # copies the Store files to your fork and pushes the PR branch
```

The script removes `test/`, `scripts/`, `vitest.config.mts`, `LICENSE`, `CONTRIBUTING.md`, the test tooling in
`package.json` and the Tailwind generator. The Store review rules do not allow these files in an extension.
