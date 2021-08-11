#!/usr/bin/env node

const noble = require('noble');
const { EventEmitter } = require('events');
const axios = require('axios');
// const url = 'http://192.168.0.103:8123/api/events';
const url = 'http://localhost:8123/api/events';

// prettier-ignore
const PUCKS = {
  'c87b': 'puck_0',   // living room 1
  'a00a': 'puck_1',   // bedroom wall
  '9b3a': 'puck_2',   // headboard
  '6b54': 'puck_3',   // living room 2
};

!(async function main() {
  const events = new EventEmitter();
  const devices = {};

  noble.on('stateChange', state => {
    if (state === 'poweredOn') {
      console.log(state);
      noble.on('scanStart', e => console.log('scanning'));
      noble.on('scanStop', e => console.log('stopped'));
      noble.on('warning', e => console.log('warning', e));
      noble.on('discover', device => discover(device, events));
      noble.startScanning(null, true);
    }
  });

  events.on('Puck Discovered', async device => {
    // console.log('puck discovered', device.name);
    if (device.advertisement.serviceData.length === 0) return;
    const batteryLevel = device.advertisement.serviceData.find(
      x => x.uuid === '180f'
    ).data[0];
    const temperature = device.advertisement.serviceData.find(
      x => x.uuid === '1809'
    ).data[0];
    const [
      shortPresses,
      longPresses,
    ] = device.advertisement.manufacturerData.slice(2);

    const data = {
      short: shortPresses,
      long: longPresses,
      battery: batteryLevel,
      temperature: temperature,
    };

    if (!Object.keys(devices).includes(device.name)) {
      devices[device.name] = data;
      console.log('new device:', device.name);
    }
    const types = [];
    if (data.long !== devices[device.name].long) {
      types.push('long');
      console.log('long press', device.name);
    }
    if (data.short !== devices[device.name].short) {
      types.push('short');
      console.log('short press', device.name);
    }
    devices[device.name] = data;

    for (const type of types) {
      console.log(type);
      // axios.get(
      //   `${url}/test`,
      //   {
      //     name: device.name,
      //     type,
      //   },
      //   {
      //     headers: {
      //       'x-ha-access': 'PASSWORD GOES HERE',
      //     },
      //   }
      // );
    }
  });
})();

function discover(device, eventEmitter) {
  const { id, uuid, address, advertisement, state } = device;
  console.log(`discovered: ${address}`);

  const name = address.slice(-5).replace('-', '');
  if (Object.keys(PUCKS).includes(name)) {
    device.name = PUCKS[name];
    eventEmitter.emit('Puck Discovered', device);
  }
}
