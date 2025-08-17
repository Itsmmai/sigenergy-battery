const ModbusRTU = require('modbus-serial');

// SigEnergy register mappings from Home Assistant integration
const SIGENERGY_REGISTERS = {
  // Plant registers (address 30000+)
  PLANT_GRID_ACTIVE_POWER: 30005,      // Grid Active Power (>0 buy from grid; <0 sell to grid)
  PLANT_GRID_REACTIVE_POWER: 30007,    // Grid Reactive Power
  PLANT_GRID_VOLTAGE_L1: 30009,        // Grid Voltage L1
  PLANT_GRID_VOLTAGE_L2: 30010,        // Grid Voltage L2
  PLANT_GRID_VOLTAGE_L3: 30011,        // Grid Voltage L3
  PLANT_GRID_CURRENT_L1: 30012,        // Grid Current L1
  PLANT_GRID_CURRENT_L2: 30013,        // Grid Current L2
  PLANT_GRID_CURRENT_L3: 30014,        // Grid Current L3
  PLANT_GRID_FREQUENCY: 30015,         // Grid Frequency
  
  // Battery registers
  PLANT_BATTERY_VOLTAGE: 30016,        // Battery Voltage
  PLANT_BATTERY_CURRENT: 30017,        // Battery Current (>0 discharge; <0 charge)
  PLANT_BATTERY_SOC: 30018,            // Battery State of Charge
  PLANT_BATTERY_SOH: 30019,            // Battery State of Health
  PLANT_BATTERY_TEMPERATURE: 30020,    // Battery Temperature
  
  // PV registers
  PLANT_PV_POWER: 30021,               // PV Power
  PLANT_PV_VOLTAGE: 30022,             // PV Voltage
  PLANT_PV_CURRENT: 30023,             // PV Current
  
  // Load registers
  PLANT_LOAD_ACTIVE_POWER: 30024,      // Load Active Power
  PLANT_LOAD_REACTIVE_POWER: 30026,    // Load Reactive Power
  PLANT_LOAD_VOLTAGE_L1: 30028,        // Load Voltage L1
  PLANT_LOAD_VOLTAGE_L2: 30029,        // Load Voltage L2
  PLANT_LOAD_VOLTAGE_L3: 30030,        // Load Voltage L3
  PLANT_LOAD_CURRENT_L1: 30031,        // Load Current L1
  PLANT_LOAD_CURRENT_L2: 30032,        // Load Current L2
  PLANT_LOAD_CURRENT_L3: 30033,        // Load Current L3
  
  // Energy registers
  PLANT_ACCUMULATED_PV_ENERGY: 30034,  // Accumulated PV Energy
  PLANT_ACCUMULATED_CONSUMED_ENERGY: 30036, // Accumulated Consumed Energy
  PLANT_ACCUMULATED_GRID_IMPORT_ENERGY: 30038, // Accumulated Grid Import Energy
  PLANT_ACCUMULATED_GRID_EXPORT_ENERGY: 30040, // Accumulated Grid Export Energy
};

async function readSigEnergyRegister(client, register, dataType, description, gain = 1) {
  try {
    let count = 1;
    if (dataType === 's32' || dataType === 'u32') {
      count = 2; // 32-bit values need 2 registers
    }
    
    const result = await client.readHoldingRegisters(register, count);
    
    if (result && result.data && result.data.length > 0) {
      let value;
      
      if (count === 2) {
        // 32-bit value (combine 2 registers)
        value = (result.data[0] << 16) + result.data[1];
        
        // Handle signed 32-bit
        if (dataType === 's32' && value > 2147483647) {
          value = value - 4294967296;
        }
      } else {
        // 16-bit value
        value = result.data[0];
        
        // Handle signed 16-bit
        if (dataType === 's16' && value > 32767) {
          value = value - 65536;
        }
      }
      
      // Apply gain
      const finalValue = value / gain;
      
      console.log(`${description}: ${finalValue} (raw: ${value}, gain: ${gain})`);
      return finalValue;
    }
    
    console.log(`${description}: Failed to read`);
    return 0;
  } catch (error) {
    console.log(`${description}: Error - ${error.message}`);
    return 0;
  }
}

async function testSigEnergyReal() {
  const client = new ModbusRTU();
  
  try {
    const ip = '192.168.0.85';
    const port = 502;
    
    console.log(`Connecting to SigEnergy at ${ip}:${port}...`);
    
    await client.connectTCP(ip, { port });
    
    // Try different slave IDs
    const slaveIds = [247, 1, 2]; // Plant: 247, Inverter: 1, AC Charger: 2
    
    for (const slaveId of slaveIds) {
      console.log(`\n--- Testing Slave ID ${slaveId} ---`);
      client.setID(slaveId);
      
      try {
        // Test a simple register first
        await readSigEnergyRegister(client, SIGENERGY_REGISTERS.PLANT_BATTERY_SOC, 'u16', 'Battery SoC (%)', 1);
        await readSigEnergyRegister(client, SIGENERGY_REGISTERS.PLANT_BATTERY_VOLTAGE, 'u16', 'Battery Voltage (V)', 10);
        await readSigEnergyRegister(client, SIGENERGY_REGISTERS.PLANT_BATTERY_CURRENT, 's16', 'Battery Current (A)', 10);
        await readSigEnergyRegister(client, SIGENERGY_REGISTERS.PLANT_PV_POWER, 'u16', 'PV Power (W)', 1);
        await readSigEnergyRegister(client, SIGENERGY_REGISTERS.PLANT_GRID_ACTIVE_POWER, 's32', 'Grid Active Power (W)', 1000);
        
        console.log(`✅ Slave ID ${slaveId} works!`);
        break;
      } catch (error) {
        console.log(`❌ Slave ID ${slaveId} failed: ${error.message}`);
      }
    }
    
    client.close();
    console.log('\nTest completed.');
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    client.close();
  }
}

testSigEnergyReal();
