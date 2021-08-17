/**
 * This file is the code that runs on the puck
 */

// globals
let longPresses = 0;
let shortPresses = 0;
let asleep = false;
let advertisingTimeout;
let longLongPressTimeout;
let isLongLongPress = false;

// constants
const DEFAULT_ADVERTISING_DURATION_MS = 5000;
const LONG_PRESS_SECONDS = 0.45;
const LONG_LONG_PRESS_SECONDS = 2;

function sleep() {
  console.log('sleep');
  asleep = true;
  try {
    NRF.sleep();
  } catch (e) {}
  flash('red', 50);
}

function getData() {
  return {
    // 0x180f: Puck.getBatteryPercentage(),
    // 0x1809: Math.round(E.getTemperature()),
    0x1815: [shortPresses, longPresses],
  };
}

function setAdvertising(duration) {
  if (!duration) duration = DEFAULT_ADVERTISING_DURATION_MS;
  if (asleep) {
    try {
      NRF.wake();
    } catch (err) {}
    asleep = false;
  }
  if (advertisingTimeout) clearTimeout(advertisingTimeout);

  const data = getData();

  try {
    NRF.setAdvertising([data], { interval: 500, showName: true });
  } catch (err) {}

  advertisingTimeout = setTimeout(sleep, duration);
}

function shortPressHandler() {
  console.log('short press');
  shortPresses++;
  flash('green', 500);
  console.log(getData());
  setAdvertising();
}

function longPressHandler() {
  console.log('long press');
  longPresses++;
  flash('blue', 500);
  console.log(getData());
  setAdvertising();
}

function longLongPressHandler() {
  console.log('long long press');
  if (asleep) {
    blink('blue', 3);
    setAdvertising(300000);
  } else {
    sleep();
  }
}

function flash(color, duration) {
  let led;
  if (color === 'red') led = LED1;
  else if (color === 'green') led = LED2;
  else if (color === 'blue') led = LED3;

  digitalPulse(led, 1, duration);
}

function blink(color, times) {
  let led;
  if (color === 'red') led = LED1;
  else if (color === 'green') led = LED2;
  else if (color === 'blue') led = LED3;

  const blinkPattern = [];
  for (let i = 0; i < times; i++) {
    blinkPattern.push(100);
    blinkPattern.push(100);
  }

  blinkPattern.pop();

  digitalPulse(led, 1, blinkPattern);
}

function handler(e) {
  const pressDuration = e.time - e.lastTime;
  if (pressDuration <= LONG_PRESS_SECONDS) shortPressHandler();
  else if (pressDuration <= LONG_LONG_PRESS_SECONDS) longPressHandler();
}

function h(e) {
  // btn down
  if (e.state === true) {
    longLongPressTimeout = setTimeout(longLongPressHandler, LONG_LONG_PRESS_SECONDS * 1000);
  }
  // btn up
  else {
    clearTimeout(longLongPressTimeout);
    if (isLongLongPress) {
      isLongLongPress = false;
      return;
    } else {
      handler(e);
    }
  }
}

setWatch(h, BTN, {
  edge: 'both',
  repeat: 1,
  debounce: 50,
});

flash('blue', 500);
