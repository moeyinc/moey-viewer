<!-- =================================================
 Vue Template
================================================== -->
<template>
  <div
    v-show="isSVGReady"
    class="category-wrapper"
    :style="[getWrapperSize, getWrapperColor]"
    @click="toggle()"
    >
    <div class="container">
      <div class="category-icon">
      </div>
      <div class="category-label" :style="getLabelStyle">
        {{categoryLabel}}
      </div>
    </div>
  </div>
</template>

<!-- =================================================
 Vue Script
================================================== -->
<script>
import svgMixin from '@/mixin-svg.js'

export default {
  name: 'sidebar-category',
  data () {
    return {
      isActive: false,
      isSVGReady: false
    }
  },
  mixins: [
    svgMixin
  ],
  props: {
    categoryId: Number,
    categoryLabel: String,
    categoryIcon: String,
    regularFillColor: String,
    activeFillColor: String,
    categoryHeight: Number,
    iconWidth: Number,
    iconHeight: Number,
    initialState: Boolean
  },
  created () {
    if (this.initialState === true) {
      this.isActive = true
    }
  },
  mounted () {
    // svg is not ready
    this.isSVGReady = false

    let targetElement = this.$el.getElementsByClassName('category-icon')[0]

    // set initial fill
    let fill
    if (this.initialState === true) {
      fill = this.activeFillColor
    } else {
      fill = this.regularFillColor
    }

    // generate inline svg
    this.generateInlineSVG(targetElement, this.categoryIcon, {
      width: this.iconWidth,
      height: this.iconWidth,
      fill: fill
    })

    // now the svg is ready to show
    this.isSVGReady = true

    console.log('mounted done')
  },
  // updated () {
  //   console.log('updated')
  //   if (!this.isSVGReady) {
  //     let replacedSVG = this.$el.getElementsByClassName('replaced-svg')[0]
  //     if (replacedSVG) {
  //       // now the svg is ready to show
  //       this.isSVGReady = true
  //     }
  //   }
  // },
  watch: {
    // change elevation and svg fill color
    isActive (val) {
      let svg = this.$el.getElementsByClassName('svg')[0]

      if (val === true) {
        // active
        svg.style.fill = this.activeFillColor
      } else {
        // inactive
        svg.style.fill = this.regularFillColor
      }
    },
    isSVGReady (val) {
      console.log('isSVGReady watched: ', val)
    }
  },
  computed: {
    getWrapperSize () {
      return {
        height: this.categoryHeight + 'px'
      }
    },
    getWrapperColor () {
      if (this.isActive) {
        return {
          'background-color': this.regularFillColor
        }
      } else {
        return {
          'background-color': this.activeFillColor
        }
      }
    },
    getLabelStyle () {
      if (this.isActive) {
        return {
          'color': this.activeFillColor
        }
      } else {
        return {
          'color': this.regularFillColor
        }
      }
    }
  },
  methods: {
    toggle () {
      this.isActive = !this.isActive
      let arg = {
        id: this.categoryId,
        state: this.isActive
      }
      this.$emit('toggled', arg)
    }
  }
}
</script>

<!-- =================================================
 Vue Style
================================================== -->
<style scoped>
.category-wrapper {
  text-align: center;
  position: relative;
  padding: 5px;
  height: 100%;
}

.container {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translateY(-50%) translateX(-50%);
  transform: translateY(-50%) translateX(-50%);
}

.category-label {
  font-size: 14px;
}
</style>
