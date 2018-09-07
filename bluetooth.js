const noble = require('noble');
const { EventEmitter } = require('events');
const axios = require('axios');
const url = 'http://192.168.0.109:8123/api/events';


!function main() {
  const devices = [];
  const events = new EventEmitter();

  let shortState = true;
  let longState = false;

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

  events.on('Button Pressed Short', e => {
    console.log('Button Pressed -', e.device.advertisement.localName);
    axios.post(`${url}/${e.data}`);
    toggleLEDs(devices, shortState);
    shortState = !shortState;
  });

  events.on('Button Pressed Long', e => {
    console.log('Button Pressed -', e.device.advertisement.localName);
    axios.post(`${url}/${e.data}`);
    toggleLEDs(devices, longState);
    longState = !longState;
  });

}();

function toggleLEDs(devices, state) {

  for(const device of devices) {
    const c = device.characteristics.find(x => x.uuid === '6e400002b5a3f393e0a9e50e24dcca9e');
    c.write(Buffer.from(`setLED(${state === true ? '1' : '2'});\n`));
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
          
          if(data.includes('button_pressed_s'))
            eventEmitter.emit('Button Pressed Short', { data: 'button_pressed_short', device });
          
          else if(data.includes('button_pressed_l'))
            eventEmitter.emit('Button Pressed Long', { data: 'button_pressed_long', device });
        }
      });
    })
    cRead.subscribe();
    
    cWrite.write(Buffer.from('setLED(2);\n'));
    console.log(`subscribed to ${cRead.properties.join(', ')} on ${device.advertisement.localName}`);
  });
}