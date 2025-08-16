# Roadmap — Sigenergy Battery for Homey

## Visie
Eén Homey-app die de Sigenergy-accu helder toont in **Homey Energy**:
- SoC (%), (ont)laadvermogen (W), en energie (kWh).
- Robuust, simpel te installeren, en netjes gevalideerd in CI.
- Optioneel: data uploaden naar **PVOutput** (v2–v12).

---

## Mijlpalen

### ✅ v1.0.0 (gereleased)
- Battery-tegel met SoC, vermogen en kWh (via script/flows).
- Basisproject, icons, validatie OK.

### 🚧 v1.1.0 (current / main)
- Repo-opschoning, linting (ESLint v9 flat config).
- CI: `homey app validate` bij elke push/PR.
- Documentatie: README, CHANGELOG, CONTRIBUTING, templates.

### 🔜 v2.0.0 — PV & Huisverbruik + PVOutput integratie
Doel: Zorgen dat batterijwaarden in Homey perfect matchen én PVOutput automatisch gevuld wordt.

- [ ] Script: mapping afronden (exacte Sigenergy-capabilities gebruiken).
- [ ] `meter_power`: keuze uit *discharge* / *charge* / *throughput* (dagwaarden).
- [ ] Controle: grafieken Homey vs Sigenergy (dag + uur) in sync.
- [ ] PVOutput: standaard v2, v4, v6 vullen (PV, Load, Voltage).
- [ ] PVOutput: uitbreidbaar met Sigenergy-data op v7–v12 (SoC, temp, humidity, daily charge/discharge etc).
- [ ] Configuratie in app-settings: API-key, System-ID en keuze welke variabelen door te sturen.
- [ ] Optioneel: extra tegel “Stored energy (kWh)” = SoC × capaciteit.

**Acceptatiecriteria**
- Dagtotalen batterij in Homey ≤ 5% afwijking t.o.v. Sigenergy.
- Power-teken klopt (laden +, ontladen −).
- PVOutput uploads consistent met minimaal v2/v4/v6.

### 🎯 v3.0.0 — Directe uitlezing + ingebouwde PVOutput uploader
Doel: App leest zelf uit Sigenergy-device (device ID in settings), zonder los script.

- [ ] Device settings: `source_device_id`, `poll_interval`, `invert_sign`, `energy_mode`.
- [ ] Poller in `device.ts` (30s): zet SoC, power en kWh.
- [ ] Fallback-balans: PV − Load − Grid als `batt_charge_discharge` ontbreekt.
- [ ] Robustheid: try/catch + backoff logs.
- [ ] PVOutput uploader ingebouwd:
  - Mapping Sigenergy-capabilities → PVOutput v2–v12 instelbaar via UI.
  - Logging van laatste uploadstatus in app settings.
- [ ] CI: extra type/lint checks.

**Acceptatiecriteria**
- Geen HomeyScript meer nodig voor PVOutput.
- Waarden binnen 1 polling-interval actueel.
- PVOutput logging zichtbaar in UI.

### 🧰 v3.1.0 — UX & flows
- [ ] Flow-kaarten: “Als SoC < x%”, “Als (ont)laadvermogen > x W”.
- [ ] Notificaties: lage SoC / hoge belasting.
- [ ] Instellingen UI: help-tekst + validatie (ID check).

### 🌞 v4.0.0 — (Optioneel) PV & Load drivers in dezelfde app
Doel: Alles in één app (als je Sigenergy-tegel wilt vervangen).

- [ ] Driver “Sigenergy PV” (measure_power, meter_power).
- [ ] Driver “Sigenergy Load” (measure_power, meter_power).
- [ ] Energie-metadata t.b.v. Homey Energy.
- [ ] Migratiegids om dubbele telling te voorkomen.

---

## Niet-doelen (voor nu)
- Cloud/extern API-verkeer buiten Homey om.
- Geavanceerde forecast of optimalisatie.

## Technische schuld / ideeën
- [ ] ESLint rule voor underscore-params (ingesteld).
- [ ] Unit-testbare helpers (capability mapping).
- [ ] Error telemetry (optioneel logniveau).

## QA-checklist per release
- [ ] `homey app validate` green.
- [ ] Lint clean.
- [ ] Install + pair end-to-end.
- [ ] Grafieken: SoC/Power/kWh matchen Sigenergy (spot-check).
- [ ] PVOutput uploads consistent (v2/v4/v6, optioneel v7–v12).
- [ ] CHANGELOG + tag aangemaakt.

