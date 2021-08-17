// @ts-ignore
import Blink1 from 'node-blink1';
const defaultColor = [255, 255, 255];

export default class LightControl {
  private light: Blink1;

  constructor() {
    this.light = new Blink1();
  }

  private setColor([r, g, b] = defaultColor, duration = 1000, fadeMillis = 0): Promise<void> {
    return new Promise(resolve => {
      if (fadeMillis > 0) {
        this.light.fadeToRGB(fadeMillis, r, g, b);
        setTimeout(async () => {
          await this.stop();
          resolve();
        }, duration);
      } else {
        this.light.setRGB(r, g, b);
        setTimeout(async () => {
          await this.stop();
          resolve();
        }, duration);
      }
    });
  }

  private stop() {
    return new Promise(resolve => {
      this.light.off(resolve);
    });
  }

  public async flash(color = defaultColor, duration = 200, times = 1) {
    for (let i = 0; i < times; i++) {
      await this.setColor(color, duration);
      await this.setColor([0, 0, 0], 200);
    }
  }
}
