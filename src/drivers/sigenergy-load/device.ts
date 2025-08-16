import Homey from 'homey';
class SigenergyLoadDevice extends Homey.Device {
  private timer?: NodeJS.Timeout;
  async onInit() {
    this.log('Sigenergy Load init:', this.getName());
    if (this.getCapabilityValue('measure_power') == null) await this.setCapabilityValue('measure_power', 0);
    if (this.getCapabilityValue('meter_power') == null)   await this.setCapabilityValue('meter_power', 0);
    this.registerCapabilityListener('measure_power', async () => {});
    this.registerCapabilityListener('meter_power',   async () => {});
    await this.startPolling();
  }
  async onSettings() { await this.startPolling(); }
  async onUninit() { if (this.timer) clearInterval(this.timer); }
  private async startPolling() {
    if (this.timer) clearInterval(this.timer);
    const s = this.getSettings();
    const sourceId: string = s.source_device_id;
    const poll: number = Number(s.poll_interval) || 30;
    if (!sourceId) return; // geen bron → script mag zetten
    const run = async () => {
      try {
        const sig = await (this.homey as any).devices.getDevice({ id: sourceId });
        const get = (c: string) => sig?.capabilitiesObj?.[c]?.value;
        const pLoad = Number(get('measure_power.consumed')) || 0;
        await this.setCapabilityValue('measure_power', Math.round(pLoad));
        const dailyImport = Number(get('meter_power.daily_import')) || 0;
        await this.setCapabilityValue('meter_power', Math.max(0, dailyImport));
      } catch (e) { this.error('Load poll failed:', e); }
    };
    await run();
    this.timer = setInterval(run, Math.max(10, poll) * 1000);
  }
}
module.exports = SigenergyLoadDevice;
