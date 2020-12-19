<template>
  <div>
    <v-footer v-if="isEmbed" padless fixed>
      <v-row justify="center">
        <v-col class="py-3 text-center" cols="12" @click="openAlbum">
          <a
            :class="themedText"
            href="https://github.com/Delivator/SkyGallery"
            target="_blank"
            rel="noopener noreferrer"
            >SkyGallery</a
          >
          <span :class="themedText" class="version-tag"> v{{ version }}</span>
          &ndash; Hosted on
          <a
            :class="themedText"
            href="https://siasky.net/"
            target="_blank"
            rel="noopener noreferrer"
            >Skynet</a
          >
          &ndash; Made by
          <a
            :class="themedText"
            href="https://github.com/Delivator"
            target="_blank"
            rel="noopener noreferrer"
            >Delivator</a
          >
        </v-col>
      </v-row>
    </v-footer>
    <v-footer v-if="!isEmbed">
      <v-row justify="center">
        <v-col class="py-3 text-center" cols="12">
          Made with 💚 by
          <a
            :class="themedText"
            href="https://github.com/Delivator"
            target="_blank"
            rel="noopener noreferrer"
            >Delivator</a
          >
          &ndash;
          <a
            :class="themedText"
            href="https://github.com/Delivator/SkyGallery"
            target="_blank"
            rel="noopener noreferrer"
            >Source code</a
          >
          &ndash;
          <span :class="themedText" class="version-tag">v{{ version }}</span>
          &ndash;
          <v-tooltip :value="showRefTooltip && refVisible" top>
            <template v-slot:activator="{ on }">
              <v-btn
                :outlined="!(showRefTooltip && refVisible)"
                color="#FB542B"
                small
                dark
                href="https://brave.com/sky643"
                target="_blank"
                rel="noopener noreferrer"
                v-on="on"
                @mouseover="refMouseover"
                @mouseleave="refMouseleave"
                v-observe-visibility="refVisibility"
                >Try Brave Browser*</v-btn
              >
            </template>
            <span :class="refHover ? '' : 'green--text'">{{
              refHover
                ? "*This is a Brave creators refferal link"
                : "Earn crypto by browsing the internet"
            }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                @click="$emit('update:darkMode', !darkMode)"
                absolute
                right
                icon
              >
                <v-icon>{{
                  darkMode ? "brightness_high" : "brightness_low"
                }}</v-icon>
              </v-btn>
            </template>
            <span>Toggle dark mode</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-footer>
  </div>
</template>

<style scoped>
.version-tag {
  font-family: monospace;
}
</style>

<script>
export default {
  name: "Footer",
  props: ["darkMode", "themedText", "version"],
  data: () => ({
    showRefTooltip: false,
    refVisible: false,
    refHover: false,
  }),
  methods: {
    refMouseover() {
      this.showRefTooltip = false;
      this.refHover = true;
    },

    refMouseleave() {
      setTimeout(() => {
        this.refHover = false;
      }, 100);
    },

    refVisibility(isVisible) {
      this.refVisible = isVisible;
    },
  },

  // mounted: function() {
  //   setTimeout(() => {
  //     this.showRefTooltip = true;
  //   }, 5000);
  // },
};
</script>
