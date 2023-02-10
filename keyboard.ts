// @ts-ignore
import ExclusiveKeyboard from 'exclusive-keyboard';
import axios from 'axios'

type Keypress = {
  keyId: string
}

async function main() {
  console.log('start')

  const device1 = 'event0'
  const device2 = 'event2'

  const url = 'localhost:8123/api'
  const token = ''


  const keyboard1 = new ExclusiveKeyboard(device1, true);
  const keyboard2 = new ExclusiveKeyboard(device2, true);

  async function handler(keypress: Keypress) {
    const { keyId } = keypress
    console.log(keyId)

    const data = await axios.post(`http://${url}/services/keypad/key_pressed`, {
      "key": keyId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  keyboard1.on('keypress', handler)
  keyboard2.on('keypress', handler)

}

main()
