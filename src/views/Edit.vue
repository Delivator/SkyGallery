<template>
  <v-container fluid :class="loading ? 'fill-height' : ''" class="text-center">
    <uploadDialog
      :unfinishedDialog.sync="unfinishedDialog"
      :publish="publish"
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
      <v-col v-else xl="4" md="6" cols="12">
        <v-form @submit="publish">
          <v-text-field
            class="headline"
            v-model="albumTitle"
            single-line
            :loading="loading"
            :disabled="loading"
            @focus="selectTitle($event, 'Untitled Album')"
            ref="titleInput"
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
    <v-row v-if="!loading" justify="center">
      <v-col lg="4" md="6" cols="12">
        <dropzone :items="items" :dragUpload="drag" v-intersect="onIntersect" />
      </v-col>
    </v-row>
    <uploads
      v-if="!loading"
      :items="items"
      :setItems="setItems"
      :selectTitle="selectTitle"
      :drag.sync="drag"
    />
    <v-row v-if="!loading && !isIntersecting" justify="center">
      <v-col lg="4" md="6" cols="12">
        <dropzone :items="items" :dragUpload="drag" />
      </v-col>
    </v-row>
    <v-row v-if="!loading && items.length > 0">
      <v-col cols="12">
        <h1 class="headline bottom-text">Done editing?</h1>
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
import uploadDialog from "@/components/UploadDialog.vue";
import { publishAlbum } from "../mixins/publishAlbum";
import { uploadBlob } from "../mixins/uploadBlob";
import { utils } from "../mixins/utils";
import dropzone from "@/components/Dropzone.vue";
import uploads from "@/components/Uploads.vue";
import sha256 from "crypto-js/sha256";

export default {
  name: "Edit",
  components: { uploads, dropzone, uploadDialog },
  mixins: [utils, publishAlbum, uploadBlob],
  props: ["alertBox"],
  data() {
    return {
      albumId: "",
      items: [],
      albumTitle: "Album Title",
      loading: true,
      isIntersecting: false,
      drag: false,
      unfinishedDialog: false,
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

  beforeMount: function () {
    if (this.$route.params && this.$route.params.id)
      this.albumId = this.$route.params.id;

    this.getAlbumData(this.albumId)
      .then((data) => {
        this.loading = false;
        data.files.forEach((file) => {
          let item = {
            id: sha256(Math.random().toString()).toString(),
            filename: file.filename,
            status: "finished",
            type: file.type,
            name: file.name,
            newName: file.name,
            skylinks: file.skylinks,
            log: "",
            value: file.value,
            layout: file.layout,
            skylink: file.skylink,
            newTab: file.newTab,
          };
          if (file.skylinks) item.thumbnail = file.skylinks.thumbnail;
          if (file.type === "video") item.videoUrl = `/${file.skylinks.source}`;
          this.items.push(item);
        });
        this.albumTitle = data.title;
      })
      .catch((error) => this.alertBox.send("error", error));
  },
};
</script>
