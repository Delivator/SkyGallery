<template>
  <div class="info-panel pa-4 text-left" :class="infoClass">
    <h6 class="text-h6">
      <v-btn fab text small @click="$emit('update:showInfo', false)" top>
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
        <v-list-item-subtitle v-html="fileSize()"></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line v-if="item.exif && item.exif.CreateDate">
      <v-list-item-avatar>
        <v-icon>today</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title v-text="shortDate"></v-list-item-title>
        <v-list-item-subtitle v-text="longDate"></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line v-if="item.exif">
      <v-list-item-avatar>
        <v-icon>camera</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title :title="`${item.exif.Make} ${item.exif.Model}`">
          {{ item.exif.Make }} {{ item.exif.Model }}
        </v-list-item-title>
        <v-list-item-subtitle v-html="exifData()"></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      two-line
      v-if="item.exif && item.exif.latitude"
      :href="`https://www.google.com/maps/search/${readbleGps()}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <v-list-item-avatar>
        <v-icon>place</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>GPS Location</v-list-item-title>
        <v-list-item-subtitle v-html="readbleGps()"></v-list-item-subtitle>
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
  background-color: white;
  transition: right 0.2s;
  z-index: 1;
}

.info-panel.dark-true {
  background-color: black;
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
  props: ["item", "showInfo", "darkMode"],
  mixins: [utils],

  computed: {
    shortDate() {
      return this.item.exif.CreateDate.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    },

    longDate() {
      return this.item.exif.CreateDate.toLocaleDateString(undefined, {
        hour: "numeric",
        minute: "numeric",
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    infoClass() {
      return `mobile-${this.$vuetify.breakpoint.mobile} showinfo-${this.showInfo} dark-${this.darkMode}`;
    },
  },

  methods: {
    pxToMP() {
      let mp = (this.item.width * this.item.height) / 10 ** 5;
      mp = Math.round(mp) / 10;
      return mp;
    },

    readbleGps() {
      return `${Math.round(this.item.exif.latitude * 10 ** 5) / 10 ** 5}, ${
        Math.round(this.item.exif.longitude * 10 ** 5) / 10 ** 5
      }`;
    },

    fileSize() {
      if (this.item.width) {
        const text =
          `<span class="mr-3">${this.pxToMP()} MP</span>` +
          `<span>${this.item.width} x ${this.item.height}</span>`;
        return text;
      } else {
        return "Loading...";
      }
    },

    exifData() {
      if (this.item.type !== "image") return false;
      if (this.item.exif) {
        const text =
          `<span class="mr-2">ƒ/${this.item.exif.FNumber}</span>` +
          `<span class="mr-2">1/${1 / this.item.exif.ExposureTime}</span>` +
          `<span class="mr-2">${this.item.exif.FocalLength} mm</span>` +
          `<span>ISO ${this.item.exif.ISO}</span>`;
        return text;
      } else {
        return "Loading...";
      }
    },
  },
};
</script>
