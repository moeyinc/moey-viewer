var config
console.log('environment is ' + process.env.ENV)
if (process.env.ENV === 'MOEY_SEIYA') {
  console.log('moey seiya')
  config = {
    BAUDRATE: 115200,
    SERIAL_PATH_A: '/dev/tty.usbmodem3533221',
    SERIAL_PATH_B: '/dev/tty.usbmodem3533231'
  }
} else if (process.env.ENV === 'SURFACE') {
  console.log('surface')
  config = {
    BAUDRATE: 115200,
    SERIAL_PATH_A: 'COM4',
    SERIAL_PATH_B: 'COM3'
  }
} else {
  console.log('default')
  config = {
    BAUDRATE: 115200,
    SERIAL_PATH_A: '/dev/tty.usbmodem3533221',
    SERIAL_PATH_B: '/dev/tty.usbmodem3533231'
  }
}

module.exports = config
