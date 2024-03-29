<template>
  <draggable
    v-model="items"
    class="row justify-center"
    handle=".drag-handle, .v-input__icon--prepend"
    @end="endDrag"
    @start="$emit('update:drag', true)"
  >
    <v-col
      v-for="(item, index) in items"
      :key="item.id"
      :class="itemsClass(item.type)"
      class="dragcol"
    >
      <v-text-field
        v-if="item.type === 'title'"
        v-model="item.value"
        autocomplete="off"
        outlined
        class="title"
        label="Title"
        prepend-icon="open_with"
        append-outer-icon="delete"
        @click:append-outer="items.splice(index, 1)"
        @focus="selectText($event, item.value)"
      ></v-text-field>
      <v-card
        v-else-if="item.type === 'album'"
        :loading="item.status !== 'finished'"
      >
        <AlbumCardDialog
          :myItem="item"
          @removeitem="items.splice(index, 1)"
          @update-item="updateItem"
        />
        <div class="remove-btn">
          <v-btn
            class="mr-4"
            fab
            small
            color="primary"
            @click="item.status = 'showdialog'"
          >
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn fab small color="error" @click="items.splice(index, 1)">
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
        <div class="drag-handle"></div>
        <v-responsive :aspect-ratio="4 / 3">
          <AlbumCardGrid :layout="item.layout" :skylink="item.skylink" />
        </v-responsive>
      </v-card>
      <v-card v-else :loading="item.status !== 'finished'">
        <v-img
          :src="thumbnailUrl(item)"
          :aspect-ratio="4 / 3"
          class="align-end"
        >
          <div class="remove-btn">
            <v-btn
              class="mr-4"
              fab
              small
              color="success"
              @click="generateVideoThumbnail(item)"
              v-if="item.type === 'video' && item.status === 'editthumbnail'"
            >
              <v-icon>done</v-icon>
            </v-btn>
            <v-btn
              class="mr-4"
              fab
              small
              color="primary"
              @click="item.status = 'editthumbnail'"
              v-if="item.type === 'video' && item.status === 'finished'"
            >
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn
              fab
              small
              color="error"
              @click="item.status = 'finished'"
              v-if="item.type === 'video' && item.status === 'editthumbnail'"
            >
              <v-icon>close</v-icon>
            </v-btn>
            <v-btn
              v-else
              fab
              small
              color="error"
              @click="items.splice(index, 1)"
            >
              <v-icon>delete</v-icon>
            </v-btn>
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
              class="file-log pa-4"
              v-if="item.log && item.status !== 'editthumbnail'"
              >{{
                item.log.replace("progress", uploadProgress(item.progress))
              }}</code
            >
            <video
              v-if="showVideoElement(item)"
              v-show="item.status === 'editthumbnail'"
              :src="item.videoUrl"
              class="video-card"
              muted
              controls
              loop
              :id="`video-${item.id}`"
              @loadeddata="videoCanplay(item, $event)"
              :crossorigin="item.crossorigin"
            ></video>
            <v-card-title
              v-show="item.status !== 'editthumbnail'"
              class="white--text"
              :class="item.log ? '' : 'input-background'"
            >
              <v-text-field
                dark
                dense
                single-line
                autocomplete="off"
                :value="item.newName"
                :tabindex="index + 101"
                @input="changeName(item.id, $event)"
                @focus="selectText($event, item.newName)"
              ></v-text-field>
            </v-card-title>
          </div>
        </v-img>
      </v-card>
    </v-col>
    <v-menu open-on-hover top offset-y close-delay="100">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="add-extra-btn"
          color="primary"
          fab
          x-large
          v-on="on"
          v-bind="attrs"
          :class="`mobile-${$vuetify.breakpoint.mobile}`"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="addAlbumCard">
          <v-list-item-icon>
            <v-icon>link</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Link an existing album</v-list-item-title>
        </v-list-item>
        <v-list-item @click="addTitle">
          <v-list-item-icon>
            <v-icon>text_fields</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Add Title</v-list-item-title>
        </v-list-item>
        <v-list-item @click.stop="importSkylinksDialog = true">
          <v-list-item-icon>
            <v-icon>public</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Import Skylinks</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog
      transition="dialog-bottom-transition"
      max-width="600"
      :value="importSkylinksDialog"
      @click:outside="importSkylinksDialog = false"
    >
      <template>
        <v-card>
          <v-toolbar color="primary" dark>Import Skylinks</v-toolbar>
          <v-card-text>
            <v-textarea
              outlined
              class="mt-4"
              label="One Skylink per line"
              @input="importSkylinksInput"
            ></v-textarea>
            <p v-if="totalImports > 0">
              Imported {{ importedSkylinks }} / {{ totalImports }} skylinks
            </p>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="importSkylinksDialog = false">Done</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </draggable>
</template>

<style scoped>
.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 3;
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
  white-space: pre;
}

.input-background {
  background-color: rgba(27, 27, 27, 0.3) !important;
}

.file-log::before,
.file-log::after {
  content: none;
}

.drag-handle,
.v-input__icon--prepend {
  cursor: move;
  cursor: -webkit-grabbing;
}
.drag-handle {
  position: absolute;
  top: 0;
  width: 100%;
  height: 30%;
  z-index: 2;
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

.dragcol.sortable-chosen.sortable-ghost.title {
  max-width: 420px;
}

.add-extra-btn {
  position: fixed;
  z-index: 1;
  bottom: 3rem;
  right: 3rem;
}

.add-extra-btn.mobile-true {
  bottom: 0.5rem;
  right: 0.5rem;
}
</style>

<script>
import AlbumCardDialog from "./AlbumCardDialog";
import AlbumCardGrid from "./AlbumCardGrid";
import { generateThumbnails } from "../mixins/generateThumbnails";
import { uploadFiles } from "../mixins/uploadFiles";
import { importSkylinks } from "../mixins/importSkylinks";
import { utils } from "../mixins/utils";
import draggable from "vuedraggable";

let inputTimeout = null;

export default {
  name: "UploadedItems",
  props: ["myItems", "setItems", "drag"],
  components: { draggable, AlbumCardDialog, AlbumCardGrid },
  mixins: [generateThumbnails, uploadFiles, importSkylinks, utils],

  data() {
    return {
      items: this.myItems,
      importSkylinksDialog: false,
      importedSkylinks: 0,
      totalImports: 0,
    };
  },

  watch: {
    items(newValue) {
      this.$emit("update:myItems", newValue);
    },
  },

  methods: {
    thumbnailUrl(item) {
      if (item.status === "editthumbnail") return "";
      let url = item.thumbnail;
      if (this.skylinkRegex.test(url)) {
        return window.PORTAL + url;
      } else {
        return url;
      }
    },

    changeName(id, newName) {
      if (inputTimeout !== null) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        this.items.find((item) => item.id === id).newName = newName;
      }, 250);
    },

    endDrag() {
      this.$emit("update:drag", false);
      this.setItems(this.items);
    },

    uploadProgress(progress) {
      let prog = Math.floor(progress * 100);
      return prog === 100 ? "processing" : `${prog}%`;
    },

    queueItem(item) {
      if (item.type === "image") {
        item.status = "queued";
        this.generateThumbnails();
      } else if (item.type === "video") {
        item.status = "waitforuser";
      }
    },

    setThumbnail(item) {
      item.status = "queued";
      this.generateThumbnails();
    },

    videoCanplay(item) {
      item.canplay = true;
      this.generateThumbnails();
    },

    addTitle() {
      this.items.push({
        id: this.generateID(),
        type: "title",
        value: "New Title",
        status: "finished",
      });
      this.$vuetify.goTo(".v-footer");
    },

    addAlbumCard() {
      this.items.push({
        id: this.generateID(),
        type: "album",
        skylink: "",
        layout: 0,
        status: "showdialog",
      });
      this.$vuetify.goTo(".v-footer");
    },

    removeItem(id) {
      if (!id) return;
      const index = this.items.findIndex((item) => item.id === id);
      if (index > -1) this.items.splice(index, 1);
    },

    generateVideoThumbnail(item) {
      item.status = "queued";
      this.generateThumbnails();
    },

    showVideoElement(item) {
      return (
        item.type === "video" &&
        (item.videoUrl || item.skylinks.source) &&
        (item.status === "editthumbnail" ||
          item.status === "processing" ||
          item.status === "queued")
      );
    },

    updateItem(newItem) {
      const index = this.items.findIndex((item) => item.id == newItem.id);
      if (!index) return;
      this.items[index] = newItem;
    },

    async importSkylinksInput(input) {
      const links = input
        .split("\n")
        .filter(this.isValidSkylink)
        .map((link) => this.parseSkylink(link) || link);
      this.totalImports = links.length;
      this.importSkylinks(links, () => {
        this.importedSkylinks++;
      });
    },
  },
};
</script>
