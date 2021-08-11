const bleno = require('bleno');


!function main() {

  const characteristics = [
    new bleno.Characteristic({
      uuid: 'fffffffffffffffffffffffffffffff1',
      properties: [ 'notify', 'read', 'write' ],
      // If the client subscribes, we send out a message every 1 second
      onSubscribe: function(maxValueSize, updateValueCallback) {
        console.log("Device subscribed");
        this.intervalId = setInterval(function () {
          console.log("Sending: Hi!");
          updateValueCallback(new Buffer("Hi!"));
        }, 1000);
      },
      // If the client unsubscribes, we stop broadcasting the message
      onUnsubscribe: function () {
        console.log("Device unsubscribed");
        clearInterval(this.intervalId);
      },
      // Send a message back to the client with the characteristic's value
      onReadRequest: function (offset, callback) {
        console.log("Read request received");
        callback(this.RESULT_SUCCESS, Buffer.from("Echo: " +
          (this.value ? this.value.toString("utf-8") : "")));
      },
      // Accept a new value for the characterstic's value
      onWriteRequest: function(data, offset, withoutResponse, callback) {
        this.value = data;
        console.log('Write request: value = ' + this.value.toString("utf-8", 16));
        callback(this.RESULT_SUCCESS);
      }
    }),
  ];

  const primaryService = new bleno.PrimaryService({
    uuid: '12ab',
    characteristics
  });

  bleno.on('stateChange', state => {
    console.log('state change =>', state)
    if (state === 'poweredOn') {
      bleno.startAdvertising('Nopher', primaryService.uuid);
    }
  });

  bleno.on('advertisingStart', error => {
    console.log('advertisingStart');
    bleno.setServices([ primaryService ]);
  });

  bleno.on('accept', address => {
    console.log(address);
  });


}();



