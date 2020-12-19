<template>
  <v-app>
    <v-app-bar v-if="!isEmbed" app>
      <router-link to="/" class="title-link" :class="themedText">
        <v-img
          alt="Skynet Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/skygallery_logo.svg')"
          transition="scale-transition"
          width="30"
        />
        <v-toolbar-title>SkyGallery</v-toolbar-title>
      </router-link>

      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" class="mr-4">help</v-icon>
        </template>
        <span>Got a slow portal?<br />Try a different one!</span>
      </v-tooltip>
      <v-select
        :items="portals"
        item-text="name"
        item-value="url"
        item-disabled="disabled"
        label="Change Skynet Portal"
        @change="changePortal"
        return-object
        style="max-width: 12rem; top: 5px"
        single-line
      ></v-select>
    </v-app-bar>
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
    <Footer
      :darkMode.sync="darkMode"
      :themedText="themedText"
      :version="version"
    />
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

.title-link {
  display: contents;
  text-decoration: none;
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

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

// https://stackoverflow.com/a/2450976/6287225
function shuffleArray(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default {
  name: "App",

  components: { Footer },

  data() {
    return {
      version: version.version,
      portals: [
        {
          name: "SiaSky.net",
          link: "https://siasky.net",
        },
      ],
      isEmbed: false,
      alerts: [],
      pageTitle: "SkyGallery - Media Gallery powered by Skynet",
      darkMode: JSON.parse(localStorage.getItem("darkMode")) ?? true,
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

  watch: {
    darkMode(val) {
      this.$vuetify.theme.dark = this.darkMode;
      localStorage.darkMode = val;
    },
  },

  computed: {
    themedText() {
      return this.darkMode ? "white--text" : "black--text";
    },
  },

  methods: {
    changePortal(portal) {
      const hnsRegex = /^(.*)\.hns\..*$/;
      const base32Regex = /^([a-z0-9]{55})\..*$/;
      const newUrl = new URL(location);
      const newPortal = new URL(portal.link);

      if (hnsRegex.test(newUrl.hostname)) {
        const hnsSub = newUrl.hostname.match(hnsRegex)[1];
        newPortal.hostname = newPortal.hostname.replace("www.", "");
        newUrl.hostname = `${hnsSub}.hns.${newPortal.hostname}`;
      } else if (base32Regex.test(newUrl.hostname)) {
        const base32Sub = newUrl.hostname.match(base32Regex)[1];
        newPortal.hostname = newPortal.hostname.replace("www.", "");
        newUrl.hostname = `${base32Sub}.${newPortal.hostname}`;
      } else {
        newUrl.hostname = newPortal.hostname;
      }

      location.href = newUrl.href;
    },

    openAlbum() {
      let win = window.open(window.location);
      win.focus();
    },
  },

  beforeMount() {
    this.isEmbed = inIframe();
    const trustedPortals = "https://siastats.info/dbs/skynet_current.json";
    this.$vuetify.theme.dark = this.darkMode;

    fetch(trustedPortals)
      .then((response) => {
        if (response.status === 200) return response.json();
      })
      .then((data) => {
        if (!data || data.length < 1 || !data[0].name || !data[0].link)
          return false;
        data = shuffleArray(data);
        data.forEach((portal, index) => {
          if (portal.link.includes(document.location.hostname)) {
            data[index].disabled = portal.link.includes(
              document.location.hostname
            );
            data.unshift(data[index]);
            data.splice(index + 1, 1);
          }
        });
        this.portals = data;
      })
      .catch((error) => this.alertBox.send("error", error));
  },
};
</script>
