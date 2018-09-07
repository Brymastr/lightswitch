const serverMAC = 'b8:27:eb:d6:e5:5e';

let txCharacteristic = null;
let connectedDevice = null;
let timeout = null;
let busy = false;

function connect() {
  return NRF.connect(`${serverMAC} public`).then(device => {
    connectedDevice = device;
    return device.getPrimaryService('b8e0494f-3386-4512-bf2c-ea85c4cf32c0');
  }).then(service => {
    return service.getCharacteristic('36eef55d-900a-4e8f-b97d-67a7732aaa07');
  }).then(characteristic => {
    txCharacteristic = characteristic;
    return Promise.resolve();
  }).catch(function(err) {
    console.log(err);
    digitalPulse(LED1, 1, 500);
    disconnect();
  });
}

function disconnect() {
  connectedDevice.disconnect();
  connectedDevice = null;
  digitalPulse(LED3, 1, 100);
}

function write(data) {
  txCharacteristic.writeValue(data).then(function() {
    digitalPulse(LED2, 1, 1000);
  }).catch(function(err) {
    console.log(err);
    digitalPulse(LED1, 1, 1000);
  });
}

function manageTimeout() {
  if(timeout !== null) clearTimeout(timeout);

  timeout = setTimeout(() => {
    disconnect();
    return;
  }, 10000);
}


setWatch(e => {
  const pressDuration = e.time - e.lastTime;
  const command = pressDuration <= 0.7 ? 'short' : 'long';

  if(busy) return;
  if(!connectedDevice) {
    busy = true;
    digitalPulse(LED3, 1, [1000, 500, 1000 ]);
    connect().then(() => {
      write(command);
      manageTimeout();
    });
    busy = false;
    
    
  } else {
    write(command);
    manageTimeout();
  }

}, BTN, { edge: 'falling', debounce: 50, repeat: true });