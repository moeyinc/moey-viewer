<!-- =================================================
 Vue Template
================================================== -->
<template>
  <img
    v-if="parentTransitionEntered"
    v-show="!buttonNeedsToBeRemoved"
    class="close-button"
    :src="require('@/assets/imgs/' + buttonImage)"
    :style="getButtonStyle"
    @click="$emit('button-clicked')"
  />
</template>

<!-- =================================================
 Vue Script
================================================== -->
<script>
export default {
  name: 'close-button',
  props: {
    buttonWidth: {
      type: Number
    },
    buttonImage: {
      type: String
    },
    parentMarginRight: {
      type: Number,
      default: 0
    },
    parentMarginTop: {
      type: Number,
      default: 0
    },
    parentTransitionEntered: {
      type: Boolean
    },
    buttonNeedsToBeRemoved: {
      type: Boolean,
      default: false
    }
  },
  updated () {
    if (this.buttonNeedsToBeRemoved === true) {
      this.$emit('button-removed')
    }
  },
  computed: {
    getButtonStyle () {
      let buttonMarginRight = this.parentMarginRight - this.buttonWidth / 2
      let buttonMarginTop   = this.parentMarginTop   - this.buttonWidth / 2

      return {
        'width': this.buttonWidth + 'px',
        'height': this.buttonWidth + 'px',
        'right': buttonMarginRight + 'px',
        'top': buttonMarginTop + 'px'
      }
    }
  }
}
</script>

<!-- =================================================
 Vue Style
================================================== -->
<style scoped>
.close-button {
  position: absolute;
}
</style>
