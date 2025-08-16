# Changelog — Sigenergy Battery for Homey

Alle belangrijke wijzigingen in dit project worden hier bijgehouden.  
Het formaat is geïnspireerd op [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) en volgt [SemVer](https://semver.org/).

---

## [Unreleased]
- Roadmap: voorbereiden op v2.0.0 (PV + Load + PVOutput integratie).
- Documentatie uitgebreid (CONTRIBUTING, ROADMAP, templates).
- CI met linting & `homey app validate`.

---

## [1.1.0] — 2025-08-16
### Added
- GitHub repo + workflows voor automatische validatie.
- ESLint v9 flat config met TypeScript rules.
- CONTRIBUTING.md, Issue & PR templates.
- ROADMAP.md met v2/v3/v4 plannen.
  
### Changed
- Opschoning projectstructuur, consistent gebruik van `.homeycompose`.
- Device listeners opgeruimd → lint clean (geen unused vars).

---

## [1.0.0] — 2025-08-15
### Added
- Eerste werkende versie van **Sigenergy Battery driver**.
- Homey Energy integratie met SoC (%), vermogen (W), en kWh.
- Basis icons (small.png, large.png).

