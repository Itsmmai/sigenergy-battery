# HomeScript voor Sigenergy Data Synchronisatie

Deze HomeScript synchroniseert data van je Sigenergy apparaat naar virtuele batterij-, PV- en load-apparaten. Dit is handig voor dashboards, flows en andere Homey functionaliteiten.

## Configuratie

Pas de volgende variabelen aan aan jouw setup:

```javascript
const SIGENERGY_DEVICE_ID = 'e85000d4-db83-400c-853f-eeac12f82134'; // jouw Sigenergy device
const BATTERY_DEVICE_NAME = 'Sigenergy Battery'; // virtuele batterij-tegel
const PV_DEVICE_NAME      = 'Sigenergy PV';      // virtuele PV-tegel (optioneel)
const LOAD_DEVICE_NAME    = 'Sigenergy Load';    // virtuele Load-tegel (optioneel)

const INVERT_BATT_SIGN = false;          // teken omkeren bij (ont)laden
const ENERGY_MODE = 'discharge';         // 'discharge' | 'charge' | 'throughput'
```

## HomeScript Code

```javascript
/***** CONFIG *****/
const SIGENERGY_DEVICE_ID = 'e85000d4-db83-400c-853f-eeac12f82134'; // jouw Sigenergy device
const BATTERY_DEVICE_NAME = 'Sigenergy Battery'; // virtuele batterij-tegel
const PV_DEVICE_NAME      = 'Sigenergy PV';      // virtuele PV-tegel (optioneel)
const LOAD_DEVICE_NAME    = 'Sigenergy Load';    // virtuele Load-tegel (optioneel)

const INVERT_BATT_SIGN = false;          // teken omkeren bij (ont)laden
const ENERGY_MODE = 'discharge';         // 'discharge' | 'charge' | 'throughput'
/******************/

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const getCap = (dev, cap) => dev?.capabilitiesObj?.[cap]?.value;
const round = (n) => Math.round(Number(n) || 0);

async function safeSet(device, capabilityId, value) {
  if (!device) return false;
  try {
    await Homey.devices.setCapabilityValue({
      deviceId: device.id, capabilityId, value
    });
    return true;
  } catch (e) {
    // Niet setable of ontbreekt: stilletjes overslaan
    return false;
  }
}

// 1) Bron + doel-devices ophalen
const sig = await Homey.devices.getDevice({ id: SIGENERGY_DEVICE_ID });
const all = Object.values(await Homey.devices.getDevices());

const batt = all.find(d => d.name === BATTERY_DEVICE_NAME)
  || all.find(d => d.driverUri === 'homey:app:com.sigenergy.battery' && d.driverId === 'sigenergy-battery');

const pv   = all.find(d => d.name === PV_DEVICE_NAME)
  || all.find(d => d.driverUri === 'homey:app:com.sigenergy.battery' && d.driverId === 'sigenergy-pv');

const load = all.find(d => d.name === LOAD_DEVICE_NAME)
  || all.find(d => d.driverUri === 'homey:app:com.sigenergy.battery' && d.driverId === 'sigenergy-load');

if (!batt) throw new Error('Battery device niet gevonden. Voeg "Sigenergy Battery" eerst toe.');

// ==== Battery ====
const socRaw = getCap(sig, 'measure_battery');
if (typeof socRaw === 'number' && isFinite(socRaw)) {
  await safeSet(batt, 'measure_battery', clamp(Math.round(socRaw), 0, 100));
}

let pBatt = getCap(sig, 'measure_power.batt_charge_discharge'); // W
if (!(typeof pBatt === 'number' && isFinite(pBatt))) {
  const pPv   = getCap(sig, 'measure_power.pv');
  const pLoad = getCap(sig, 'measure_power.consumed');
  const pGrid = getCap(sig, 'measure_power.grid');
  if ([pPv, pLoad, pGrid].every(v => typeof v === 'number' && isFinite(v))) pBatt = pPv - pLoad - pGrid;
}
if (typeof pBatt === 'number' && isFinite(pBatt)) {
  if (INVERT_BATT_SIGN) pBatt = -pBatt;
  await safeSet(batt, 'measure_power', round(pBatt));
}

const dailyCharge = Number(getCap(sig, 'meter_power.daily_charge')) || 0;
const dailyDis    = Number(getCap(sig, 'meter_power.daily_discharge')) || 0;
let energyKWh = 0;
if (ENERGY_MODE === 'discharge') energyKWh = dailyDis;
else if (ENERGY_MODE === 'charge') energyKWh = dailyCharge;
else energyKWh = dailyCharge + dailyDis;
await safeSet(batt, 'meter_power', Math.max(0, Number(energyKWh)));

// ==== PV (optioneel) ====
let pvPower = Number(getCap(sig, 'measure_power.pv')) || 0;
let pvKWh   = Number(getCap(sig, 'meter_power.daily_export')) || 0; // kWh van PV
if (pv) {
  await safeSet(pv, 'measure_power', round(pvPower));
  await safeSet(pv, 'meter_power', Math.max(0, pvKWh));
}

// ==== Load (optioneel) ====
let loadPower = Number(getCap(sig, 'measure_power.consumed')) || 0;
let loadKWh   = Number(getCap(sig, 'meter_power.daily_import')) || 0; // kWh verbruik
if (load) {
  await safeSet(load, 'measure_power', round(loadPower));
  await safeSet(load, 'meter_power', Math.max(0, loadKWh));
}

// ✅ Resultaat-logging
return `OK → Batt: SoC=${socRaw ?? 'n/a'}%, P=${(isFinite(pBatt)?round(pBatt):'n/a')}W, kWh(${ENERGY_MODE})=${energyKWh.toFixed(3)} | PV: ${round(pvPower)}W / ${pvKWh.toFixed(3)}kWh | Load: ${round(loadPower)}W / ${loadKWh.toFixed(3)}kWh`;
```

## Setup Instructies

1. **Voeg virtuele apparaten toe** via de app (Battery, PV, Load)
2. **Kopieer de HomeScript** naar je Homey
3. **Pas de configuratie aan** met jouw device ID en namen
4. **Plan de HomeScript** om regelmatig uit te voeren (bijv. elke minuut)

## Wat doet deze HomeScript?

- **Battery Device**: Synchroniseert SoC, vermogen en dagelijkse energie
- **PV Device**: Synchroniseert PV vermogen en dagelijkse export
- **Load Device**: Synchroniseert verbruik en dagelijkse import
- **Foutafhandeling**: Overslaat ontbrekende capabilities zonder errors
- **Flexibele configuratie**: Verschillende energie-modi en teken-inversie

## Configuratie Opties

- `ENERGY_MODE`: 
  - `'discharge'`: Alleen ontladen energie
  - `'charge'`: Alleen laden energie  
  - `'throughput'`: Totaal (laden + ontladen)
- `INVERT_BATT_SIGN`: Keert het teken van batterij vermogen om
