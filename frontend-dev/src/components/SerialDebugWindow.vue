<!-- =================================================
 Vue Template
================================================== -->
<template>
  <div class="serial-debug-window">
    <div class="serial-encoder-value-container">
      <p class="serial-encoder-value">
        Encoder A: {{serialValA}}
      </p>
      <p class="serial-encoder-value">
        Encoder B: {{serialValB}}
      </p>
    </div>
  </div>
</template>

<!-- =================================================
 Vue Script
================================================== -->
<script>
export default {
  name: 'calibration-button',
  data () {
    return {
      serialValA: 0,
      serialValB: 0
    }
  },
  created () {
    this.addEventListenerForSocket()
  },
  methods: {
    /*****************************************
    // listening to web socket events
    *****************************************/
    addEventListenerForSocket () {
      this.$bus.$on('dev-rotate-a', ($event) => {
        // console.log('on rotate-a: ', $event)
        this.serialValA = $event
      })
      this.$bus.$on('dev-rotate-b', ($event) => {
        // console.log('on rotate-b: ', $event)
        this.serialValB = $event
      })
    }
  }
}
</script>

<!-- =================================================
 Vue Style
================================================== -->
<style scoped>
.serial-debug-window {
  position: absolute;
  top: 0;
  left: 80px;
  height: 48px;
  width: 140px;
  background-color: green;
}

.serial-encoder-value-container {
  height: 100%;
  padding: 7px 10px;
}

.serial-encoder-value {
  font-size: 12px;
  color: white;
  padding-top: 3px;
}
</style>
