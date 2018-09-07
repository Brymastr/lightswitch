let longPresses = 0;
let shortPresses = 0;

function handle(e) {

  const pressDuration = e.time - e.lastTime;
  if(pressDuration <= 0.5) {
    ++shortPresses;
    digitalPulse(LED2, 1, 500);
    if(shortPresses > 1000) shortPresses = 1;
  } else {
    ++longPresses;
    digitalPulse(LED2, 1, 1000);
    if(longPresses > 1000) shortPresses = 1;
  }

  NRF.setAdvertising([{
    0x180F: Puck.getBatteryPercentage(),
    0x1809: Math.round(E.getTemperature()),
  }], {
    interval: 400,
    manufacturer: 0x0590,
    manufacturerData: [ shortPresses, longPresses ],
  });
}

NRF.setAdvertising([{
  0x180F: Puck.getBatteryPercentage(),
  0x1809: Math.round(E.getTemperature()),
}], {
  interval: 400,
  manufacturer: 0x0590,
  manufacturerData: [ shortPresses, longPresses ],
});

setWatch(handle, BTN, {
  edge: 'falling',
  repeat: 1,
  debounce: 50,
});

