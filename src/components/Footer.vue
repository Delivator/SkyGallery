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
      <v-row justify="center" class="row-margin">
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
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                @click="toggleDarkMode"
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

.row-margin {
  margin: 0;
}
</style>

<script>
export default {
  name: "Footer",
  props: ["themedText", "version"],
  computed: {
    darkMode() {
      return this.$store.state.userSettings.darkMode;
    },
  },
  methods: {
    toggleDarkMode() {
      this.$store.commit("setUserSettings", { darkMode: !this.darkMode });
    },
  },
};
</script>
