import Homey from 'homey';

class SigenergyBatteryApp extends Homey.App {
  async onInit() {
    this.log('Sigenergy Battery app gestart');
  }
}

module.exports = SigenergyBatteryApp;
