import Homey from 'homey';
class SigenergyLoadDriver extends Homey.Driver {
  async onInit() { this.log('Sigenergy Load driver gestart'); }
  async onPairListDevices() { return [{ name: 'Sigenergy Load', data: { id: 'sigenergy-load-1' } }]; }
}
module.exports = SigenergyLoadDriver;
