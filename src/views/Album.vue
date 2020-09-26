<template>
  <v-container fluid :class="loading ? 'fill-height' : ''" class="text-center">
    <FullscreenView
      v-if="showFullImg"
      :showFullIndex.sync="showFullIndex"
      :showFullImg.sync="showFullImg"
      :imgloading.sync="imgloading"
      :imgloaded.sync="imgloaded"
      :files="files"
      @setImgloading="setImgloading"
    />
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
          :href="directLink()"
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
            <v-list class="link-list">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, shortLink)"
                    @mouseover="selectLink"
                  >
                    <v-list-item-title @click="copyLink($event, shortLink)"
                      >Short Link:
                      <a class="share-link" :href="shortLink">{{
                        shortLink
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
                    @click="copyLink($event, directLink())"
                    @mouseover="selectLink"
                  >
                    <v-list-item-title @click="copyLink($event, directLink())">
                      Direct Link:
                      <a class="share-link" :href="directLink()">
                        {{ directLink() }}
                      </a>
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ tooltipText }}</span>
              </v-tooltip>
              <v-tooltip top v-if="!directLink().includes('/hns/')">
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, hnsLink)"
                    @mouseover="selectLink"
                  >
                    <v-list-item-title @click="copyLink($event, hnsLink)"
                      >HNS Link:
                      <a class="share-link" :href="hnsLink">{{
                        hnsLink
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
                    @mouseover="selectLink"
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
                    @click="copyLink($event, embedCode())"
                    @mouseover="selectLink"
                  >
                    <v-list-item-title @click="copyLink($event, embedCode())">
                      Embed:
                      <span class="embed-code">{{ embedCode() }}</span>
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ tooltipText }}</span>
              </v-tooltip>
            </v-list>
          </v-menu>
        </span>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="!loading && files.length > 0" dense>
      <v-col
        v-for="(item, index) in files"
        :key="index"
        :class="itemsClass(item.type)"
      >
        <h1 v-if="item.type === 'title'" class="mt-6 text-h4">
          {{ item.value }}
        </h1>
        <v-card
          v-else-if="item.type === 'album' && item.newTab"
          :class="showFullImg && showFullIndex !== index ? 'grayscale' : ''"
          :href="`#/a/${item.skylink}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-responsive :aspect-ratio="4 / 3">
            <AlbumCardGrid :layout="item.layout" :skylink="item.skylink" />
          </v-responsive>
        </v-card>
        <v-card
          v-else-if="item.type === 'album' && !item.newTab"
          :class="showFullImg && showFullIndex !== index ? 'grayscale' : ''"
          :to="`/a/${item.skylink}`"
        >
          <v-responsive :aspect-ratio="4 / 3">
            <AlbumCardGrid :layout="item.layout" :skylink="item.skylink" />
          </v-responsive>
        </v-card>
        <v-card v-else @click="openFull(index)" :class="cardClass(index)">
          <v-img
            :src="`/${item.skylinks.thumbnail}`"
            :aspect-ratio="4 / 3"
            class="align-end"
          >
            <v-icon
              v-if="item.type === 'video'"
              class="video-icon pa-4 translate-center"
              large
              >play_arrow</v-icon
            >
            <v-card-title>{{ item.name }}</v-card-title>
          </v-img>
        </v-card>
      </v-col>
      <v-col v-if="isEmbed" cols="12"><div></div></v-col>
    </v-row>
    <v-row v-if="!loading && files.length > 0 && !isEmbed">
      <v-col cols="12">
        <v-btn
          outlined
          :to="`/edit/${albumId}`"
          :loading="loading"
          class="upload-btn"
        >
          Edit album
          <v-icon right>create</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12"></v-col>
    </v-row>
  </v-container>
</template>

<style>
.translate-center {
  transform: translate(-50%, -50%);
}
</style>

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

.grayscale {
  filter: grayscale() blur(3px);
}

.video-icon {
  position: absolute;
  top: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}
</style>

<script>
import { utils } from "../mixins/utils";
import AlbumCardGrid from "../components/AlbumCardGrid";
import FullscreenView from "../components/FullscreenView";

function selectTextRange(node) {
  const range = new Range();
  range.selectNodeContents(node);
  document.getSelection().removeAllRanges();
  document.getSelection().addRange(range);
}

export default {
  name: "Album",
  props: ["showShare", "alertBox", "isEmbed", "pageTitle"],
  components: { AlbumCardGrid, FullscreenView },
  mixins: [utils],
  data: () => ({
    albumId: "",
    files: [],
    albumTitle: "Album Title",
    loading: true,
    tooltipText: "Click to copy to clipboard",
    showFullImg: false,
    showFullIndex: 0,
    imgloaded: false,
    imgloading: false,
  }),

  methods: {
    setImgloading() {
      this.imgloaded = false;
      setTimeout(() => {
        if (!this.imgloaded) this.imgloading = true;
      }, 100);
    },

    selectLink(event) {
      this.tooltipText = "Click to copy to clipboard";
      let node = event.target.querySelector(".share-link, .embed-code");
      if (node) selectTextRange(node);
    },

    copyLink(event, copyText) {
      event.preventDefault();
      event.stopPropagation();
      if (!copyText) return;
      navigator.clipboard
        .writeText(copyText)
        .then(() => (this.tooltipText = "Copied to clipboard"))
        .catch((error) => this.alertBox.send("error", error));
    },

    openFull(index) {
      this.setImgloading();
      this.showFullImg = true;
      this.showFullIndex = index;
      this.$vuetify.goTo(`.img-${this.showFullIndex}`);
    },

    async loadAlbum(albumId) {
      if (!albumId) albumId = this.albumId;
      if (!albumId) {
        this.$router.push("/");
        this.alertBox.send("info", "No album ID provided");
        return;
      }
      this.albumId = albumId;
      this.loading = true;
      try {
        const data = await this.getAlbumData(albumId);
        this.loading = false;
        this.showFullImg = false;
        this.files = data.files;
        this.albumTitle = data.title;

        if (data.title.length > 31)
          data.title = `${data.title.substr(0, 32)}...`;

        document.title = `"${data.title}" - ${this.pageTitle}`;

        this.$forceUpdate();
        this.$vuetify.goTo(".v-main__wrap");
      } catch (error) {
        this.alertBox.send("error", "Error getting album data");
      }
    },

    directLink() {
      return location.href;
    },

    embedCode() {
      return `<iframe src="${this.directLink()}" id="skygallery-embed" width="1280" height="720" frameborder="0" allowfullscreen></iframe>`;
    },

    cardClass(index) {
      let className = `img-${index}`;
      if (this.showFullImg && this.showFullIndex !== index)
        className += " grayscale";
      return className;
    },
  },

  computed: {
    shortLink() {
      return `https://skygallery.xyz/a/${this.albumId}`;
    },

    hnsLink() {
      return `${location.origin}/hns/skygallery/#/a/${this.albumId}`;
    },
  },

  beforeRouteLeave(to, from, next) {
    document.title = this.pageTitle;
    next();
  },

  beforeRouteUpdate(to, from, next) {
    const newSkylink = this.extractAlbumSkylink(to.path);
    if (newSkylink && newSkylink !== this.albumId) this.loadAlbum(newSkylink);
    next();
  },

  mounted() {
    if (this.$route.params && this.$route.params.id)
      this.albumId = this.$route.params.id;
    this.loadAlbum();
  },
};
</script>
