<template>
  <v-container class="text-center" fluid>
    <UploadDialog
      :unfinishedDialog.sync="unfinishedDialog"
      :publish="publish"
    />
    <v-row justify="center">
      <v-col cols="12" v-if="items.length < 1">
        <h1 class="display-2 my-6">Create a new Album</h1>
      </v-col>
      <v-col v-else xl="4" md="6" cols="12">
        <v-form @submit="publish">
          <v-text-field
            class="headline"
            v-model="albumTitle"
            single-line
            :loading="loading"
            :disabled="loading"
            @focus="selectText($event, 'Untitled Album')"
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
        <Dropzone
          :items="items"
          :dragUpload="drag"
          :darkMode="darkMode"
          v-intersect="onIntersect"
        />
      </v-col>
    </v-row>
    <Uploads :myItems.sync="items" :setItems="setItems" :drag.sync="drag" />
    <v-row justify="center" v-if="!isIntersecting">
      <v-col lg="4" md="6" cols="12">
        <Dropzone :items="items" :dragUpload="drag" :darkMode="darkMode" />
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
          class="mt-4"
        >
          Publish your album
          <v-icon right>backup</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12"></v-col>
    </v-row>
  </v-container>
</template>

<script>
import { publishAlbum } from "../mixins/publishAlbum";
import { utils } from "../mixins/utils";
import Uploads from "@/components/Uploads.vue";
import Dropzone from "@/components/Dropzone.vue";
import UploadDialog from "@/components/UploadDialog.vue";

export default {
  name: "New",
  props: ["version", "alertBox", "darkMode"],
  components: { Uploads, Dropzone, UploadDialog },
  mixins: [publishAlbum, utils],
  data() {
    return {
      items: [],
      albumTitle: "Untitled Album",
      loading: false,
      isIntersecting: true,
      unfinishedDialog: false,
      drag: false,
      albumID: this.generateID(),
    };
  },

  methods: {
    setItems(newItems) {
      this.items = newItems;
    },
    onIntersect(entries) {
      this.isIntersecting = entries[0].isIntersecting;
    },
    publish(event, force = false) {
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
        this.publishAlbum(this.albumID);
      }
      this.unfinishedDialog = unfinished.length > 0;
    },
  },
};
</script>
