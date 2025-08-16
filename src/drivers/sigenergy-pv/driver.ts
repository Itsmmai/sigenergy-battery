import Homey from 'homey';
class SigenergyPvDriver extends Homey.Driver {
  async onInit() { this.log('Sigenergy PV driver gestart'); }
  async onPairListDevices() { return [{ name: 'Sigenergy PV', data: { id: 'sigenergy-pv-1' } }]; }
}
module.exports = SigenergyPvDriver;
