<!-- =================================================
 Vue Template
================================================== -->
<template>
  <div id="page-wrapper">
    <div id="threejs-wrapper" @mousedown.prevent="threeClicked($event)">
    </div>
    <modal-box
      v-if="isModalDisplayed"
      :modal-width="$store.state.size.appWidth * 0.9"
      :modal-height="$store.state.size.appHeight * 0.9"
      :modal-margin-left="$store.state.size.appWidth * 0.05"
      :modal-margin-top="$store.state.size.appHeight * 0.05"
      @close-modal="closeModal()">
      <h1 slot="header" class="modal-header">{{getModalContent.title}}</h1>
      <img slot="image" class="modal-image" :src="require('@/assets/imgs/' + getModalContent.image)">{{getModalContent.text}}</img>
      <p slot="text" class="modal-text">{{getModalContent.text}}</p>
    </modal-box>
    <sidebar-menu
      :categories="categories"
      :sidebar-width="120"
      :base-color="'#ffffff'"
      :opacity="0.6"
      @toggled="updateCategories"
    />
    <serial-debug-window/>
  </div>
</template>

<!-- =================================================
 Vue Script
================================================== -->
<script>
import MixinThreejs from '@/mixin-threejs.js'
import ModalBox from '@/components/ModalBox.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import SerialDebugWindow from '@/components/SerialDebugWindow.vue'
import pins from '@/assets/js/pins.json'
import categories from '@/assets/js/categories.json'
import isNaturalNumber from 'is-natural-number'

export default {
  name: 'home',
  mixins: [MixinThreejs],
  components: {
    ModalBox,
    SidebarMenu,
    SerialDebugWindow
  },
  data () {
    return {
      pins: pins,
      categories: categories,
      isModalDisplayed: false,
      selectedModalId: -1,
      T: {
        renderer: null,
        scene: null,
        controls: null,
        camera: null,
        raycaster: null,
        mouse: null,
        sphere: null,
        balloonMesh: null,
        balloons: [],
        objectGroup: null,
        lastFrameNumber: 0
      }
    }
  },
  created () {
    this.addEventListenerForSocket()
  },
  mounted () {
    const T = this.$data.T
    // once all the resources are loaded, set up ThreeJS
    let tasks = [this.loadOBJ(T)]
    Promise.all(tasks).then(() => {
      // console.log('obj files are loaded!')
      this.setupThreeJS()
      this.updatePinsToDisplay()
    })
    // this.setupThreeJS()
    // this.updatePinsToDisplay()
  },
  computed: {
    getModalContent () {
      if (!isNaturalNumber(this.selectedModalId, {includeZero: true})) {
        console.error('selected modal id is not valid')
        return
      }

      for (let i = 0; i < this.pins.length; i++) {
        if (this.pins[i].id === this.selectedModalId) {
          return this.pins[i]
        }
      }

      console.error('a pin with the given selectedModalId was not found: ', this.selectedModalId)
    }
  },
  methods: {
    /*****************************************
    // listening to web socket events
    *****************************************/
    addEventListenerForSocket () {
      this.$bus.$on('rotate-a', ($event) => {
        // console.log('on rotate-a: ', $event)
        // this.T.camera.rotation.x = $event
        this.T.objectGroup.rotation.x = $event
      })
      this.$bus.$on('rotate-b', ($event) => {
        // console.log('on rotate-b: ', $event)
        // this.T.camera.rotation.y = $event
        this.T.objectGroup.rotation.y = $event
      })
    },
    /*****************************************
    // when a category button toggled, update selected categories array
    *****************************************/
    updateCategories (data) {
      for (let i = 0; i < this.categories.length; i++) {
        if (this.categories[i].id === data.id) {
          this.categories[i].selected = data.state
          this.updatePinsToDisplay() // update pins in three.js
          return
        }
      }

      console.error('a category with the given id was not found: ', data)
    },
    closeModal () {
      for (let i = 0; i < this.T.balloons.length; i++) {
        if (this.T.balloons[i].name === this.selectedModalId) {
          // reset the color back to the initial one
          this.T.balloons[i].traverse((child) => {
            // console.log(child.initialColor)
            child.material.color.set(child.initialColor)
          })
        }
      }

      this.isModalDisplayed = false
      this.selectedModalId = -1
    }
  }
}
</script>

<!-- =================================================
 Vue Style
================================================== -->
<style scoped>
#page-wrapper {
  height: 100%;
}

#threejs-wrapper {
  height: 100%;
}

h1.modal-header {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
}

img.modal-image {
  object-fit: cover;
  width: 100%;
  max-height: 600px;
  margin-bottom: 30px;
}

p.modal-text {
  font-size: 18px;
}

</style>
