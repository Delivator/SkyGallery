<template>
  <v-container class="text-center" fluid>
    <UploadDialog
      :unfinishedDialog.sync="unfinishedDialog"
      :publish="publish"
    />
    <v-row justify="center">
      <v-col cols="12" v-if="items.length < 1">
        <h1 class="display-2">Create a new Album</h1>
      </v-col>
      <v-col v-else xl="4" md="6" cols="12">
        <v-form @submit="publish($event)">
          <v-text-field
            class="headline"
            v-model="albumTitle"
            single-line
            :loading="loading"
            :disabled="loading"
            @focus="selectTitle($event, 'Untitled Album')"
            ref="titleInput"
            autocomplete="off"
            tabindex="100"
          >
            <template v-slot:append-outer>
              <v-btn
                x-large
                text
                icon
                color="success"
                @click="publish"
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
        <Dropzone :items="items" :dragUpload="drag" v-intersect="onIntersect" />
      </v-col>
    </v-row>
    <Uploads
      :items="items"
      :skylinkRegex="skylinkRegex"
      :setItems="setItems"
      :selectTitle="selectTitle"
      :drag.sync="drag"
      :isMobile="isMobile"
    />
    <v-row justify="center" v-if="!isIntersecting">
      <v-col lg="4" md="6" cols="12">
        <Dropzone :items="items" :dragUpload="drag" />
      </v-col>
    </v-row>
    <v-row v-if="items.length > 0">
      <v-col cols="12">
        <h1 class="headline bottom-text">Done uploading?</h1>
        <v-btn
          large
          color="success"
          @click="publish"
          :disabled="loading"
          :loading="loading"
          class="upload-btn"
        >
          Publish your album
          <v-icon right>backup</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12"></v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.upload-btn {
  margin-top: 1rem;
}
</style>

<script>
import { MD5 } from "crypto-js";
import { publishAlbum } from "../mixins/publishAlbum";
import { uploadBlob } from "../mixins/uploadBlob";
import Uploads from "@/components/Uploads.vue";
import Dropzone from "@/components/Dropzone.vue";
import UploadDialog from "@/components/UploadDialog.vue";

export default {
  name: "New",
  components: { Uploads, Dropzone, UploadDialog },
  props: ["version", "skylinkRegex", "alertBox", "showShare", "isMobile"],
  mixins: [publishAlbum, uploadBlob],
  data() {
    return {
      items: [],
      albumTitle: "Untitled Album",
      loading: false,
      isIntersecting: true,
      unfinishedDialog: false,
      drag: false,
      extraItems: {
        title: {
          id: MD5(Math.random().toString()).toString(),
          type: "title",
          value: "New Title",
          status: "finished",
        },
      },
    };
  },

  methods: {
    setItems(newItems) {
      this.items = newItems;
    },
    selectTitle(e, test) {
      if (e.target.value === test) e.target.select();
    },
    onIntersect(entries) {
      this.isIntersecting = entries[0].isIntersecting;
    },
    publish: function (event, force = false) {
      if (event) event.preventDefault();

      const unfinished = this.items.filter(
        (item) => item.status !== "finished"
      );
      if (unfinished.length === 0 || force) {
        const finished = this.items.filter(
          (item) => item.status === "finished"
        );
        if (finished.length < 1) {
          this.loading = false;
          this.unfinishedDialog = false;
          return;
        }
        this.publishAlbum();
      }
      this.unfinishedDialog = unfinished.length > 0;
    },
  },
};
</script>
