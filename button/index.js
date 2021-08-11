/**
 * This file is the code that runs on the puck
 */

let longPresses = 0;
let shortPresses = 0;
let asleep = false;
let sleepTimeout = null;

function handle(e) {
  const pressDuration = e.time - e.lastTime;
  if (pressDuration <= 0.45) {
    console.log('short press');
  } else {
    console.log('long press');
  }

  digitalPulse(LED3, 1, 500);
}

digitalPulse(LED3, 1, 500);

setWatch(handle, BTN, {
  edge: 'falling',
  repeat: 1,
  debounce: 50,
});
