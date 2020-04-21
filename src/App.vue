<template>
  <v-app>
    <v-app-bar v-if="!isEmbed" app color="secondary">
      <router-link to="/" class="white--text title-link">
        <v-img
          alt="Skynet Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/skynet-logo.svg')"
          transition="scale-transition"
          width="40"
        />
        <v-toolbar-title>SkyGallery</v-toolbar-title>
      </router-link>

      <v-spacer></v-spacer>

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
      <v-row class="alerts absolute">
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

    <v-content>
      <router-view
        :portals="portals"
        :skylinkRegex="skylinkRegex"
        :version="version"
        :alertBox="alertBox"
        :showShare="showShare"
      />
    </v-content>
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
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style>
/* Remove persistent scrollbar */
html,
body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
  width: 0;
  background: transparent;
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
  top: 4rem;
  width: 100%;
  z-index: 100;
  pointer-events: none;
}

.v-alert {
  pointer-events: all;
}
</style>

<script>
import { MD5 } from "crypto-js";
import version from "../package.json";

export default {
  name: "App",

  data() {
    return {
      version: version.version,
      portals: [
        {
          name: "SiaSky.net",
          link: "https://siasky.net"
        }
      ],
      skylinkRegex: /^[a-zA-Z0-9-_]{46}/gm,
      alerts: [],
      alertBox: {
        show: false,
        type: "info",
        text: "",
        send: (type, message, timeout) => {
          if (!timeout || isNaN(timeout) || timeout < 1) timeout = 7500 * 1000;
          if (!message || message === "") message = "Unknown error";
          if (!type || !/success|info|warning|error/.test(type)) type = "info";
          if (type === "error") {
            if (message instanceof Error) message = message.message;
            console.error(message);
          }

          let id = MD5(Math.random().toString()).toString();

          this.alerts.push({
            id,
            show: true,
            type,
            text: message,
            timeout: setTimeout(() => {
              this.alerts.find(alert => alert.id === id).show = false;
            }, timeout)
          });
        }
      },
      showShare: false,
      isEmbed: false
    };
  },
  beforeMount: function() {
    const trustedPortals = "https://siastats.info/dbs/skynet_current.json";
    fetch(trustedPortals)
      .then(response => {
        if (response.status === 200) return response.json();
      })
      .then(data => {
        if (!data || data.length < 1 || !data[0].name || !data[0].link)
          return false;
        data.forEach((portal, index) => {
          data[index].disabled = portal.link.includes(
            document.location.hostname
          );
        });
        this.portals = data;
      })
      .catch(error => this.alertBox.send("error", error));
  },
  methods: {
    changePortal: function(portal) {
      let newUrl = new URL(portal.link);
      document.location.href = document.location.href.replace(
        document.location.origin,
        newUrl.origin
      );
    }
  }
};
</script>
