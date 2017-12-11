<!-- =================================================
 Vue Template
================================================== -->
<template>
  <transition
    name="modal"
    v-on:after-enter="transitionEntered = true"
    >
    <div class="modal-mask">
      <div class="modal-wrapper" @click.self="triggerToCloseButton = true">
        <div class="modal-container" :style="{width: modalWidth + 'px', height: modalHeight + 'px'}">
          <close-button
            :button-width="72"
            :button-image="'close-button.png'"
            :parent-margin-right="modalMarginLeft"
            :parent-margin-top="modalMarginTop"
            :parent-transition-entered="transitionEntered"
            :button-needs-to-be-removed="triggerToCloseButton"
            @button-clicked="triggerToCloseButton = true"
            @button-removed="$emit('close-modal')"
          />
          <div class="modal-container-inside">
            <slot name="header">
              default header
            </slot>
            <slot name="image">
            </slot>
            <slot name="text">
              default text
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>


<!-- =================================================
 Vue Script
================================================== -->
<script>
import CloseButton from '@/components/CloseButton.vue'

export default {
  name: 'modal-box',
  data () {
    return {
      transitionEntered: false,
      triggerToCloseButton: false
    }
  },
  components: {
    CloseButton
  },
  props: {
    modalWidth: {
      type: Number
    },
    modalHeight: {
      type: Number
    },
    modalMarginLeft: {
      type: Number
    },
    modalMarginTop: {
      type: Number
    }
  },
  computed: {
    getParentMarginRight () {
      return window.innerWidth * 0.05
    },
    getParentMarginTop () {
      return window.innerHeight * 0.05
    }
  }
}
</script>


<!-- =================================================
 Vue Style
================================================== -->
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  /*width: 90%;*/
  /*height: 90%;*/
  margin: 0px auto;
  /*padding: 20px 30px;*/
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  /*color: #42b983;*/
}

.modal-container-inside {
  padding: 20px 30px;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(0.9);
  transform: scale(0.9);
}
</style>
