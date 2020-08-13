<template>
  <draggable
    v-model="items"
    @start="$emit('update:drag', true)"
    @end="endDrag"
    class="row justify-center"
    handle=".drag-handle, .v-input__icon--prepend"
  >
    <v-col
      v-for="(item, index) in items"
      :key="item.id"
      :class="itemsClass(item)"
    >
      <v-text-field
        v-if="item.type === 'title'"
        v-model="item.value"
        autocomplete="off"
        outlined
        label="Title"
        prepend-icon="open_with"
        append-outer-icon="delete"
      ></v-text-field>
      <v-card v-else :loading="item.status !== 'finished'">
        <v-img
          :src="thumbnailUrl(item)"
          :aspect-ratio="4 / 3"
          class="align-end"
        >
          <v-btn
            class="remove-btn"
            fab
            small
            color="error"
            @click="items.splice(index, 1)"
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <div v-if="item.type === 'video'">
            <v-btn
              v-if="item.status === 'editthumbnail'"
              color="success"
              small
              class="thumbnail-btn"
              @click="generateVideoThumbnail(item.id)"
              >Set as thumbnail</v-btn
            >
            <v-btn
              v-if="item.status === 'finished'"
              color="success"
              small
              class="thumbnail-btn"
              @click="item.status = 'editthumbnail'"
              >Edit thumbnail</v-btn
            >
          </div>
          <div v-if="item.status === 'toobig'" class="toobig">
            <h2 class="title">This file is bigger than 50MiB</h2>
            <h3 class="subtitle-1">
              Are you sure you wan to upload this file?
            </h3>
            <v-btn fab small outlined color="success" @click="queueItem(item)">
              <v-icon>done</v-icon>
            </v-btn>
          </div>
          <div v-else>
            <div class="drag-handle"></div>
            <code
              class="file-log"
              :class="`log-${item.status} log-${item.type}`"
              v-if="item.log && item.status !== 'editthumbnail'"
              >{{
                item.log.replace("progress", uploadProgress(item.progress))
              }}</code
            >
            <video
              v-if="
                item.type === 'video' && (item.videoUrl || item.skylinks.source)
              "
              v-show="item.status === 'editthumbnail'"
              :src="item.videoUrl"
              class="video-card"
              muted
              controls
              loop
              :id="`video-${item.id}`"
              @loadeddata="videoCanplay(item, $event)"
            ></video>
            <v-card-title
              v-show="item.status !== 'editthumbnail'"
              :class="item.log ? '' : 'input-background'"
            >
              <v-text-field
                single-line
                dense
                :value="item.newName"
                @input="changeName(item.id, $event)"
                @focus="selectTitle($event, item.newName)"
                autocomplete="off"
                :tabindex="index + 101"
              ></v-text-field>
            </v-card-title>
          </div>
        </v-img>
      </v-card>
    </v-col>
  </draggable>
</template>

<style scoped>
.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.file-log {
  font-family: monospace;
  text-align: start;
  background-color: rgba(27, 27, 27, 0.3) !important;
  color: white !important;
  box-shadow: none !important;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 1rem;
  white-space: pre;
}

.log-video.log-finished {
  padding-top: 3rem;
}

.input-background {
  background-color: rgba(27, 27, 27, 0.3) !important;
}

.file-log::before,
.file-log::after {
  content: none;
}

.bottom-text {
  margin-bottom: 1rem;
}

.drag-handle {
  cursor: move;
  cursor: -webkit-grabbing;
  position: absolute;
  top: 0;
  width: 100%;
  height: 30%;
  z-index: 1;
}

.toobig {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 1rem;
}

.video-card {
  width: 100%;
}

.thumbnail-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}
</style>

<script>
import { generateThumbnails } from "../mixins/generateThumbnails";
import { uploadFiles } from "../mixins/uploadFiles";
import { uploadBlob } from "../mixins/uploadBlob";
import { utils } from "../mixins/utils";
import draggable from "vuedraggable";

let inputTimeout = null;
let addAlbumTimeout = null;

export default {
  name: "Uploads",
  components: { draggable },
  props: ["items", "skylinkRegex", "setItems", "selectTitle", "drag"],
  mixins: [generateThumbnails, uploadFiles, uploadBlob, utils],

  data() {
    return {
      addItemDialog: false,
    };
  },

  methods: {
    thumbnailUrl: function (item) {
      if (item.status === "editthumbnail") return "";
      let url = item.thumbnail;
      if (this.skylinkRegex.test(url)) {
        return `/${url}`;
      } else {
        return url;
      }
    },

    changeName: function (id, newName) {
      if (inputTimeout !== null) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        this.items.find((item) => item.id === id).newName = newName;
      }, 250);
    },

    endDrag() {
      this.$emit("update:drag", false);
      this.setItems(this.items);
    },

    uploadProgress: function (progress) {
      let prog = Math.floor(progress * 100);
      return prog === 100 ? "processing" : `${prog}%`;
    },

    queueItem: function (item) {
      if (item.type === "image") {
        item.status = "queued";
        this.generateThumbnails();
      } else if (item.type === "video") {
        item.status = "waitforuser";
      }
    },

    setThumbnail: function (item) {
      item.status = "queued";
      this.generateThumbnails();
    },

    videoCanplay: function (item, event) {
      if (item.skylinks.thumbnail) return;
      this.generateVideoThumbnail(item.id, event.target);
    },

    addTitle: function (event) {
      if (event) event.preventDefault();
      this.addTitleText = "New Title";
    },

    albumInput: function () {
      if (addAlbumTimeout !== null) clearTimeout(addAlbumTimeout);
      this.inputError = "";
      if (!this.addAlbumURL) return;
      addAlbumTimeout = setTimeout(() => {
        this.loading = true;
        let skylink = this.linkInput.replace("sia://", "");
        skylink = skylink.replace("https://skygallery.xyz/", "");
        skylink = skylink.replace(document.location, "");
        skylink = skylink.replace("a/", "");
        this.portals.forEach((portal) => {
          skylink = skylink.replace(portal.link, "");
        });
        skylink = skylink.replace(/\//g, "");
        if (!this.skylinkRegex.test(skylink)) {
          this.loading = false;
          this.inputError = "Invalid skylink";
          return (this.loading = false);
        }
        this.checkValidAlbum(skylink)
          .then(() => {
            this.loading = false;
            this.$router.push("/a/" + skylink);
          })
          .catch((error) => {
            this.alertBox.send("error", error);
            this.inputError = "Error fetching album";
            this.loading = false;
          });
      }, 250);
    },

    itemsClass: function (item) {
      if (item.type === "title") {
        return "col-12";
      } else {
        return "col-md-6 col-lg-4 col-xl-2 col-12";
      }
    },
  },
};
</script>
