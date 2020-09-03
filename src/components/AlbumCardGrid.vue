<template>
  <div v-if="skylink && items.length > 0">
    <p class="title text-h5">{{ title }}</p>
    <v-row v-if="layout === 0" no-gutters class="layout-selector">
      <v-col cols="12">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[0].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
    </v-row>
    <v-row v-else-if="layout === 1" no-gutters class="layout-selector">
      <v-col cols="6">
        <v-img
          :aspect-ratio="2 / 3"
          :src="`/${items[0].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
      <v-col cols="6">
        <v-img
          :aspect-ratio="2 / 3"
          :src="`/${items[1].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
    </v-row>
    <v-row v-else-if="layout === 2" no-gutters class="layout-selector">
      <v-col cols="6">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[0].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
      <v-col cols="6">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[1].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
      <v-col cols="12">
        <v-img
          :aspect-ratio="8 / 3"
          :src="`/${items[2].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
    </v-row>
    <v-row v-else-if="layout === 3" no-gutters class="layout-selector">
      <v-col cols="6">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[0].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
      <v-col cols="6">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[1].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
      <v-col cols="6">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[2].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
      <v-col cols="6">
        <v-img
          :aspect-ratio="4 / 3"
          :src="`/${items[3].skylinks.thumbnail}`"
        ></v-img>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.layout-selector,
.layout-selector .v-image {
  height: 100%;
}

.title {
  position: absolute;
  z-index: 1;
  background-color: rgba(27, 27, 27, 0.3);
  padding: 16px;
  display: flex;
  width: 100%;
}
</style>

<script>
import { utils } from "../mixins/utils";

export default {
  mixins: [utils],
  props: ["layout", "skylink"],
  data: function () {
    return {
      items: [],
      title: "",
    };
  },

  methods: {
    loadAlbum: function () {
      if (!this.skylink) return;
      this.getAlbumData(this.skylink)
        .then((data) => {
          this.items = data.files.filter((item) => {
            return /^(image|video)$/.test(item.type);
          });
          this.title = data.title;
        })
        .catch(() => this.alertBox.send("error", "Error getting album data"));
    },
  },

  watch: {
    skylink: function () {
      this.loadAlbum();
    },
  },

  beforeMount: function () {
    this.loadAlbum();
  },
};
</script>
