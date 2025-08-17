const ModbusRTU = require('modbus-serial');

async function scanRegisters() {
  const client = new ModbusRTU();
  
  try {
    const ip = '192.168.0.85';
    const port = 502;
    
    console.log(`Scanning SigEnergy at ${ip}:${port}...`);
    
    await client.connectTCP(ip, { port });
    client.setID(1);
    
    console.log('Connected! Scanning registers...\n');
    
    // Scan different register ranges
    const ranges = [
      { start: 0, end: 100, name: 'Registers 0-100' },
      { start: 1000, end: 1100, name: 'Registers 1000-1100' },
      { start: 2000, end: 2100, name: 'Registers 2000-2100' },
      { start: 3000, end: 3100, name: 'Registers 3000-3100' },
      { start: 4000, end: 4100, name: 'Registers 4000-4100' },
      { start: 5000, end: 5100, name: 'Registers 5000-5100' },
      { start: 6000, end: 6100, name: 'Registers 6000-6100' },
      { start: 7000, end: 7100, name: 'Registers 7000-7100' },
      { start: 8000, end: 8100, name: 'Registers 8000-8100' },
      { start: 9000, end: 9100, name: 'Registers 9000-9100' }
    ];
    
    for (const range of ranges) {
      console.log(`\n--- ${range.name} ---`);
      let foundCount = 0;
      
      for (let reg = range.start; reg <= range.end; reg += 10) {
        try {
          const result = await client.readHoldingRegisters(reg, 1);
          if (result && result.data && result.data.length > 0) {
            const value = result.data[0];
            console.log(`Register ${reg}: ${value} (0x${reg.toString(16)})`);
            foundCount++;
          }
        } catch (error) {
          // Ignore errors for non-existent registers
        }
      }
      
      if (foundCount === 0) {
        console.log('No readable registers found in this range');
      }
    }
    
    client.close();
    console.log('\nScan completed.');
    
  } catch (error) {
    console.error('Scan failed:', error.message);
    client.close();
  }
}

scanRegisters();
