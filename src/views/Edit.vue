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
            @focus="selectText($event, albumTitle)"
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
        <dropzone
          :items="items"
          :dragUpload="drag"
          v-intersect="onIntersect"
          :darkMode="darkMode"
        />
      </v-col>
    </v-row>
    <uploads
      v-if="!loading"
      :myItems.sync="items"
      :setItems="setItems"
      :drag.sync="drag"
    />
    <v-row v-if="!loading && !isIntersecting" justify="center">
      <v-col lg="4" md="6" cols="12">
        <dropzone :items="items" :dragUpload="drag" :darkMode="darkMode" />
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
import uploadDialog from "@/components/UploadDialog.vue";
import { publishAlbum } from "../mixins/publishAlbum";
import { utils } from "../mixins/utils";
import dropzone from "@/components/Dropzone.vue";
import uploads from "@/components/Uploads.vue";

export default {
  name: "Edit",
  props: ["alertBox", "pageTitle", "darkMode"],
  components: { uploads, dropzone, uploadDialog },
  mixins: [utils, publishAlbum],
  data: () => ({
    albumSkylink: "",
    items: [],
    albumTitle: "Album Title",
    loading: true,
    isIntersecting: false,
    drag: false,
    unfinishedDialog: false,
    albumID: null,
  }),

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

  beforeMount() {
    if (this.$route.params && this.$route.params.id)
      this.albumSkylink = this.$route.params.id;

    this.getAlbumData(this.albumSkylink)
      .then((data) => {
        this.loading = false;
        this.albumTitle = data.title;
        this.albumID = data.albumID;

        data.files.forEach((file) => {
          let item = {
            id: this.generateID(),
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
          if (file.type === "video")
            item.videoUrl = this.portalSrc(file.skylinks.source);
          this.items.push(item);
        });

        if (data.title.length > 31)
          data.title = `${data.title.substr(0, 32)}...`;

        document.title = `Editing "${data.title}" - ${this.pageTitle}`;
      })
      .catch((error) => this.alertBox.send("error", error));
  },

  beforeRouteLeave(to, from, next) {
    document.title = this.pageTitle;
    next();
  },
};
</script>
