<template>
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
</template>

<style scoped>
.layout-selector,
.layout-selector .v-image {
  height: 100%;
}
</style>

<script>
export default {
  props: ["layout", "items"],
  data: function () {
    return {
      //
    };
  },
};
</script>
