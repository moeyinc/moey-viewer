var config
if (process.env.ENV === 'MOEY_SEIYA') {
  config = {
    BAUDRATE: 115200,
    SERIAL_PATH_A: '/dev/tty.usbmodem3533221',
    SERIAL_PATH_B: '/dev/tty.usbmodem3533231'
  }
} else if (process.env.ENV === 'SURFACE') {
  config = {
    BAUDRATE: 115200,
    SERIAL_PATH_A: 'COM4',
    SERIAL_PATH_B: 'COM3'
  }
}

module.exports = config
