<template>
  <v-container fluid :class="loading ? 'fill-height' : ''" class="text-center">
    <div
      class="fullscreen-image"
      v-if="showFullImg"
      v-touch="{
        left: () => showNext(),
        right: () => showPrevious(),
        up: () => (showFullImg = false),
        down: () => (showFullImg = false),
      }"
      @mousewheel="fullscreenMousewheel($event)"
      @click="closeFullscreen($event)"
    >
      <v-progress-circular
        indeterminate="true"
        v-if="imgloading && files[showFullIndex].type === 'image'"
        class="imgloading translate-center"
        color="primary"
        size="100"
        width="7"
      ></v-progress-circular>
      <img
        v-if="files[showFullIndex].type === 'image'"
        class="fullscreen-img translate-center"
        :src="`/${files[showFullIndex].skylinks.source}`"
        :alt="files[showFullIndex].name"
        @load="
          imgloading = false;
          imgloaded = true;
        "
      />
      <video
        class="fullscreen-video translate-center"
        v-if="files[showFullIndex].type === 'video'"
        :src="`/${files[showFullIndex].skylinks.source}`"
        controls
        loop
        autoplay
      ></video>
      <div class="full-top-right">
        <v-menu offset-y bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              text
              small
              class="full-menu-btn"
              color="white"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              :href="`/${files[showFullIndex].skylinks.source}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-list-item-title>
                Original <v-icon>launch</v-icon>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              :href="`/${files[showFullIndex].skylinks.thumbnail}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-list-item-title>
                Thumbnail <v-icon>launch</v-icon>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn fab text small color="error" @click="showFullImg = false">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
      <div
        v-if="files.length > 1"
        :class="btnClass()"
        class="previous-btn"
        @click="showPrevious()"
      >
        <v-icon size="64">navigate_before</v-icon>
      </div>
      <div
        v-if="files.length > 1"
        :class="btnClass()"
        class="next-btn"
        @click="showNext()"
      >
        <v-icon size="64">navigate_next</v-icon>
      </div>
      <div class="fullscreen-footer text-center">
        <span class="headline">{{ files[showFullIndex].name }}</span>
      </div>
    </div>
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
            <v-list class="link-list">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, shortLink)"
                    @mouseover="selectLink($event)"
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
              <v-tooltip top v-if="!directLink.includes('/hns/')">
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-on="on"
                    @click="copyLink($event, hnsLink)"
                    @mouseover="selectLink($event)"
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
    <v-row justify="center" v-if="!loading && files.length > 0" dense>
      <v-col
        v-for="(item, index) in files"
        :key="index"
        :class="itemsClass(item.type)"
      >
        <h1 v-if="item.type === 'title'" class="title text-h4">
          {{ item.value }}
        </h1>
        <v-card
          v-else-if="item.type === 'album' && item.newTab"
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
          :to="`/a/${item.skylink}`"
        >
          <v-responsive :aspect-ratio="4 / 3">
            <AlbumCardGrid :layout="item.layout" :skylink="item.skylink" />
          </v-responsive>
        </v-card>
        <v-card
          v-else
          @click="openFull(index)"
          :class="showFullImg && showFullIndex !== index ? 'grayscale' : ''"
          :id="`img-${index}`"
        >
          <v-img
            :src="`/${item.skylinks.thumbnail}`"
            :aspect-ratio="4 / 3"
            class="align-end"
          >
            <v-icon
              v-if="item.type === 'video'"
              class="video-icon translate-center"
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

.fullscreen-image {
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.7);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
}

.full-top-right {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 11;
}

.full-menu-btn {
  margin-right: 1rem;
}

.previous-btn,
.next-btn {
  position: absolute;
  height: 100vh;
  width: 10rem;
  max-width: 12.5vw;
  top: 0;
  opacity: 0;
  cursor: pointer;
}

.previous-btn:hover,
.next-btn:hover {
  opacity: 1;
}

.previous-btn {
  left: 0;
}

.next-btn {
  right: 0;
}

.previous-btn i {
  position: fixed;
  top: 50%;
  left: 1rem;
}

.next-btn i {
  position: fixed;
  top: 50%;
  right: 1rem;
  z-index: 1;
}

.short {
  height: 75vh;
}

.grayscale {
  filter: grayscale() blur(3px);
}

.fullscreen-footer {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  padding: 1rem;
  width: 100%;
}

.fullscreen-footer > .v-btn {
  margin: 0 0.5rem;
}

.translate-center {
  transform: translate(-50%, -50%);
}

.fullscreen-video {
  max-width: 100vw;
  max-height: 100vh;
  outline: none;
  position: fixed;
  top: 50%;
  left: 50%;
}

.video-icon {
  position: absolute;
  top: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 1rem;
}

.fullscreen-img {
  max-width: 100vw;
  max-height: 100vh;
  position: fixed;
  top: 50%;
  left: 50%;
}

.imgloading {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1;
}

h1.title {
  margin-top: 1rem;
}
</style>

<script>
import { utils } from "../mixins/utils";
import AlbumCardGrid from "../components/AlbumCardGrid";

function selectTextRange(node) {
  const range = new Range();
  range.selectNodeContents(node);
  document.getSelection().removeAllRanges();
  document.getSelection().addRange(range);
}

export default {
  name: "Album",
  mixins: [utils],
  props: ["showShare", "alertBox", "isEmbed"],
  components: { AlbumCardGrid },
  data() {
    return {
      albumId: "",
      files: [],
      albumTitle: "Album Title",
      loading: true,
      tooltipText: "Click to copy to clipboard",
      showFullImg: false,
      showFullIndex: 0,
      imgloaded: false,
      imgloading: false,
    };
  },

  methods: {
    setImgloading: function () {
      this.imgloaded = false;
      setTimeout(() => {
        if (!this.imgloaded) this.imgloading = true;
      }, 100);
    },
    selectLink: function (event) {
      this.tooltipText = "Click to copy to clipboard";
      let node = event.target.querySelector(".share-link, .embed-code");
      if (node) selectTextRange(node);
    },
    copyLink: function (event, copyText) {
      event.preventDefault();
      event.stopPropagation();
      if (!copyText) return;
      navigator.clipboard
        .writeText(copyText)
        .then(() => (this.tooltipText = "Copied to clipboard"))
        .catch((error) => this.alertBox.send("error", error));
    },
    openFull: function (index) {
      this.setImgloading();
      this.showFullImg = true;
      this.showFullIndex = index;
      this.$vuetify.goTo(`#img-${this.showFullIndex}`);
    },
    showPrevious: function () {
      if (this.files.length < 2) return;
      if (this.showFullIndex <= 0) {
        this.showFullIndex = this.files.length - 1;
      } else {
        this.showFullIndex = (this.showFullIndex - 1) % this.files.length;
      }
      // skip one if item is not an image or video
      if (!/^(image|video)$/.test(this.files[this.showFullIndex].type))
        return this.showPrevious();
      this.setImgloading();
      this.$vuetify.goTo(`#img-${this.showFullIndex}`);
    },
    showNext: function () {
      if (this.files.length < 2) return;
      this.showFullIndex = (this.showFullIndex + 1) % this.files.length;
      // skip one if item is not an image or video
      if (!/^(image|video)$/.test(this.files[this.showFullIndex].type))
        return this.showNext();
      this.setImgloading();
      this.$vuetify.goTo(`#img-${this.showFullIndex}`);
    },
    fullscreenMousewheel: function (event) {
      if (!event) return;
      event.stopPropagation();
      event.preventDefault();
      if (event.deltaY > 0) {
        this.showNext();
      } else {
        this.showPrevious();
      }
    },
    btnClass: function () {
      let file = this.files[this.showFullIndex];
      if (file.type === "image") {
        return "";
      } else if (file.type === "video") {
        return "short";
      }
    },

    closeFullscreen: function (event) {
      if (!event) return;
      if (event.target.classList.contains("fullscreen-image")) {
        this.showFullImg = false;
      }
    },

    loadAlbum: function (albumId) {
      if (!albumId) albumId = this.albumId;
      if (albumId === "") {
        this.$router.push("/");
        this.alertBox.send("info", "No album ID provided");
        return;
      }
      this.albumId = albumId;
      this.loading = true;
      this.getAlbumData(albumId)
        .then((data) => {
          this.loading = false;
          this.files = data.files;
          this.albumTitle = data.title;
        })
        .catch(() => this.alertBox.send("error", "Error getting album data"));
    },
  },

  computed: {
    directLink: () => {
      return location.href;
    },

    shortLink: function () {
      return `https://skygallery.xyz/a/${this.albumId}`;
    },

    hnsLink: function () {
      return `${location.origin}/hns/skygallery/#/a/${this.albumId}`;
    },

    embedCode: () => {
      return `<iframe src="${document.location}" id="skygallery-embed" width="1280" height="720" frameborder="0" allowfullscreen></iframe>`;
    },
  },

  mounted: function () {
    if (this.$route.params && this.$route.params.id)
      this.albumId = this.$route.params.id;
    this.loadAlbum();

    this.$router.beforeEach((to, from, next) => {
      if (!to.path.startsWith("/a/")) return next();
      const newSkylink = this.extractAlbumSkylink(to.path);
      if (newSkylink) this.loadAlbum(newSkylink);
      next();
    });

    document.addEventListener("keydown", (event) => {
      if (!this.showFullImg || this.files.length < 0) return;
      switch (event.key) {
        case "Escape":
          this.showFullImg = false;
          break;
        case "ArrowLeft":
          this.showPrevious();
          break;
        case "ArrowRight":
          this.showNext();
          break;
        default:
          break;
      }
    });
  },
};
</script>
