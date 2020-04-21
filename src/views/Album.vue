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
        <span class="display-2">
          {{ albumTitle }}
          <v-menu offset-y v-model="showShare">
            <template v-slot:activator="{ on }">
              <v-btn fab small top outlined color="primary" v-on="on">
                <v-icon>share</v-icon>
              </v-btn>
            </template>
            <v-list class="link-list">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, directLink)"
                    @mouseover="selectLink($event)"
                  >
                    <v-list-item-title
                      >Direct Link:
                      <a
                        class="share-link"
                        :href="directLink"
                        @click="$event.preventDefault()"
                        >{{ directLink }}</a
                      ></v-list-item-title
                    >
                  </v-list-item>
                </template>
                <span>Click to copy to clipboard</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, `sia://${albumId}`)"
                    @mouseover="selectLink($event)"
                  >
                    <v-list-item-title
                      >Sia Link:
                      <a
                        class="share-link"
                        :href="`sia://${albumId}`"
                        @click="$event.preventDefault()"
                        >sia://{{ albumId }}</a
                      ></v-list-item-title
                    >
                  </v-list-item>
                </template>
                <span>Click to copy to clipboard</span>
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
        <v-card @click="openImage(index)">
          <v-img
            :src="`/${imageSource(file)}`"
            :aspect-ratio="4 / 3"
            class="align-end"
          >
            <v-card-title>{{ file.name }}</v-card-title>
          </v-img>
        </v-card>
      </v-col>
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

.share-link {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -webkit-user-select: text;
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
  props: ["showShare", "alertBox"],
  data() {
    return {
      albumId: "",
      files: [],
      albumTitle: "Album Title",
      loading: true
    };
  },

  methods: {
    imageSource: function(file) {
      return file.thumbnail ? file.thumbnail : file.skylink;
    },
    openImage: function(index) {
      let win = window.open(`/${this.files[index].skylink}`);
      win.focus();
    },
    selectLink: function(event) {
      let node = event.target.querySelector(".share-link");
      if (node) selectText(node);
    },
    copyLink: function(event, link) {
      event.preventDefault();
      event.stopPropagation();
      navigator.clipboard
        .writeText(link)
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
    }
  }
};
</script>
