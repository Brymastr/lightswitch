let longPresses = 0;
let shortPresses = 0;
let asleep = false;
let sleepTimeout = null;

function handle(e) {
  const pressDuration = e.time - e.lastTime;
  if (pressDuration <= 0.45) {
    ++shortPresses;
    digitalPulse(LED2, 1, 500);
    if (shortPresses > 1000) shortPresses = 1;
  } else {
    ++longPresses;
    digitalPulse(LED3, 1, 500);
    if (longPresses > 1000) longPresses = 1;
  }

  setAdvertising();
}

function setAdvertising(duration) {
  if (!duration) duration = 15000;
  if (asleep) {
    NRF.wake();
    // console.log('wake');
    asleep = false;
  }
  if (sleepTimeout !== null) clearTimeout(sleepTimeout);

  NRF.setAdvertising(
    [
      {
        0x180f: Puck.getBatteryPercentage(),
        0x1809: Math.round(E.getTemperature()),
      },
    ],
    {
      interval: 500,
      manufacturer: 0x0590,
      manufacturerData: [shortPresses, longPresses],
      showName: true,
    }
  );

  // console.log(`sleep in ${duration} ms`);
  sleepTimeout = setTimeout(function() {
    // console.log('sleep now');
    asleep = true;
    NRF.sleep();
    digitalPulse(LED1, 1, 50);
  }, duration);
}

setAdvertising();
digitalPulse(LED3, 1, 500);

setWatch(handle, BTN, {
  edge: 'falling',
  repeat: 1,
  debounce: 50,
});
