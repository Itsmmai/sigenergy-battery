# Contributing

Bedankt voor je interesse! Houd het graag compact en consistent.

## Werkwijze
1. Open eerst een Issue (bug/feature) met duidelijke context.
2. Maak een branch vanaf `main`:
   - `feat/...` voor features
   - `fix/...`  voor bugfixes
   - `chore/...` voor onderhoud
3. Schrijf commits als **Conventional Commits**:
   - `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `refactor: ...`
4. Voeg tests/logs/screenshot(s) toe waar zinvol.
5. Maak een Pull Request en koppel ‘m aan het Issue.

## Project lokaal draaien
```bash
npm i
homey app validate
homey app install

## Code stijl
- TypeScript strikt maar pragmatisch.
- Geen side effects in `onInit` behalve initialisatie & timers.
- Vermijd magic strings → gebruik constanten of helpers.
- Log bewust (`this.log` bij init, `this.error` bij fouten).

## Versiebeheer & Releases
- Werk in feature branches, PR naar `main`.
- Bump `version` in `app.json` én `.homeycompose/app.json`.
- Tag releases als `vX.Y.Z`.

## CI
GitHub Actions draait automatisch `homey app validate` op elke push/PR.

## Licentie
Bijdragen vallen onder GPLv3 van dit project.
