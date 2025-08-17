# Sigenergy Battery v2.0 - Directe API Integratie

## 🚀 Wat is nieuw in v2.0?

**Sigenergy Battery v2.0** is een complete herziening van de app die direct communiceert met je Sigenergy systeem via de lokale API. Geen HomeyScript meer nodig!

### ✨ Nieuwe Features

- **🔌 Directe API Communicatie** - Leest data direct van je Sigenergy device
- **📊 Automatische Synchronisatie** - Real-time data updates elke 30 seconden
- **☁️ Ingebouwde PVOutput** - Automatische uploads naar PVOutput.org
- **⚙️ Flexibele Configuratie** - Ondersteunt verschillende API endpoints
- **🛡️ Robuuste Error Handling** - Werkt ook als API niet beschikbaar is

## 📋 Installatie

### 1. App Installeren
```bash
# Clone de repository
git clone https://github.com/itsmmai/sigenergy-battery.git
cd sigenergy-battery

# Installeer in Homey (wanneer je Homey online is)
homey app run
```

### 2. Device Toevoegen
1. **Ga naar Apps** in je Homey
2. **Zoek "Sigenergy Battery"**
3. **Klik op "Sigenergy Battery v2.0"**
4. **Volg de setup wizard**

### 3. Configuratie
Configureer de volgende instellingen:

| Instelling | Beschrijving | Voorbeeld |
|------------|--------------|-----------|
| **Sigenergy IP** | IP adres van je Sigenergy device | `192.168.1.100` |
| **API Port** | Poort voor de API (meestal 8080) | `8080` |
| **API Key** | Optionele API key voor authenticatie | `your-api-key` |
| **Poll Interval** | Hoe vaak data ophalen (seconden) | `30` |

### 4. PVOutput (Optioneel)
Voor automatische uploads naar PVOutput.org:

| Instelling | Beschrijving |
|------------|--------------|
| **Enable PVOutput** | Schakel PVOutput uploads in |
| **PVOutput API Key** | Je PVOutput API key |
| **PVOutput System ID** | Je PVOutput System ID |

## 🔧 API Endpoints

De app probeert automatisch verschillende API endpoints:

1. `/api/v1/status`
2. `/api/status`
3. `/status`
4. `/api/v1/data`
5. `/api/data`
6. `/data`

## 📊 Data Mapping

De app verwacht de volgende data structuur van je Sigenergy API:

```json
{
  "battery": {
    "soc": 75,
    "power": -500,
    "voltage": 48.5,
    "current": -10.3,
    "temperature": 25
  },
  "pv": {
    "power": 2500,
    "voltage": 380,
    "current": 6.6
  },
  "load": {
    "power": 1800,
    "voltage": 230,
    "current": 7.8
  },
  "grid": {
    "power": -200,
    "voltage": 230,
    "current": -0.9
  },
  "energy": {
    "daily_charge": 12.5,
    "daily_discharge": 8.2,
    "daily_pv": 18.7,
    "daily_load": 15.3,
    "daily_grid_import": 2.1,
    "daily_grid_export": 0.5
  }
}
```

## 🔍 Troubleshooting

### API niet bereikbaar?
- **Controleer IP adres** - Zorg dat het IP adres correct is
- **Controleer poort** - Meestal 8080, maar kan verschillen
- **Firewall** - Zorg dat poort open is
- **Netwerk** - Zorg dat Homey en Sigenergy opzelfde netwerk zijn

### Geen data?
- **Logs bekijken** - Check Homey logs voor foutmeldingen
- **API testen** - Test API endpoint handmatig: `http://[IP]:[PORT]/status`
- **Mock data** - App gebruikt mock data als API niet werkt

### PVOutput uploads falen?
- **API key** - Controleer of API key correct is
- **System ID** - Controleer of System ID correct is
- **Rate limiting** - Uploads zijn beperkt tot elke 5 minuten

## 🧪 Testing

De app heeft ingebouwde mock data voor testing:

```typescript
// Mock data wordt gebruikt als API niet beschikbaar is
{
  battery: { soc: 75, power: -500, voltage: 48.5, current: -10.3, temperature: 25 },
  pv: { power: 2500, voltage: 380, current: 6.6 },
  load: { power: 1800, voltage: 230, current: 7.8 },
  grid: { power: -200, voltage: 230, current: -0.9 },
  energy: { daily_charge: 12.5, daily_discharge: 8.2, daily_pv: 18.7, daily_load: 15.3, daily_grid_import: 2.1, daily_grid_export: 0.5 }
}
```

## 🔄 Migratie van v1.x

### Van v1.x naar v2.0:
1. **Backup maken** van huidige configuratie
2. **v2.0 installeren** naast v1.x
3. **Nieuwe device toevoegen** met v2.0 driver
4. **Configureren** met Sigenergy IP en API instellingen
5. **Testen** of data correct wordt opgehaald
6. **Oude device verwijderen** (optioneel)

### Belangrijke verschillen:
- **v1.x**: Leest van bestaand Sigenergy device via Homey
- **v2.0**: Communiceert direct met Sigenergy API
- **v1.x**: Vereist HomeyScript voor PVOutput
- **v2.0**: Ingebouwde PVOutput integratie

## 📈 Roadmap

### v2.1 - Verbeteringen
- [ ] **Meer API endpoints** ondersteunen
- [ ] **SSL/TLS** ondersteuning
- [ ] **OAuth2** authenticatie
- [ ] **WebSocket** real-time updates

### v2.2 - Uitbreidingen
- [ ] **Flow cards** voor automatisering
- [ ] **Notificaties** voor lage SoC
- [ ] **Dashboard widgets**
- [ ] **Export naar andere platforms**

## 🤝 Bijdragen

Wil je bijdragen aan de ontwikkeling?

1. **Fork** de repository
2. **Branch** maken voor je feature
3. **Commit** je wijzigingen
4. **Push** naar de branch
5. **Pull Request** maken

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/itsmmai/sigenergy-battery/issues)
- **Email**: ab@helversteijn-smit.nl
- **Documentatie**: [Wiki](https://github.com/itsmmai/sigenergy-battery/wiki)

---

**Sigenergy Battery v2.0** - Directe API integratie voor je Sigenergy systeem! 🚀
