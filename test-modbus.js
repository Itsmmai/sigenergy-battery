const ModbusRTU = require('modbus-serial');

// SigEnergy Modbus register mappings
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

async function readModbusRegister(client, register, dataType, description) {
  try {
    const result = await client.readHoldingRegisters(register, 1);
    
    if (result && result.data && result.data.length > 0) {
      let value = result.data[0];
      
      // Handle different data types
      switch (dataType) {
        case 'int16':
          // Convert to signed 16-bit integer
          if (value > 32767) {
            value = value - 65536;
          }
          break;
        case 'uint16':
          // Already unsigned 16-bit integer
          break;
        default:
          break;
      }
      
      console.log(`${description}: ${value} (raw: ${result.data[0]})`);
      return value;
    }
    
    console.log(`${description}: Failed to read`);
    return 0;
  } catch (error) {
    console.log(`${description}: Error - ${error.message}`);
    return 0;
  }
}

async function testSigEnergyModbus() {
  const client = new ModbusRTU();
  
  try {
    // Configuration - update these values
    const ip = '192.168.0.86';  // Update with your SigEnergy IP
    const port = 502;           // Default Modbus TCP port
    
    console.log(`Connecting to SigEnergy at ${ip}:${port}...`);
    
    // Connect to the device
    await client.connectTCP(ip, { port });
    
    // Set unit ID (usually 1 for SigEnergy devices)
    client.setID(1);
    
    console.log('Connected! Reading registers...\n');
    
    // Read all registers
    await readModbusRegister(client, MODBUS_REGISTERS.BATTERY_SOC, 'uint16', 'Battery SoC (%)');
    await readModbusRegister(client, MODBUS_REGISTERS.BATTERY_POWER, 'int16', 'Battery Power (W)');
    await readModbusRegister(client, MODBUS_REGISTERS.BATTERY_VOLTAGE, 'uint16', 'Battery Voltage (V)');
    await readModbusRegister(client, MODBUS_REGISTERS.BATTERY_CURRENT, 'int16', 'Battery Current (A)');
    await readModbusRegister(client, MODBUS_REGISTERS.BATTERY_TEMPERATURE, 'int16', 'Battery Temperature (°C)');
    
    console.log('\n--- PV Data ---');
    await readModbusRegister(client, MODBUS_REGISTERS.PV_POWER, 'uint16', 'PV Power (W)');
    await readModbusRegister(client, MODBUS_REGISTERS.PV_VOLTAGE, 'uint16', 'PV Voltage (V)');
    await readModbusRegister(client, MODBUS_REGISTERS.PV_CURRENT, 'uint16', 'PV Current (A)');
    
    console.log('\n--- Load Data ---');
    await readModbusRegister(client, MODBUS_REGISTERS.LOAD_POWER, 'uint16', 'Load Power (W)');
    await readModbusRegister(client, MODBUS_REGISTERS.LOAD_VOLTAGE, 'uint16', 'Load Voltage (V)');
    await readModbusRegister(client, MODBUS_REGISTERS.LOAD_CURRENT, 'uint16', 'Load Current (A)');
    
    console.log('\n--- Grid Data ---');
    await readModbusRegister(client, MODBUS_REGISTERS.GRID_POWER, 'int16', 'Grid Power (W)');
    await readModbusRegister(client, MODBUS_REGISTERS.GRID_VOLTAGE, 'uint16', 'Grid Voltage (V)');
    await readModbusRegister(client, MODBUS_REGISTERS.GRID_CURRENT, 'int16', 'Grid Current (A)');
    
    console.log('\n--- Energy Data ---');
    await readModbusRegister(client, MODBUS_REGISTERS.DAILY_CHARGE, 'uint16', 'Daily Charge (kWh)');
    await readModbusRegister(client, MODBUS_REGISTERS.DAILY_DISCHARGE, 'uint16', 'Daily Discharge (kWh)');
    await readModbusRegister(client, MODBUS_REGISTERS.DAILY_PV, 'uint16', 'Daily PV (kWh)');
    await readModbusRegister(client, MODBUS_REGISTERS.DAILY_LOAD, 'uint16', 'Daily Load (kWh)');
    await readModbusRegister(client, MODBUS_REGISTERS.DAILY_GRID_IMPORT, 'uint16', 'Daily Grid Import (kWh)');
    await readModbusRegister(client, MODBUS_REGISTERS.DAILY_GRID_EXPORT, 'uint16', 'Daily Grid Export (kWh)');
    
    // Close connection
    client.close();
    console.log('\nConnection closed.');
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    client.close();
  }
}

// Run the test
testSigEnergyModbus();
