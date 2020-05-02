<template>
  <v-container class="text-center" fluid>
    <v-row justify="center">
      <v-col cols="12" v-if="items.length < 1">
        <h1 class="display-2">Create a new Album</h1>
      </v-col>
      <v-col v-else xl="4" md="6" cols="12">
        <v-form @submit="publishAlbum($event)">
          <v-text-field
            class="headline"
            v-model="albumTitle"
            single-line
            :loading="loading"
            :disabled="loading"
            @focus="selectTitle($event, 'Untitled Album')"
            ref="titleInput"
          >
            <template v-slot:append-outer>
              <v-btn
                x-large
                text
                icon
                color="success"
                @click="publishAlbum"
                :loading="loading"
              >
                <v-icon>backup</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </v-form>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col lg="4" md="6" cols="12">
        <div
          id="dropzone"
          class="dropzone"
          :class="isDragOver ? 'is-dragover' : ''"
          @drop="onDrop"
          @dragover="onDrag"
          @dragenter="isDragOver = true"
          @dragleave="isDragOver = false"
          @dragend="isDragOver = false"
          @click="$refs.file.click()"
        >
          <input
            type="file"
            name="files[]"
            accept="image/*"
            ref="file"
            multiple
            @change="onFile"
          />
          <label for="file"
            ><strong>Choose files</strong
            ><span> or drag them here</span>.</label
          >
        </div>
        <div class="previews"></div>
      </v-col>
    </v-row>
    <uploads
      :items="items"
      :skylinkRegex="skylinkRegex"
      :setItems="setItems"
      :selectTitle="selectTitle"
    />
    <v-row v-if="items.length > 0">
      <v-col cols="12">
        <h1 class="headline bottom-text">Done uploading?</h1>
        <v-btn
          large
          color="success"
          @click="publishAlbum"
          :disabled="loading"
          :loading="loading"
        >
          Publish your album
          <v-icon right>backup</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12"></v-col>
    </v-row>
  </v-container>
</template>

<style>
.dropzone {
  background-color: rgb(24, 26, 27);
  border: 2px dashed rgb(88, 181, 96);
  border-radius: 5px;
  padding: 2rem;
  transition: background 100ms;
}

.dropzone:hover,
.is-dragover {
  background-color: transparent;
}

.dropzone,
.dropzone > * {
  cursor: pointer;
}

input[type="file"] {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

label[for="file"] {
  margin: 2rem;
}
</style>

<script>
const { publishAlbum } = require("../mixins/publishAlbum");
import { uploadBlob } from "../mixins/uploadBlob";
import { generateThumbnails } from "../mixins/generateThumbnails";
import { uploadFiles } from "../mixins/uploadFiles";
import { processFiles } from "../mixins/processFiles";
import uploads from "@/components/Uploads.vue";

export default {
  name: "New",
  components: { uploads },
  props: ["version", "skylinkRegex", "alertBox", "showShare"],
  mixins: [
    publishAlbum,
    uploadBlob,
    generateThumbnails,
    uploadFiles,
    processFiles
  ],
  data() {
    return {
      items: [],
      albumTitle: "Untitled Album",
      isDragOver: false,
      loading: false
    };
  },

  methods: {
    setItems(newItems) {
      this.items = newItems;
    },
    preventEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    onDrag(e) {
      this.preventEvent(e);
      this.isDragOver = true;
    },
    onDrop(e) {
      this.preventEvent(e);
      if (e.dataTransfer && e.dataTransfer.files)
        this.processFiles(e.dataTransfer.files);
      this.isDragOver = false;
    },
    onFile(e) {
      this.preventEvent(e);
      this.processFiles(e.target.files);
    },
    selectTitle(e, test) {
      if (e.target.value === test) e.target.select();
    }
  }
};
</script>
