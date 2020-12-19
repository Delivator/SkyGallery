<template>
  <v-app-bar app>
    <router-link to="/" class="title-link" :class="themedText">
      <v-img
        alt="Skynet Logo"
        class="shrink mr-2"
        contain
        :src="require('../assets/skygallery_logo.svg')"
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
      class="portal-selector"
      single-line
    ></v-select>
  </v-app-bar>
</template>

<style scoped>
.title-link {
  display: contents;
  text-decoration: none;
}

.portal-selector {
  max-width: 12rem;
  top: 5px;
}
</style>

<script>
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
  name: "Header",

  props: ["themedText"],

  data: () => ({
    portals: [
      {
        name: "SiaSky.net",
        link: "https://siasky.net",
      },
    ],
  }),

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
  },

  beforeMount() {
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
};
</script>
