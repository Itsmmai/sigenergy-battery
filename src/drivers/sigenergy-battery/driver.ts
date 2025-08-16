import Homey from 'homey';

class SigenergyBatteryDriver extends Homey.Driver {
  async onInit() {
    this.log('Sigenergy Battery driver gestart');
  }

  // Toon één virtueel apparaat bij het toevoegen
  async onPairListDevices() {
    return [
      {
        name: 'Sigenergy Battery',
        data: { id: 'sigenergy-battery-1' }
      }
    ];
  }
}

module.exports = SigenergyBatteryDriver;
