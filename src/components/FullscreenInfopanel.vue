<template>
  <div class="info-panel pa-6 text-left" :class="infoClass">
    <span class="text-h6">File Info</span>
  </div>
</template>

<style scoped>
.info-panel {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100vh;
  background-color: black;
  transition: right 0.2s;
}

.showinfo-true {
  right: 0px;
}

.info-panel.mobile-true {
  width: 100vw;
  left: 0;
}
</style>

<script>
export default {
  name: "FullscreenInfopanel",
  props: ["userSettings"],

  computed: {
    infoClass() {
      return `mobile-${this.$vuetify.breakpoint.mobile} showinfo-${this.userSettings.showInfo}`;
    },
  },
};
</script>
