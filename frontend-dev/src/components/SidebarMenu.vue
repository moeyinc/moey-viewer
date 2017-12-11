<!-- =================================================
 Vue Template
================================================== -->
<template>
  <aside class="sidebar-wrapper" :style="getSidebarStyle">
    <sidebar-category
      v-for="category in categories"
      :key="category.id"
      :category-id="category.id"
      :category-label="category.label"
      :category-icon="category.icon"
      :regular-fill-color="category.color"
      :active-fill-color="baseColor"
      :category-height="sidebarWidth"
      :icon-width="75"
      :icon-height="75"
      :initial-state="(category.id === 0) ? true : false"
      @toggled="toggled"
    />
  </aside>
</template>

<!-- =================================================
 Vue Script
================================================== -->
<script>
import SidebarCategory from '@/components/SidebarCategory.vue'

export default {
  name: 'sidebar-menu',
  components: {
    SidebarCategory
  },
  props: {
    categories: {
      type: Array
    },
    sidebarWidth: {
      type: Number
    },
    baseColor: {
      type: String
    },
    opacity: {
      type: Number
    }
  },
  computed: {
    getSidebarStyle () {
      return {
        width: this.sidebarWidth + 'px',
        'background-color': this.baseColor,
        opacity: this.opacity
      }
    }
  },
  methods: {
    toggled (arg) {
      this.$emit('toggled', arg)
    }
  }
}
</script>

<!-- =================================================
 Vue Style
================================================== -->
<style scoped>
.sidebar-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;

}
</style>
