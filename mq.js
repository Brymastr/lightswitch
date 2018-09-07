const mqtt = require('mqtt');
const client  = mqtt.connect('localhost', { username: 'homeassistant', protocol: '3.1.1', port: 1883 });

client.on('connect', function () {
  console.log('connected')
  client.subscribe('api/events/test', function (err) {
    if (!err) {
      // client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})