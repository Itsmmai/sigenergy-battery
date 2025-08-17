import Homey from 'homey';

class SigenergyBatteryV2Driver extends Homey.Driver {
  async onInit() {
    this.log('Sigenergy Battery v2.0 driver gestart');
  }

  // Toon één virtueel apparaat bij het toevoegen
  async onPairListDevices() {
    return [
      {
        name: 'Sigenergy Battery v2.0',
        data: { id: 'sigenergy-battery-v2-1' }
      }
    ];
  }
}

module.exports = SigenergyBatteryV2Driver;
