<template>
  <draggable
    v-model="items"
    @start="drag = true"
    @end="endDrag"
    class="row justify-center"
    handle=".drag-handle"
  >
    <v-col
      v-for="(item, index) in items"
      :key="item.id"
      cols="12"
      xl="2"
      lg="4"
      md="6"
    >
      <v-card :loading="item.status !== 'finished'">
        <v-img
          :src="thumbnailUrl(item.thumbnail)"
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
          <v-btn
            v-if="item.status === 'waitforuser'"
            color="success"
            small
            class="thumbnail-btn"
            @click="setThumbnail(item)"
            >Set as thumbnail</v-btn
          >
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
              v-if="item.log && item.status !== 'waitforuser'"
              >{{
                item.log.replace("progress", uploadProgress(item.progress))
              }}</code
            >
            <video
              v-if="
                item.type === 'video' &&
                item.videoUrl &&
                item.status === 'waitforuser'
              "
              :src="item.videoUrl"
              class="video-card"
              muted
              controls
              loop
              :id="`video-${item.id}`"
            ></video>
            <v-card-title :class="item.log ? '' : 'input-background'">
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
import draggable from "vuedraggable";
import { generateThumbnails } from "../mixins/generateThumbnails";
import { uploadFiles } from "../mixins/uploadFiles";
import { uploadBlob } from "../mixins/uploadBlob";

let inputTimeout = null;

export default {
  name: "Uploads",
  components: { draggable },
  props: ["items", "skylinkRegex", "setItems", "selectTitle"],
  mixins: [generateThumbnails, uploadFiles, uploadBlob],
  data() {
    return {
      drag: false,
    };
  },

  methods: {
    thumbnailUrl: function (url) {
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
      this.drag = false;
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
  },
};
</script>
