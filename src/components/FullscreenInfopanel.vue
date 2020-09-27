<template>
  <div class="info-panel pa-8 text-left" :class="infoClass">
    <h6 class="text-h6">
      <v-btn fab text small @click="setUserSettings({ showInfo: false })" top>
        <v-icon>close</v-icon>
      </v-btn>
      File Info
    </h6>
    <v-list-item two-line>
      <v-list-item-avatar>
        <v-icon>image</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title
          :title="item.filename"
          v-text="item.filename"
        ></v-list-item-title>
        <v-list-item-subtitle v-html="imageSize()"></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
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
  z-index: 1;
}

.info-panel.mobile-true {
  width: 100vw;
  right: -100vw;
}

.showinfo-true {
  right: 0px !important;
}
</style>

<script>
import { utils } from "../mixins/utils";

export default {
  name: "FullscreenInfopanel",
  props: ["userSettings", "item"],
  mixins: [utils],

  computed: {
    infoClass() {
      return `mobile-${this.$vuetify.breakpoint.mobile} showinfo-${this.userSettings.showInfo}`;
    },
  },

  methods: {
    pxToMP() {
      let mp = (this.item.width * this.item.height) / 10 ** 5;
      mp = Math.round(mp) / 10;
      return mp;
    },

    imageSize() {
      if (this.item.width) {
        const text =
          `<span class="mr-3">${this.pxToMP()} MP</span>` +
          `<span>${this.item.width} x ${this.item.height}</span>`;
        return text;
      } else {
        return "Loading...";
      }
    },
  },
};
</script>
