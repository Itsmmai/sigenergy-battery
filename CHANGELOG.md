# Changelog

Alle belangrijke wijzigingen aan dit project worden hier gedocumenteerd.

## [1.3.0] - 2025-01-27
### Fixed
- **Kritieke fix**: Sigenergy Battery driver navigation probleem opgelost
- Ontbrekende `navigation` configuratie toegevoegd aan Battery driver pair array
- "Ga door" knop werkt nu correct na het selecteren van de Battery driver
- Apparaat kan nu succesvol worden toegevoegd in Homey zonder vastlopen

### Changed
- Versie geüpgraded naar 1.3.0 als stabiele release
- Git tag v1.3.0 aangemaakt voor deze werkende versie

## [1.2.3] - 2025-08-16
### Fixed
- Sigenergy Battery pairing flow gerepareerd
- Ontbrekende "add_devices" stap toegevoegd aan Battery driver configuratie
- Nu kun je door na het selecteren van de Battery driver

## [1.2.2] - 2025-08-16
### Fixed
- TypeScript compilatie fouten opgelost
- Homey namespace correct gebruikt als type casting naar any
- App compileert nu succesvol met Homey CLI

## [1.2.1] - 2025-08-16
### Fixed
- TypeScript warnings in sigenergy-load en sigenergy-pv drivers weggewerkt
- `any` types vervangen door correcte `Homey` types voor betere type safety
- Dependencies gecontroleerd en gevalideerd
- Linting zonder waarschuwingen

## [1.2.0] - 2025-08-16
### Added
- Nieuwe driver: **Sigenergy PV**
- Nieuwe driver: **Sigenergy Load**
- Battery driver uitgebreid met:
  - Logging van vermogen en energie
  - Nieuwe capability: *stored energy (kWh)*

### Changed
- CI workflow gehard voor release.

## [1.1.0] - 2025-08-15
### Added
- Basis Homey app voor Sigenergy Battery.
- Integratie met Homey Energy (SoC, vermogen, dagverbruik).
- HomeyScript integratie voor PVOutput.

## [1.0.0] - 2025-08-14
### Initial Release
- Eerste werkende driver voor **Sigenergy Battery**.
- Basis capabilities (SoC, vermogen, energie).
