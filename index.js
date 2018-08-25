const noble = require('noble');
const { EventEmitter } = require('events');


!function main() {
  const devices = [];
  const events = new EventEmitter();

  let state = 'on';

  noble.on('discover', device => discover(device, events));

  noble.startScanning();
  setTimeout(() => {
    noble.stopScanning();
  }, 10000);            

  events.on('Puck Discovered', device => {
    devices.push(device);
    connect(device, events);
  });

  events.on('Puck Connected', peripheral => {
    subscribeToCharacteristics(peripheral, events);
    console.log(`connected to device ${peripheral.advertisement.localName}: ${peripheral.uuid}`);
  });

  events.on('Button Pressed', e => {
    console.log('Button Pressed -', e.device.advertisement.localName);
    toggleLEDs(devices, state);
    state = state === 'on' ? 'off' : 'on';
  });

}();

function toggleLEDs(devices, state) {

  for(const device of devices) {
    const c = device.characteristics.find(x => x.uuid === '6e400002b5a3f393e0a9e50e24dcca9e');
    c.write(Buffer.from(`setLED(${state === 'on' ? '1' : '2'});\n`));
  }


}

function discover(device, eventEmitter) {
  const { id, uuid, address, advertisement, state } = device;
  if(advertisement.localName && advertisement.localName.includes('Puck.js'))
  eventEmitter.emit('Puck Discovered', device);
}

function connect(peripheral, eventEmitter) {
  peripheral.connect(function(error) {
    eventEmitter.emit('Puck Connected', peripheral);    
  });
}

function subscribeToCharacteristics(device, eventEmitter) {
  device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
    device.characteristics = characteristics;
    const cWrite = characteristics.find(x => x.uuid === '6e400002b5a3f393e0a9e50e24dcca9e');
    const cRead = characteristics.find(x => x.uuid === '6e400003b5a3f393e0a9e50e24dcca9e');
    cRead.on('data', data => {
      cRead.read((err, readData) => {
        if(readData) {
          const data = readData.toString();
          
          if(data.includes('button_pressed'))
            eventEmitter.emit('Button Pressed', { data: readData, device });
          
        }
      });
    })
    cRead.subscribe();
    
    cWrite.write(Buffer.from('setLED(2);\n'));
    console.log(`subscribed to ${cRead.properties.join(', ')} on ${device.advertisement.localName}`);
  });
}