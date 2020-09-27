<template>
  <div
    v-if="files && files.length > 0 && /^(image|video)$/.test(item.type)"
    class="fullscreen-view"
    :class="showinfoClass()"
    @wheel="fullscreenMousewheel"
    @click="closeFullscreen"
  >
    <FullscreenInfopanel
      :userSettings="userSettings"
      :item="item"
      ref="infoPanel"
    />
    <v-progress-circular
      indeterminate="true"
      v-if="imgloading && item.type === 'image'"
      class="imgloading translate-center"
      color="primary"
      size="100"
      width="7"
    ></v-progress-circular>
    <img
      v-if="item.type === 'image'"
      class="fullscreen-img translate-center"
      :class="showinfoClass()"
      :src="`/${item.skylinks.source}`"
      :alt="item.name"
      @load="imgLoad"
      :id="item.id"
      v-touch="touchOptions"
    />
    <video
      class="fullscreen-video translate-center"
      :class="showinfoClass()"
      v-if="item.type === 'video'"
      :src="`/${item.skylinks.source}`"
      controls
      autoplay
      @ended="videoEnded"
      @volumechange="volumechange"
      @canplay="setvolume"
      v-touch="touchOptions"
    ></video>
    <div
      v-if="files.length > 1"
      :class="btnClass()"
      class="previous-btn"
      @click="showPrevious"
      v-touch="touchOptions"
    >
      <v-icon size="64">navigate_before</v-icon>
    </div>
    <div
      v-if="files.length > 1"
      :class="btnClass()"
      class="next-btn"
      @click="showNext"
      v-touch="touchOptions"
    >
      <v-icon size="64">navigate_next</v-icon>
    </div>
    <div class="fullscreen-header text-center pa-4" :class="showinfoClass()">
      <span class="headline">{{ item.name }}</span>
      <div class="float-right">
        <v-btn
          fab
          text
          small
          :color="userSettings.showInfo ? 'primary' : ''"
          @click="toggleInfoPanel"
        >
          <v-icon>info</v-icon>
        </v-btn>
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
              :href="`/${item.skylinks.source}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-list-item-title>Original</v-list-item-title>
              <v-list-item-icon>
                <v-icon>launch</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item
              :href="`/${item.skylinks.thumbnail}`"
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
        <v-btn fab text small color="error" @click="closeFullscreen()">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-view {
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
  transition: width 0.2s;
}

.fullscreen-header {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  width: 100vw;
  transition: width 0.2s;
}

.fullscreen-view.showinfo.mobile-false,
.fullscreen-header.showinfo.mobile-false {
  width: calc(100vw - 360px);
}

.fullscreen-img {
  max-width: 100vw;
  max-height: 100vh;
  position: fixed;
  top: 50%;
  transition: max-width 0.2s;
}

.fullscreen-video {
  max-width: 100vw;
  max-height: 100vh;
  outline: none;
  position: fixed;
  top: 50%;
  transition: max-width 0.2s;
}

.fullscreen-img.showinfo.mobile-false,
.fullscreen-video.showinfo.mobile-false {
  max-width: calc(100vw - 360px);
}

.imgloading {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1;
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
  position: absolute;
  top: 50%;
  right: 1rem;
  z-index: 1;
}

.short {
  height: 75vh;
}
</style>

<script>
import FullscreenInfopanel from "./FullscreenInfopanel";
import { utils } from "../mixins/utils";
import EXIF from "exif-js";

export default {
  name: "FullscreenView",
  props: ["showFullIndex", "showFullImg", "imgloading", "imgloaded", "files"],
  components: { FullscreenInfopanel },
  mixins: [utils],
  data() {
    return {
      touchOptions: {
        left: () => this.showNext(),
        right: () => this.showPrevious(),
        up: () => this.closeFullscreen(),
        down: () => this.closeFullscreen(),
      },
      diashowTimeout: null,
    };
  },

  computed: {
    item() {
      return this.files[this.showFullIndex];
    },
  },

  methods: {
    closeFullscreen(event) {
      if (event && !event.target.classList.contains("fullscreen-view")) return;
      this.$emit("update:showFullImg", false);
      clearTimeout(this.diashowTimeout);
    },

    btnClass() {
      if (this.item.type === "image") {
        return "";
      } else if (this.item.type === "video") {
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
      event.preventDefault();
      if (event.deltaY > 0) {
        this.showNext();
      } else {
        this.showPrevious();
      }
    },

    startDiashow() {
      clearTimeout(this.diashowTimeout);
      this.diashowTimeout = setTimeout(() => {
        if (!this.userSettings.diashow) return;
        if (this.item.type === "video") return;
        this.showNext();
      }, 5000);
    },

    imgLoad(event) {
      this.$emit("update:imgloading", false);
      this.$emit("update:imgloaded", true);
      EXIF.getData(event.target, function () {
        const allMetaData = EXIF.getAllTags(this);
        console.log(JSON.stringify(allMetaData));
      });
      this.item.width = event.target.naturalWidth;
      this.item.height = event.target.naturalHeight;
      this.$refs.infoPanel.$forceUpdate();
      this.startDiashow();
    },

    diashowSwitch(event) {
      this.setUserSettings({ diashow: event });
      this.startDiashow();
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

    toggleInfoPanel() {
      this.setUserSettings({ showInfo: !this.userSettings.showInfo });
    },

    showinfoClass() {
      let className = `mobile-${this.$vuetify.breakpoint.mobile}`;
      if (this.userSettings.showInfo) className += " showinfo";
      return className;
    },
  },

  mounted() {
    document.addEventListener("keydown", (event) => {
      if (!this.showFullImg || this.files.length < 0) return;
      switch (event.key) {
        case "Escape":
          this.closeFullscreen();
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

    document.querySelector("html").className = "noscroll";
  },

  beforeDestroy() {
    document.querySelector("html").className = "";
  },
};
</script>