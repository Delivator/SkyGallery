<template>
  <v-app>
    <v-app-bar app color="secondary">
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

    <v-content>
      <router-view :portals="portals" :version="version" />
    </v-content>
    <v-footer>
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

<script>
import version from "../package.json";

export default {
  name: "App",

  data: () => ({
    version: version.version,
    portals: [
      {
        name: "SiaSky.net",
        link: "https://siasky.net"
      }
    ]
  }),
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
      .catch(console.error);
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
