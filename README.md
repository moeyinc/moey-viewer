# moey-viewer

## 4 steps to start
1) set up hardware components
- Teensy3.2 * 2 (https://www.pjrc.com/teensy/teensy31.html)
- Absolute Rotary Encoder * 2 (https://www.usdigital.com/products/encoders/absolute/rotary/shaft/ma3)
- micro USB cables * 2, connecting Teensys with computer
- computer with node.js installed

2) wiring and upload firmware
- upload abs_rotary_encoder.ino firmware to Teensy. One should spit 'A' + value; The other should spit 'B' + value
- signal wire from encoder should be connected to pin 2 to utilize hardware intterupt. Vin wire should be connected to 5V source from USB. Ground to ground. See reference photo in others directory.

3) configurate server
- open serialport-config.js and edit the port numbers
- SERIAL_PATH_A is vertical, SERIAL_PATH_B is horizontal
- you can add another setting block if you use different computer

4) run the server
- run node script to start server
- access localhost:3000
- if you need a handy shortcut, double click MoeyViewer.bash
