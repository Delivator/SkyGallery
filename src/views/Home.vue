<template>
  <v-container class="text-center">
    <v-row>
      <v-col cols="12" :class="headerClass">
        <h1 class="display-3 mt-8">Welcome to SkyGallery</h1>
        <span class="subtitle-1"
          >Powered by
          <a
            href="https://siasky.net/"
            target="_blank"
            rel="noopener noreferrer"
            :class="themedText"
            >Skynet</a
          ></span
        >
      </v-col>
      <v-col cols="12" :class="logoClass">
        <v-img
          :src="require('../assets/skynet-logo-animated.svg')"
          contain
          height="300"
          max-height="50vw"
        />
      </v-col>
      <v-col cols="12" class="subtext">
        <span class="display-1 mr-4">
          Create a
          <v-btn color="primary" to="new" outlined>
            <v-icon left>add</v-icon>new album
          </v-btn>
          or open an existing one
        </span>
        <v-text-field
          @input="openAlbum"
          outlined
          single-line
          class="mt-2"
          autocomplete="off album-input"
          v-model="linkInput"
          style="width: 11rem"
          placeholder="Paste SkyGallery link"
          :loading="loading"
          :error-messages="inputError"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" v-if="!loggedIn">
        <v-btn outlined @click="logInUser" :disabled="!this.mySky">
          {{ this.mySky ? "Login with MySky" : "Loading MySky..." }}
          <v-icon right>account_circle</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" md="6" v-if="recentVisits.length > 0">
        <h1 class="text-left subtitle-1 ma-2">Recently visited albums</h1>
        <RecentAlbumTable :items="recentVisits" headerText="Visited" />
      </v-col>
      <v-col cols="12" md="6" v-if="recentCreated.length > 0">
        <h1 class="text-left subtitle-1 ma-2">Newly created albums</h1>
        <RecentAlbumTable :items="recentCreated" headerText="Creation date" />
      </v-col>
      <v-col cols="12" v-if="loggedIn">
        <p class="my-6 text-body-1">
          Welcome back
          <span class="font-weight-bold" v-text="username"></span>.
          <br />
          <a @click="logOutUser" class="font-weight-bold">Log out</a>.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.subtext > * {
  display: inline-block;
}
</style>

<script>
import RecentAlbumTable from "../components/RecentAlbumTable";
import { utils } from "../mixins/utils";

let openAlbumTimeout = null;

export default {
  props: ["alertBox", "themedText"],
  components: { RecentAlbumTable },
  mixins: [utils],
  data: () => ({
    linkInput: "",
    loading: false,
    inputError: "",
  }),

  computed: {
    headerClass() {
      return this.$vuetify.breakpoint.mobile ||
        this.recentVisits.length > 0 ||
        this.recentCreated.length > 0
        ? ""
        : "my-16";
    },

    logoClass() {
      return this.$vuetify.breakpoint.mobile ||
        this.recentVisits.length > 0 ||
        this.recentCreated.length > 0
        ? ""
        : "mb-16";
    },

    loggedIn() {
      return this.$store.state.loggedIn;
    },

    recentVisits() {
      return this.$store.state.userSettings.recentVisits;
    },

    recentCreated() {
      return this.$store.state.userSettings.recentCreated;
    },

    mySky() {
      return this.$store.state.mySky;
    },

    mySkyProfile() {
      return this.$store.state.profile;
    },

    username() {
      if (!this.loggedIn || !this.$store.state.userID) return null;
      return (
        this.mySkyProfile?.username ??
        `${this.$store.state.userID.substr(0, 10)}...`
      );
    },
  },

  watch: {
    loggedIn(newValue) {
      if (newValue) {
        this.alertBox.send(
          "success",
          "Succsessfully logged in with MySky.",
          3000
        );
      } else {
        this.alertBox.send("info", "Logged out");
      }
    },
  },

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

    logInUser() {
      this.$store.dispatch("logInUser");
    },

    logOutUser() {
      this.$store.dispatch("logOutUser");
    },
  },

  mounted() {
    document.addEventListener("dragenter", this.dragoverHandler);
  },

  beforeRouteLeave(to, from, next) {
    document.removeEventListener("dragenter", this.dragoverHandler);
    next();
  },
};
</script>
