<template>
  <div
    v-if="
      files &&
      files.length > 0 &&
      /^(image|video)$/.test(files[showFullIndex].type)
    "
    class="fullscreen-image"
    v-touch="touchOptions"
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
      @load="imgLoad"
    />
    <video
      class="fullscreen-video translate-center"
      v-if="files[showFullIndex].type === 'video'"
      :src="`/${files[showFullIndex].skylinks.source}`"
      controls
      autoplay
      @ended="videoEnded"
      @volumechange="volumechange"
      @canplay="setvolume"
    ></video>
    <div
      v-if="files.length > 1"
      :class="btnClass()"
      class="previous-btn"
      @click="showPrevious"
    >
      <v-icon size="64">navigate_before</v-icon>
    </div>
    <div
      v-if="files.length > 1"
      :class="btnClass()"
      class="next-btn"
      @click="showNext"
    >
      <v-icon size="64">navigate_next</v-icon>
    </div>
    <div class="fullscreen-header text-center pa-4">
      <span class="headline">{{ files[showFullIndex].name }}</span>
      <div class="float-right">
        <v-menu offset-y bottom transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              text
              small
              class="mr-4"
              color="white"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-action>
                <v-switch
                  @change="diashowSwitch"
                  v-model="userSettings.diashow"
                >
                  <template v-slot:label>
                    <p class="ml-4 mb-0">Diashow/Autoplay</p>
                  </template>
                </v-switch>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              :href="`/${files[showFullIndex].skylinks.source}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-list-item-title>Original</v-list-item-title>
              <v-list-item-icon>
                <v-icon>launch</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item
              :href="`/${files[showFullIndex].skylinks.thumbnail}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-list-item-title>Thumbnail</v-list-item-title>
              <v-list-item-icon>
                <v-icon>launch</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          fab
          text
          small
          color="error"
          @click="$emit('update:showFullImg', false)"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-header {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  width: 100%;
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

.imgloading {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1;
}

.fullscreen-img {
  max-width: 100vw;
  max-height: 100vh;
  position: fixed;
  top: 50%;
  left: 50%;
}

.fullscreen-video {
  max-width: 100vw;
  max-height: 100vh;
  outline: none;
  position: fixed;
  top: 50%;
  left: 50%;
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
</style>

<script>
import { utils } from "../mixins/utils";

export default {
  name: "AlbumFullscreen",
  props: ["showFullIndex", "showFullImg", "imgloading", "imgloaded", "files"],
  mixins: [utils],
  data() {
    return {
      touchOptions: {
        left: () => this.showNext(),
        right: () => this.showPrevious(),
        up: () => this.$emit("update:showFullImg", false),
        down: () => this.$emit("update:showFullImg", false),
      },
      diashowTimeout: null,
    };
  },

  methods: {
    closeFullscreen(event) {
      if (!event) return;
      if (event.target.classList.contains("fullscreen-image")) {
        this.$emit("update:showFullImg", false);
      }
    },

    btnClass() {
      const file = this.files[this.showFullIndex];
      if (file.type === "image") {
        return "";
      } else if (file.type === "video") {
        return "short";
      }
    },

    showNext() {
      if (this.files.length < 2) return;
      let newIndex = this.showFullIndex;
      do {
        newIndex = (newIndex + 1) % this.files.length;
      } while (!/^(image|video)$/.test(this.files[newIndex].type));
      this.$emit("update:showFullIndex", newIndex);
      this.$emit("setImgloading");
      this.$vuetify.goTo(`.img-${newIndex}`);
    },

    showPrevious() {
      if (this.files.length < 2) return;
      let newIndex = this.showFullIndex;
      do {
        if (newIndex <= 0) {
          newIndex = this.files.length - 1;
        } else {
          newIndex--;
        }
      } while (!/^(image|video)$/.test(this.files[newIndex].type));
      this.$emit("update:showFullIndex", newIndex);
      this.$emit("setImgloading");
      this.$vuetify.goTo(`.img-${newIndex}`);
    },

    fullscreenMousewheel(event) {
      if (!event) return;
      event.stopPropagation();
      event.preventDefault();
      if (event.deltaY > 0) {
        this.showNext();
      } else {
        this.showPrevious();
      }
    },

    imgLoad() {
      this.$emit("update:imgloading", false);
      this.$emit("update:imgloaded", true);
      this.diashowTimeout = setTimeout(() => {
        if (!this.userSettings.diashow) return;
        if (this.files[this.showFullIndex].type === "video") return;
        this.showNext();
      }, 5000);
    },

    diashowSwitch(event) {
      this.setUserSettings({ diashow: event });
      clearTimeout(this.diashowTimeout);
      this.diashowTimeout = setTimeout(() => {
        if (!this.userSettings.diashow) return;
        if (this.files[this.showFullIndex].type === "video") return;
        this.showNext();
      }, 5000);
    },

    videoEnded(event) {
      if (this.userSettings.diashow) {
        this.showNext();
      } else {
        event.target.play();
      }
    },

    volumechange(event) {
      this.setUserSettings({ volume: event.target.volume });
    },

    setvolume(event) {
      if (this.userSettings.volume !== undefined) {
        event.target.volume = this.userSettings.volume;
      }
    },
  },

  mounted() {
    document.addEventListener("keydown", (event) => {
      if (!this.showFullImg || this.files.length < 0) return;
      switch (event.key) {
        case "Escape":
          this.$emit("update:showFullImg", false);
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
