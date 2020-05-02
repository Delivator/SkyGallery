<template>
  <v-container :class="loading ? 'fill-height' : ''" class="text-center" fluid>
    <v-row justify="center">
      <v-col v-if="loading" cols="12">
        <v-progress-circular
          indeterminate
          color="success"
          size="100"
          width="7"
        ></v-progress-circular>
      </v-col>
      <v-col v-else cols="12">
        <a
          v-if="isEmbed"
          class="display-2 title-link white--text"
          :href="directLink"
          target="_blank"
          rel="noopener noreferrer"
          >{{ albumTitle }}</a
        >
        <span v-else class="display-2">
          {{ albumTitle }}
          <v-menu offset-y v-model="showShare">
            <template v-slot:activator="{ on }">
              <v-btn fab small top outlined color="primary" v-on="on">
                <v-icon>share</v-icon>
              </v-btn>
            </template>
            <v-list class="link-list" @click="copyLink($event)">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, directLink)"
                    @mouseover="selectLink($event)"
                  >
                    <v-list-item-title @click="copyLink($event, directLink)"
                      >Direct Link:
                      <a class="share-link" :href="directLink">{{
                        directLink
                      }}</a></v-list-item-title
                    >
                  </v-list-item>
                </template>
                <span>{{ tooltipText }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, `sia://${albumId}`)"
                    @mouseover="selectLink($event)"
                  >
                    <v-list-item-title
                      @click="copyLink($event, `sia://${albumId}`)"
                      >Sia Link:
                      <a class="share-link" :href="`sia://${albumId}`"
                        >sia://{{ albumId }}</a
                      ></v-list-item-title
                    >
                  </v-list-item>
                </template>
                <span>{{ tooltipText }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, embedCode)"
                    @mouseover="selectLink($event)"
                  >
                    <v-list-item-title @click="copyLink($event, embedCode)"
                      >Embed:
                      <span class="embed-code">{{
                        embedCode
                      }}</span></v-list-item-title
                    >
                  </v-list-item>
                </template>
                <span>{{ tooltipText }}</span>
              </v-tooltip>
            </v-list>
          </v-menu>
        </span>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="files.length > 0">
      <v-col
        v-for="(file, index) in files"
        :key="index"
        cols="12"
        xl="2"
        lg="4"
        md="6"
      >
        <v-card @click="openLink(`/${file.skylinks.source}`)">
          <v-img
            :src="`/${imageSource(file)}`"
            :aspect-ratio="4 / 3"
            class="align-end"
          >
            <v-card-title>{{ file.name }}</v-card-title>
          </v-img>
        </v-card>
      </v-col>
      <v-col v-if="isEmbed" cols="12"><div></div></v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card__title {
  background-color: rgba(27, 27, 27, 0.3);
}

.link-list {
  max-width: 30rem;
}

.share-link,
.embed-code {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -webkit-user-select: text;
}

.embed-code {
  font-family: monospace;
  background-color: rgba(128, 128, 128, 0.5);
  border-radius: 5px;
}

.title-link {
  text-decoration: none;
}
</style>

<script>
import { getAlbum } from "../mixins/getAlbum";

function selectText(node) {
  const range = new Range();
  range.selectNodeContents(node);
  document.getSelection().removeAllRanges();
  document.getSelection().addRange(range);
}

export default {
  name: "Album",
  mixins: [getAlbum],
  props: ["showShare", "alertBox", "isEmbed"],
  data() {
    return {
      albumId: "",
      files: [],
      albumTitle: "Album Title",
      loading: true,
      tooltipText: "Click to copy to clipboard"
    };
  },

  methods: {
    imageSource: function(file) {
      return file.skylinks.thumbnail
        ? file.skylinks.thumbnail
        : file.skylinks.source;
    },
    openLink: function(link) {
      let win = window.open(link);
      win.focus();
    },
    selectLink: function(event) {
      this.tooltipText = "Click to copy to clipboard";
      let node = event.target.querySelector(".share-link, .embed-code");
      if (node) selectText(node);
    },
    copyLink: function(event, copyText) {
      event.preventDefault();
      event.stopPropagation();
      if (!copyText) return;
      navigator.clipboard
        .writeText(copyText)
        .then(() => (this.tooltipText = "Copied to clipboard"))
        .catch(error => this.alertBox.send("error", error));
    }
  },

  beforeMount: function() {
    if (this.$route.params && this.$route.params.id)
      this.albumId = this.$route.params.id;

    this.getAlbumData(this.albumId)
      .then(data => {
        // if (data.version !== "0.0.5") return;
        this.loading = false;
        this.files = data.files;
        this.albumTitle = data.title;
      })
      .catch(error => this.alertBox.send("error", error));
  },

  computed: {
    directLink: () => {
      return document.location.href;
    },

    embedCode: () => {
      return `<iframe src="${document.location}" id="skygallery-embed" width="1280" height="720" frameborder="0" allowfullscreen></iframe>`;
    }
  }
};
</script>
