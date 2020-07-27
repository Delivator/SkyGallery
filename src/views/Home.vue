<template>
  <v-container class="text-center">
    <v-row>
      <v-col cols="12" class="head">
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
        <span class="display-1">
          Start by creating a
          <v-btn color="primary" to="new" outlined
            ><v-icon left>add</v-icon>new album</v-btn
          >
          or open an existing one
        </span>
        <v-text-field
          single-line
          placeholder="Paste Skynet or sia:// link"
          outlined
          style="width: 14rem;"
          @input="openAlbum"
          v-model="linkInput"
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
.subtext > span {
  margin-right: 1rem;
}
.head.mobile-true {
  margin: 5rem 0;
}
.logo.mobile-true {
  margin-bottom: 5rem;
}
</style>

<script>
import { getAlbum } from "../mixins/getAlbum";
import { isMobile } from "mobile-device-detect";

let openAlbumTimeout = null;

export default {
  name: "Home",
  props: ["portals", "skylinkRegex", "alertBox"],
  mixins: [getAlbum],
  data: () => ({
    linkInput: "",
    loading: false,
    inputError: "",
    isMobile,
  }),

  mounted: function () {
    document.addEventListener("dragenter", this.dragoverHandler);
  },

  beforeRouteLeave: function (to, from, next) {
    document.removeEventListener("dragenter", this.dragoverHandler);
    next();
  },

  methods: {
    openAlbum: function () {
      if (openAlbumTimeout !== null) clearTimeout(openAlbumTimeout);
      this.inputError = "";
      if (!this.linkInput) return;
      openAlbumTimeout = setTimeout(() => {
        this.loading = true;
        let skylink = this.linkInput.replace("sia://", "");
        skylink = skylink.replace("https://skygallery.xyz/", "");
        skylink = skylink.replace(document.location, "");
        skylink = skylink.replace("a/", "");
        this.portals.forEach((portal) => {
          skylink = skylink.replace(portal.link, "");
        });
        skylink = skylink.replace(/\//g, "");
        if (!this.skylinkRegex.test(skylink)) {
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

    dragoverHandler: function (event) {
      if (event.dataTransfer && event.dataTransfer.files)
        this.$router.push("/new");
    },
  },
};
</script>
