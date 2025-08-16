import { Device } from 'homey';

class SigenergyBatteryDevice extends Device {

  async onInit() {
    this.log('Sigenergy Battery Device initialized:', this.getName());

    // Capability listeners (nu met _value om ESLint tevreden te houden)
    this.registerCapabilityListener('measure_battery', async (_value) => {
      // Alleen uitlezen, niet setten
      return null;
    });

    this.registerCapabilityListener('measure_power', async (_value) => {
      // Alleen uitlezen, niet setten
      return null;
    });

    this.registerCapabilityListener('meter_power', async (_value) => {
      // Alleen uitlezen, niet setten
      return null;
    });
  }
}

module.exports = SigenergyBatteryDevice;

