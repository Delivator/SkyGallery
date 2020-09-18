<template>
  <v-container class="text-center">
    <v-row>
      <v-col cols="12" class="head" :class="`mobile-${isMobile}`">
        <h1 class="display-3">Welcome to SkyGallery</h1>
        <span class="subtitle-1"
          >Powered by
          <a
            href="https://siasky.net/"
            target="_blank"
            rel="noopener noreferrer"
            class="white--text"
            >Skynet</a
          ></span
        >
      </v-col>
      <v-col cols="12" class="logo" :class="`mobile-${isMobile}`">
        <v-img
          :src="require('../assets/skynet-logo-animated.svg')"
          contain
          height="400"
        />
      </v-col>
      <v-col cols="12" class="subtext">
        <span class="display-1 mr-4">
          Creating a
          <v-btn color="primary" to="new" outlined
            ><v-icon left>add</v-icon>new album</v-btn
          >
          or open an existing one
        </span>
        <v-text-field
          @input="openAlbum"
          outlined
          single-line
          autocomplete="off"
          v-model="linkInput"
          style="width: 15rem"
          placeholder="Paste SkyGallery or sia:// link"
          :loading="loading"
          :error-messages="inputError"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.subtext > * {
  display: inline-block;
}

.head.mobile-false {
  margin: 5rem 0;
}

.logo.mobile-false {
  margin-bottom: 5rem;
}
</style>

<script>
import { utils } from "../mixins/utils";

let openAlbumTimeout = null;

export default {
  name: "Home",
  props: ["portals", "alertBox", "isMobile"],
  mixins: [utils],
  data: () => ({
    linkInput: "",
    loading: false,
    inputError: "",
  }),

  methods: {
    openAlbum() {
      if (openAlbumTimeout !== null) clearTimeout(openAlbumTimeout);
      this.inputError = "";
      if (!this.linkInput) return;
      openAlbumTimeout = setTimeout(() => {
        this.loading = true;
        let skylink = this.extractAlbumSkylink(this.linkInput);
        if (!skylink) {
          this.loading = false;
          this.inputError = "Invalid skylink";
          return (this.loading = false);
        }
        this.checkValidAlbum(skylink)
          .then(() => {
            this.loading = false;
            this.$router.push("/a/" + skylink);
          })
          .catch((error) => {
            this.alertBox.send("error", error);
            this.inputError = "Error fetching album";
            this.loading = false;
          });
      }, 250);
    },

    dragoverHandler(event) {
      if (event.dataTransfer && event.dataTransfer.files)
        this.$router.push("/new");
    },
  },

  beforeRouteLeave(to, from, next) {
    document.removeEventListener("dragenter", this.dragoverHandler);
    next();
  },

  mounted() {
    document.addEventListener("dragenter", this.dragoverHandler);
  },
};
</script>
