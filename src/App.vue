<template>
  <v-app>
    <Header v-if="!isEmbed" :themedText="themedText" />

    <v-container fluid class="absolute">
      <v-row class="alerts absolute" :class="isEmbed ? '' : 'alerts-top'">
        <v-col md="4" sm="6" xs="12">
          <v-alert
            v-for="alert in alerts"
            v-model="alert.show"
            dismissible
            transition="slide-y-transition"
            :key="alert.id"
            :type="alert.type"
            >{{ alert.text }}</v-alert
          >
        </v-col>
      </v-row>
    </v-container>

    <v-main>
      <router-view
        :portals="portals"
        :version="version"
        :alertBox="alertBox"
        :isEmbed="isEmbed"
        :pageTitle="pageTitle"
        :darkMode="darkMode"
        :themedText="themedText"
      />
    </v-main>
    <Footer :themedText="themedText" :version="version" />
  </v-app>
</template>

<style>
html {
  overflow: auto;
}

html.noscroll {
  overflow: hidden;
}

::-webkit-scrollbar-track,
::-webkit-scrollbar-corner,
::-webkit-scrollbar {
  background-color: #202020;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #555;
}
</style>

<style scoped>
.absolute {
  position: absolute;
}

.alerts {
  width: 100%;
  z-index: 100;
  pointer-events: none;
}

.alerts-top {
  top: 4rem;
}

.v-alert {
  pointer-events: all;
}
</style>

<script>
import sha256 from "crypto-js/sha256";
import version from "../package.json";
import Footer from "./components/Footer";
import Header from "./components/Header";

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export default {
  name: "App",

  components: { Footer, Header },

  data() {
    return {
      version: version.version,
      isEmbed: false,
      alerts: [],
      pageTitle: "SkyGallery - Media Gallery powered by Skynet",
      alertBox: {
        show: false,
        type: "info",
        text: "",
        send: (type, message, timeout) => {
          if (!timeout || isNaN(timeout) || timeout < 1) timeout = 7500;
          if (!message || message === "") message = "Unknown error";
          if (!type || !/success|info|warning|error/.test(type)) type = "info";
          if (type === "error") {
            if (message instanceof Error) message = message.message;
            console.error(message);
          }

          let id = sha256(Math.random().toString()).toString();

          this.alerts.push({
            id,
            show: true,
            type,
            text: message,
            timeout: setTimeout(() => {
              this.alerts.find((alert) => alert.id === id).show = false;
            }, timeout),
          });
        },
      },
    };
  },

  computed: {
    darkMode() {
      return this.$store.state.userSettings.darkMode;
    },
    themedText() {
      return this.darkMode ? "white--text" : "black--text";
    },
  },

  watch: {
    darkMode(val) {
      this.$vuetify.theme.dark = val;
    },
  },

  methods: {
    openAlbum() {
      let win = window.open(window.location);
      win.focus();
    },
  },

  beforeMount() {
    this.isEmbed = inIframe();
    this.$store.dispatch("getProfile");
    this.$store.dispatch("getUserSettings");
  },
};
</script>
