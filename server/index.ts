/**
 * This file is the code that runs on the server
 */

interface Puck {
  short: number;
  long: number;
}

interface Pucks {
  [puck: string]: Puck;
}

const PUCKS: Pucks = {
  'CC:E9:2C:40:9B:3A': { short: 0, long: 0 },
};

interface ServiceData {
  // battery,
  // temperature,
  mac: string;
  shortPresses: number;
  longPresses: number;
}

// const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
// const TEMPERATURE_SERVICE_UUID = '00001809-0000-1000-8000-00805f9b34fb';
const BUTTON_PRESS_SERVICE_UUID = '00001815-0000-1000-8000-00805f9b34fb';
const GREEN_ACKNOWLEDGE = [0, 150, 0];
const BLUE_ACKNOWLEDGE = [0, 0, 150];

import Bluez, { Device } from 'bluez';
import LightControl from './LightControl';

async function start(bluetoothInterface: Bluez) {
  await bluetoothInterface.init();
  const adapter = await bluetoothInterface.getAdapter();
  await adapter.SetDiscoveryFilter({ Transport: 'le' });
  await adapter.StartDiscovery();
  console.log('Discovering');
}

async function getServiceData(device: Device) {
  const serviceData = await (await device.getProperties()).ServiceData;
  // const battery = serviceData[BATTERY_SERVICE_UUID][0];
  // const temperature = serviceData[TEMPERATURE_SERVICE_UUID][0];
  const [shortPresses, longPresses] = serviceData[BUTTON_PRESS_SERVICE_UUID];

  const data: ServiceData = {
    // battery,
    // temperature,
    mac: await device.Address(),
    shortPresses,
    longPresses,
  };

  return data;
}

async function handleUpdate(serviceData: ServiceData, light: LightControl) {
  const { mac } = serviceData;
  const existing = PUCKS[mac];

  if (!existing) return;

  const shortPress = existing.short !== serviceData.shortPresses;
  const longPress = existing.long !== serviceData.longPresses;

  if (shortPress) {
    console.log('short press', serviceData.shortPresses);
    existing.short = serviceData.shortPresses;
    light.flash(GREEN_ACKNOWLEDGE);
  }

  if (longPress) {
    console.log('long press', serviceData.longPresses);
    existing.long = serviceData.longPresses;
    light.flash(BLUE_ACKNOWLEDGE);
  }
}

async function main() {
  const bluetooth = new Bluez();
  const light = new LightControl();

  bluetooth.on('device', async (address, props) => {
    if (!props.Name?.includes('Puck.js')) return;

    const device = await bluetooth.getDevice(address);

    device.on('PropertiesChanged', async () => {
      const serviceData = await getServiceData(device);
      handleUpdate(serviceData, light);
    });
  });

  await start(bluetooth);
}

main();
