# Sigenergy Battery v2.1.0 - Modbus TCP Integratie

## 🚀 Wat is nieuw in v2.1.0?

**Sigenergy Battery v2.1.0** is een uitbreiding van v2.0 met **Modbus TCP integratie** voor directe communicatie met je Sigenergy systeem. Geen HomeyScript meer nodig!

### ✨ Nieuwe Features

- **🔌 Modbus TCP Communicatie** - Leest data direct via Modbus protocol
- **📊 Automatische Synchronisatie** - Real-time data updates elke 30 seconden
- **☁️ Ingebouwde PVOutput** - Automatische uploads naar PVOutput.org
- **⚙️ Flexibele Configuratie** - Ondersteunt Modbus TCP en HTTP API fallback
- **🛡️ Robuuste Error Handling** - Werkt ook als Modbus niet beschikbaar is

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
3. **Klik op "Sigenergy Battery v2.1.0"**
4. **Volg de setup wizard**

### 3. Configuratie
Configureer de volgende instellingen:

| Instelling | Beschrijving | Voorbeeld |
|------------|--------------|-----------|
| **Sigenergy IP** | IP adres van je Sigenergy device | `192.168.0.86` |
| **Modbus TCP Port** | Poort voor Modbus TCP (meestal 502) | `502` |
| **API Key** | Optionele API key voor authenticatie | `your-api-key` |
| **Poll Interval** | Hoe vaak data ophalen (seconden) | `30` |

### 4. PVOutput (Optioneel)
Voor automatische uploads naar PVOutput.org:

| Instelling | Beschrijving |
|------------|--------------|
| **Enable PVOutput** | Schakel PVOutput uploads in |
| **PVOutput API Key** | Je PVOutput API key |
| **PVOutput System ID** | Je PVOutput System ID |

## 🔧 Communicatie Protocol

De app gebruikt **Modbus TCP** als primaire communicatiemethode:

1. **Modbus TCP** (poort 502) - Primaire methode
2. **HTTP API** (poort 8080) - Fallback methode

### Modbus Registers
De app leest data uit specifieke Modbus registers:

- **Battery SoC**: Register 0x0001
- **Battery Power**: Register 0x0002  
- **Battery Voltage**: Register 0x0003
- **Battery Current**: Register 0x0004
- **Battery Temperature**: Register 0x0005
- **PV Power**: Register 0x0010
- **Load Power**: Register 0x0020
- **Grid Power**: Register 0x0030
- **Daily Energy**: Registers 0x0100-0x0105

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

### Modbus TCP niet bereikbaar?
- **Controleer IP adres** - Zorg dat het IP adres correct is (bijv. 192.168.0.86)
- **Controleer poort** - Meestal 502 voor Modbus TCP
- **Firewall** - Zorg dat poort 502 open is
- **Netwerk** - Zorg dat Homey en Sigenergy opzelfde netwerk zijn
- **Modbus documentatie** - Check de [Sigenergy Modbus Protocol](https://github.com/Si-GCG/sigenergy_projects/blob/main/Modbus.Protocol.EN.-.SIGEN.pdf)

### Geen data?
- **Logs bekijken** - Check Homey logs voor foutmeldingen
- **Modbus testen** - Test Modbus verbinding handmatig: `telnet [IP] 502`
- **Mock data** - App gebruikt mock data als Modbus niet werkt
- **Register mapping** - Controleer of de Modbus registers correct zijn

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

### Van v1.x naar v2.1.0:
1. **Backup maken** van huidige configuratie
2. **v2.1.0 installeren** naast v1.x
3. **Nieuwe device toevoegen** met v2.1.0 driver
4. **Configureren** met Sigenergy IP en API instellingen
5. **Testen** of data correct wordt opgehaald
6. **Oude device verwijderen** (optioneel)

### Belangrijke verschillen:
- **v1.x**: Leest van bestaand Sigenergy device via Homey
- **v2.1.0**: Communiceert direct via Modbus TCP protocol
- **v1.x**: Vereist HomeyScript voor PVOutput
- **v2.1.0**: Ingebouwde PVOutput integratie

## 📈 Roadmap

### v2.2 - Verbeteringen
- [ ] **Meer API endpoints** ondersteunen
- [ ] **SSL/TLS** ondersteuning
- [ ] **OAuth2** authenticatie
- [ ] **WebSocket** real-time updates

### v2.3 - Uitbreidingen
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
