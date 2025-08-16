import Homey from 'homey';

class SigenergyBatteryDevice extends Homey.Device {
  async onInit() {
    this.log('Sigenergy Battery device init:', this.getName());

    // initial values
    if (this.getCapabilityValue('measure_battery') == null)
      await this.setCapabilityValue('measure_battery', 0);
    if (this.getCapabilityValue('measure_power') == null)
      await this.setCapabilityValue('measure_power', 0);
    if (this.hasCapability('meter_power') && this.getCapabilityValue('meter_power') == null)
      await this.setCapabilityValue('meter_power', 0);

    // REQUIRED: listeners for setable capabilities (even if we ignore user-set)
    this.registerCapabilityListener('measure_battery', async (value) => {
      // no-op: allow writes from UI/flows/HomeyScript
      return;
    });
    this.registerCapabilityListener('measure_power', async (value) => {
      return;
    });
    this.registerCapabilityListener('meter_power', async (value) => {
      return;
    });
  }
}

module.exports = SigenergyBatteryDevice;
