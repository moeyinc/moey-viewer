<!-- =================================================
 Vue Template
================================================== -->
<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<!-- =================================================
 Vue Script
================================================== -->
<script>
import V from './variable.js'
import io from 'socket.io-client'
require('reset-css/reset.css')
// require('@/assets/css/material.css')

export default {
  name: 'app',
  data () {
    return {
      socket: null
    }
  },
  created () {
    // add an additional function to Math
    Math.degToRad = function (deg) {
      return deg * Math.PI / 180
    }

    // update size info
    this.$store.commit('updateSize', {appWidth: window.innerWidth, appHeight: window.innerHeight})

    // add event lisner for window.resize
    window.addEventListener('resize', () => {
      this.$store.commit('updateSize', {appWidth: window.innerWidth, appHeight: window.innerHeight})
    })

    // initialize the web socket
    this.initSocket()
  },
  methods: {
    /*****************************************
    // initialize the websocket connection that will receive sensor values on serial port of the server
    // everytime it receives a new value, it will update the serialVal in data
    *****************************************/
    initSocket () {
      const context = this
      this.socket = io(V.SERVER_URL)
      this.socket.on('serialport', function (data) {
        // var firstLetter = data.substring(0, 1)
        let encoderID = data.encoder
        let value = data.value

        let mappedValue, modifier
        if (encoderID === 'A') {
          modifier = 2048 - V.SERIAL_VAL_ORIGIN_VERTICAL
          mappedValue = context.map_range(value + modifier, 0, 4096, Math.degToRad(-180), Math.degToRad(180))
          context.$bus.$emit('rotate-a', mappedValue)
          context.$bus.$emit('dev-rotate-a', value)
        } else if (encoderID === 'B') {
          modifier = 2048 - V.SERIAL_VAL_ORIGIN_HORIZONTAL
          mappedValue = context.map_range(value + modifier, 0, 4096, Math.degToRad(-180), Math.degToRad(180))
          context.$bus.$emit('rotate-b', mappedValue)
          context.$bus.$emit('dev-rotate-b', value)
        }
      })
    },
    map_range (value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
    }
  }
}
</script>

<!-- =================================================
 Vue Style
================================================== -->
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  overflow: hidden;
}

html, body, #app {
  height: 100%;
  /*cursor: none;*/
  user-select: none;
}

body {
  background: whitesmoke;
}

a {
  text-decoration: none;
  /*cursor: none;*/
}

.clearfix:before, .clearfix:after { content: " "; display: table; }
.clearfix:after { clear: both; }

@font-face {
  font-family: 'arrows';
	src:url('/static/fonts/arrows/arrows.eot');
	src:url('/static/fonts/arrows/arrows.eot?#iefix') format('embedded-opentype'),
		url('/static/fonts/arrows/arrows.woff') format('woff'),
		url('/static/fonts/arrows/arrows.ttf') format('truetype'),
		url('/static/fonts/arrows/arrows.svg#arrows') format('svg');
	font-weight: normal;
	font-style: normal;
}
</style>
