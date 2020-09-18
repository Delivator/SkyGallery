<template>
  <v-app>
    <v-app-bar v-if="!isEmbed" app color="secondary">
      <router-link to="/" class="white--text title-link">
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
            :key="alert.id"
            v-model="alert.show"
            :type="alert.type"
            dismissible
            transition="slide-y-transition"
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
        :showShare="showShare"
        :isEmbed="isEmbed"
        :isMobile="isMobile"
      />
    </v-main>
    <v-footer v-if="isEmbed" padless fixed>
      <v-row justify="center">
        <v-col class="py-3 text-center" cols="12" @click="openAlbum">
          <a
            class="white--text"
            href="https://github.com/Delivator/SkyGallery"
            target="_blank"
            rel="noopener noreferrer"
            >SkyGallery</a
          >
          <span class="white--text version-tag"> v{{ version }}</span>
          &ndash; Hosted on
          <a
            class="white--text"
            href="https://siasky.net/"
            target="_blank"
            rel="noopener noreferrer"
            >Skynet</a
          >
          &ndash; Made by
          <a
            class="white--text"
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
            class="white--text"
            href="https://github.com/Delivator"
            target="_blank"
            rel="noopener noreferrer"
            >Delivator</a
          >
          &ndash;
          <a
            class="white--text"
            href="https://github.com/Delivator/SkyGallery"
            target="_blank"
            rel="noopener noreferrer"
            >Source code</a
          >
          &ndash;
          <span class="white--text version-tag">v{{ version }}</span>
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
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style>
html {
  overflow: auto;
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

.version-tag {
  font-family: monospace;
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
import { isMobile } from "mobile-device-detect";
import version from "../package.json";

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

  data() {
    return {
      version: version.version,
      portals: [
        {
          name: "SiaSky.net",
          link: "https://siasky.net",
        },
      ],
      showShare: false,
      isEmbed: false,
      refHover: false,
      showRefTooltip: false,
      refVisible: false,
      isMobile,
      alerts: [],
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

  methods: {
    changePortal(portal) {
      let newUrl = new URL(portal.link);
      document.location.href = document.location.href.replace(
        document.location.origin,
        newUrl.origin
      );
    },

    openAlbum() {
      let win = window.open(window.location);
      win.focus();
    },

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

  beforeMount() {
    this.isEmbed = inIframe();
    const trustedPortals = "https://siastats.info/dbs/skynet_current.json";

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

  // mounted: function() {
  //   setTimeout(() => {
  //     this.showRefTooltip = true;
  //   }, 5000);
  // },
};
</script>
