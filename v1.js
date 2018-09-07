setWatch(e => {
  const pressDuration = e.time - e.lastTime;
  const command = pressDuration <= 0.7 ? 'button_pressed_short' : 'button_pressed_long';
  console.log(command);
}, BTN, { edge: "falling", debounce: 50, repeat: true });

function setLED(color) {
  let led = LED1;
  
  if(color === 'red' || color === 1)
    led = LED1;
  else if(color === 'green' || color === 2)
    led = LED2;
  else if(color === 'blue' || color === 3)
    led = LED3;
  
  led.set();
  setTimeout(led.reset.bind(led), 1000);
}