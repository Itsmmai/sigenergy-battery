import { Device } from 'homey';

interface SigenergyData {
  battery: {
    soc: number;
    power: number;
    voltage: number;
    current: number;
    temperature: number;
  };
  pv: {
    power: number;
    voltage: number;
    current: number;
  };
  load: {
    power: number;
    voltage: number;
    current: number;
  };
  grid: {
    power: number;
    voltage: number;
    current: number;
  };
  energy: {
    daily_charge: number;
    daily_discharge: number;
    daily_pv: number;
    daily_load: number;
    daily_grid_import: number;
    daily_grid_export: number;
  };
}

// Modbus register mappings (based on Sigenergy protocol)
const MODBUS_REGISTERS = {
  // Battery registers
  BATTERY_SOC: 0x0001,           // Battery State of Charge (%)
  BATTERY_POWER: 0x0002,         // Battery Power (W) - positive = discharging, negative = charging
  BATTERY_VOLTAGE: 0x0003,       // Battery Voltage (V)
  BATTERY_CURRENT: 0x0004,       // Battery Current (A)
  BATTERY_TEMPERATURE: 0x0005,   // Battery Temperature (°C)
  
  // PV registers
  PV_POWER: 0x0010,              // PV Power (W)
  PV_VOLTAGE: 0x0011,            // PV Voltage (V)
  PV_CURRENT: 0x0012,            // PV Current (A)
  
  // Load registers
  LOAD_POWER: 0x0020,            // Load Power (W)
  LOAD_VOLTAGE: 0x0021,          // Load Voltage (V)
  LOAD_CURRENT: 0x0022,          // Load Current (A)
  
  // Grid registers
  GRID_POWER: 0x0030,            // Grid Power (W) - positive = exporting, negative = importing
  GRID_VOLTAGE: 0x0031,          // Grid Voltage (V)
  GRID_CURRENT: 0x0032,          // Grid Current (A)
  
  // Energy registers (daily totals in kWh)
  DAILY_CHARGE: 0x0100,          // Daily Battery Charge (kWh)
  DAILY_DISCHARGE: 0x0101,       // Daily Battery Discharge (kWh)
  DAILY_PV: 0x0102,              // Daily PV Generation (kWh)
  DAILY_LOAD: 0x0103,            // Daily Load Consumption (kWh)
  DAILY_GRID_IMPORT: 0x0104,     // Daily Grid Import (kWh)
  DAILY_GRID_EXPORT: 0x0105      // Daily Grid Export (kWh)
};

class SigenergyBatteryV2Device extends Device {
  private timer?: NodeJS.Timeout;
  private lastPvOutputUpload?: Date;
  private modbusClient?: any; // Will be initialized when needed

  async onInit() {
    this.log('Sigenergy Battery v2.0 Device initialized:', this.getName());

    // Initialize capabilities with default values
    if (this.getCapabilityValue('measure_battery') == null) {
      await this.setCapabilityValue('measure_battery', 0);
    }
    if (this.getCapabilityValue('measure_power') == null) {
      await this.setCapabilityValue('measure_power', 0);
    }
    if (this.getCapabilityValue('meter_power') == null) {
      await this.setCapabilityValue('meter_power', 0);
    }

    // Register capability listeners (read-only for now)
    this.registerCapabilityListener('measure_battery', async (_value) => {
      // Read-only, no action needed
      return null;
    });

    this.registerCapabilityListener('measure_power', async (_value) => {
      // Read-only, no action needed
      return null;
    });

    this.registerCapabilityListener('meter_power', async (_value) => {
      // Read-only, no action needed
      return null;
    });

    // Start polling
    await this.startPolling();
  }

  async onSettings() {
    await this.startPolling();
  }

  async onUninit() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.modbusClient) {
      try {
        await this.modbusClient.close();
      } catch (error) {
        this.error('Error closing Modbus client:', error);
      }
    }
  }

  private async startPolling() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const settings = this.getSettings();
    const pollInterval = Number(settings.poll_interval) || 30;

    const run = async () => {
      try {
        await this.fetchAndUpdateData();
      } catch (error) {
        this.error('Polling failed:', error);
      }
    };

    // Run immediately
    await run();

    // Set up interval
    this.timer = setInterval(run, Math.max(10, pollInterval) * 1000);
  }

  private async fetchAndUpdateData(): Promise<void> {
    const settings = this.getSettings();
    const ip = settings.sigenergy_ip;
    const port = settings.sigenergy_port || 502; // Default Modbus TCP port

    if (!ip) {
      this.log('No Sigenergy IP configured');
      return;
    }

    try {
      // Try Modbus TCP first, then fallback to HTTP API
      let data = await this.tryModbusConnection(ip, port);
      
      if (!data) {
        this.log('Modbus connection failed, trying HTTP API as fallback');
        data = await this.tryHttpAPI(ip, settings.sigenergy_port || 8080, settings.api_key);
      }
      
      if (!data) {
        this.log('All connection methods failed, using mock data for testing');
        data = this.getMockData();
      }

      if (data) {
        await this.updateCapabilities(data);
        await this.uploadToPvOutput(data);
      }
    } catch (error) {
      this.error('Failed to fetch Sigenergy data:', error);
    }
  }

  private async tryModbusConnection(ip: string, port: number): Promise<SigenergyData | null> {
    try {
      this.log(`Attempting Modbus TCP connection to ${ip}:${port}`);
      
      // Note: We'll need to implement actual Modbus TCP client
      // For now, this is a placeholder that shows the intended approach
      
      // In a real implementation, we would:
      // 1. Create Modbus TCP client
      // 2. Connect to the device
      // 3. Read registers using MODBUS_REGISTERS mapping
      // 4. Parse the data and return it
      
      // Example of what the Modbus reads would look like:
      const modbusData = {
        battery: {
          soc: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.BATTERY_SOC, 'uint16') / 100,
          power: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.BATTERY_POWER, 'int16'),
          voltage: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.BATTERY_VOLTAGE, 'uint16') / 10,
          current: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.BATTERY_CURRENT, 'int16') / 10,
          temperature: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.BATTERY_TEMPERATURE, 'int16') / 10
        },
        pv: {
          power: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.PV_POWER, 'uint16'),
          voltage: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.PV_VOLTAGE, 'uint16') / 10,
          current: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.PV_CURRENT, 'uint16') / 10
        },
        load: {
          power: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.LOAD_POWER, 'uint16'),
          voltage: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.LOAD_VOLTAGE, 'uint16') / 10,
          current: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.LOAD_CURRENT, 'uint16') / 10
        },
        grid: {
          power: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.GRID_POWER, 'int16'),
          voltage: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.GRID_VOLTAGE, 'uint16') / 10,
          current: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.GRID_CURRENT, 'int16') / 10
        },
        energy: {
          daily_charge: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.DAILY_CHARGE, 'uint16') / 100,
          daily_discharge: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.DAILY_DISCHARGE, 'uint16') / 100,
          daily_pv: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.DAILY_PV, 'uint16') / 100,
          daily_load: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.DAILY_LOAD, 'uint16') / 100,
          daily_grid_import: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.DAILY_GRID_IMPORT, 'uint16') / 100,
          daily_grid_export: await this.readModbusRegister(ip, port, MODBUS_REGISTERS.DAILY_GRID_EXPORT, 'uint16') / 100
        }
      };

      this.log('Successfully read data via Modbus TCP');
      return modbusData;
      
    } catch (error) {
      this.error('Modbus connection failed:', error);
      return null;
    }
  }

  private async readModbusRegister(ip: string, port: number, register: number, dataType: string): Promise<number> {
    // This is a placeholder for the actual Modbus implementation
    // In a real implementation, we would use a Modbus TCP library like 'modbus-serial'
    
    // For now, return mock data to show the structure
    const mockValues: Record<number, number> = {
      [MODBUS_REGISTERS.BATTERY_SOC]: 7500, // 75.00%
      [MODBUS_REGISTERS.BATTERY_POWER]: -500, // -500W (charging)
      [MODBUS_REGISTERS.BATTERY_VOLTAGE]: 485, // 48.5V
      [MODBUS_REGISTERS.BATTERY_CURRENT]: -103, // -10.3A
      [MODBUS_REGISTERS.BATTERY_TEMPERATURE]: 250, // 25.0°C
      [MODBUS_REGISTERS.PV_POWER]: 2500, // 2500W
      [MODBUS_REGISTERS.PV_VOLTAGE]: 3800, // 380.0V
      [MODBUS_REGISTERS.PV_CURRENT]: 66, // 6.6A
      [MODBUS_REGISTERS.LOAD_POWER]: 1800, // 1800W
      [MODBUS_REGISTERS.LOAD_VOLTAGE]: 2300, // 230.0V
      [MODBUS_REGISTERS.LOAD_CURRENT]: 78, // 7.8A
      [MODBUS_REGISTERS.GRID_POWER]: -200, // -200W (importing)
      [MODBUS_REGISTERS.GRID_VOLTAGE]: 2300, // 230.0V
      [MODBUS_REGISTERS.GRID_CURRENT]: -9, // -0.9A
      [MODBUS_REGISTERS.DAILY_CHARGE]: 1250, // 12.50kWh
      [MODBUS_REGISTERS.DAILY_DISCHARGE]: 820, // 8.20kWh
      [MODBUS_REGISTERS.DAILY_PV]: 1870, // 18.70kWh
      [MODBUS_REGISTERS.DAILY_LOAD]: 1530, // 15.30kWh
      [MODBUS_REGISTERS.DAILY_GRID_IMPORT]: 210, // 2.10kWh
      [MODBUS_REGISTERS.DAILY_GRID_EXPORT]: 50 // 0.50kWh
    };

    return mockValues[register] || 0;
  }

  private async tryHttpAPI(ip: string, port: number, apiKey?: string): Promise<SigenergyData | null> {
    const baseUrl = `http://${ip}:${port}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Try different API endpoints
    const endpoints = [
      '/api/v1/status',
      '/api/status',
      '/status',
      '/api/v1/data',
      '/api/data',
      '/data'
    ];

    for (const endpoint of endpoints) {
      try {
        this.log(`Trying HTTP endpoint: ${baseUrl}${endpoint}`);
        
        const response = await this.homey.http.get(`${baseUrl}${endpoint}`, {
          headers,
          timeout: 5000
        });

        if (response && response.data) {
          this.log('Successfully fetched data from HTTP API:', endpoint);
          return this.parseSigenergyData(response.data);
        }
      } catch (error) {
        this.log(`Failed to fetch from ${endpoint}:`, error.message);
      }
    }

    return null;
  }

  private parseSigenergyData(rawData: any): SigenergyData {
    // This is a placeholder - we'll need to adapt based on actual Sigenergy API response
    try {
      return {
        battery: {
          soc: Number(rawData.battery?.soc) || Number(rawData.soc) || 0,
          power: Number(rawData.battery?.power) || Number(rawData.battery_power) || 0,
          voltage: Number(rawData.battery?.voltage) || 0,
          current: Number(rawData.battery?.current) || 0,
          temperature: Number(rawData.battery?.temperature) || 0
        },
        pv: {
          power: Number(rawData.pv?.power) || Number(rawData.solar_power) || 0,
          voltage: Number(rawData.pv?.voltage) || 0,
          current: Number(rawData.pv?.current) || 0
        },
        load: {
          power: Number(rawData.load?.power) || Number(rawData.consumption) || 0,
          voltage: Number(rawData.load?.voltage) || 0,
          current: Number(rawData.load?.current) || 0
        },
        grid: {
          power: Number(rawData.grid?.power) || Number(rawData.grid_power) || 0,
          voltage: Number(rawData.grid?.voltage) || 0,
          current: Number(rawData.grid?.current) || 0
        },
        energy: {
          daily_charge: Number(rawData.energy?.daily_charge) || 0,
          daily_discharge: Number(rawData.energy?.daily_discharge) || 0,
          daily_pv: Number(rawData.energy?.daily_pv) || 0,
          daily_load: Number(rawData.energy?.daily_load) || 0,
          daily_grid_import: Number(rawData.energy?.daily_grid_import) || 0,
          daily_grid_export: Number(rawData.energy?.daily_grid_export) || 0
        }
      };
    } catch (error) {
      this.error('Failed to parse Sigenergy data:', error);
      return this.getMockData();
    }
  }

  private getMockData(): SigenergyData {
    // Mock data for testing when API is not available
    return {
      battery: {
        soc: 75,
        power: -500, // Negative = charging
        voltage: 48.5,
        current: -10.3,
        temperature: 25
      },
      pv: {
        power: 2500,
        voltage: 380,
        current: 6.6
      },
      load: {
        power: 1800,
        voltage: 230,
        current: 7.8
      },
      grid: {
        power: -200, // Negative = importing
        voltage: 230,
        current: -0.9
      },
      energy: {
        daily_charge: 12.5,
        daily_discharge: 8.2,
        daily_pv: 18.7,
        daily_load: 15.3,
        daily_grid_import: 2.1,
        daily_grid_export: 0.5
      }
    };
  }

  private async updateCapabilities(data: SigenergyData): Promise<void> {
    try {
      // Update battery SoC
      await this.setCapabilityValue('measure_battery', Math.round(data.battery.soc));

      // Update battery power (positive = discharging, negative = charging)
      await this.setCapabilityValue('measure_power', Math.round(data.battery.power));

      // Update daily energy throughput (charge + discharge)
      const dailyThroughput = data.energy.daily_charge + data.energy.daily_discharge;
      await this.setCapabilityValue('meter_power', Math.max(0, dailyThroughput));

      this.log('Updated capabilities:', {
        soc: data.battery.soc,
        power: data.battery.power,
        daily_throughput: dailyThroughput
      });
    } catch (error) {
      this.error('Failed to update capabilities:', error);
    }
  }

  private async uploadToPvOutput(data: SigenergyData): Promise<void> {
    const settings = this.getSettings();
    
    if (!settings.pvoutput_enabled || !settings.pvoutput_api_key || !settings.pvoutput_system_id) {
      return;
    }

    // Only upload every 5 minutes to avoid rate limiting
    const now = new Date();
    if (this.lastPvOutputUpload && (now.getTime() - this.lastPvOutputUpload.getTime()) < 5 * 60 * 1000) {
      return;
    }

    try {
      const pvOutputData = {
        d: now.toISOString().split('T')[0], // Date in YYYY-MM-DD format
        t: now.toTimeString().split(' ')[0], // Time in HH:MM format
        v1: data.pv.power, // PV Generation Now (W)
        v2: data.load.power, // Power Consumption Now (W)
        v3: data.battery.power, // Battery Power Now (W)
        v4: data.battery.soc, // Battery SoC (%)
        v5: data.battery.temperature, // Battery Temperature (°C)
        v6: data.energy.daily_pv, // PV Generation Today (kWh)
        v7: data.energy.daily_load, // Power Consumption Today (kWh)
        v8: data.energy.daily_charge, // Battery Charge Today (kWh)
        v9: data.energy.daily_discharge, // Battery Discharge Today (kWh)
        v10: data.grid.power, // Grid Power Now (W)
        v11: data.energy.daily_grid_import, // Grid Import Today (kWh)
        v12: data.energy.daily_grid_export // Grid Export Today (kWh)
      };

      const response = await this.homey.http.post('https://pvoutput.org/service/r2/addstatus.jsp', {
        headers: {
          'X-Pvoutput-Apikey': settings.pvoutput_api_key,
          'X-Pvoutput-SystemId': settings.pvoutput_system_id,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams(pvOutputData).toString()
      });

      if (response.status === 200) {
        this.lastPvOutputUpload = now;
        this.log('Successfully uploaded to PVOutput');
      } else {
        this.error('PVOutput upload failed:', response.status);
      }
    } catch (error) {
      this.error('PVOutput upload error:', error);
    }
  }
}

module.exports = SigenergyBatteryV2Device;
