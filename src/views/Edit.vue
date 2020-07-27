<template>
  <v-container fluid :class="loading ? 'fill-height' : ''" class="text-center">
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
        <v-form @submit="publishAlbum($event)">
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
    <v-row v-if="!loading" justify="center">
      <v-col lg="4" md="6" cols="12">
        <dropzone :items="items" v-intersect="onIntersect" />
      </v-col>
    </v-row>
    <uploads
      v-if="!loading"
      :items="items"
      :skylinkRegex="skylinkRegex"
      :setItems="setItems"
      :selectTitle="selectTitle"
    />
    <v-row v-if="!loading && !isIntersecting" justify="center">
      <v-col lg="4" md="6" cols="12">
        <dropzone :items="items" />
      </v-col>
    </v-row>
    <v-row v-if="!loading && items.length > 0">
      <v-col cols="12">
        <h1 class="headline bottom-text">Done editing?</h1>
        <v-btn
          large
          color="success"
          @click="publishAlbum"
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
import { publishAlbum } from "../mixins/publishAlbum";
import { uploadBlob } from "../mixins/uploadBlob";
import { getAlbum } from "../mixins/getAlbum";
import dropzone from "@/components/Dropzone.vue";
import uploads from "@/components/Uploads.vue";
import { MD5 } from "crypto-js";

export default {
  name: "Edit",
  components: { uploads, dropzone },
  mixins: [getAlbum, publishAlbum, uploadBlob],
  props: ["alertBox", "skylinkRegex"],
  data() {
    return {
      albumId: "",
      items: [],
      albumTitle: "Album Title",
      loading: true,
      isIntersecting: false,
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
  },

  beforeMount: function () {
    if (this.$route.params && this.$route.params.id)
      this.albumId = this.$route.params.id;

    this.getAlbumData(this.albumId)
      .then((data) => {
        this.loading = false;
        data.files.forEach((file) => {
          let item = {
            id: MD5(Math.random().toString()).toString(),
            filename: file.filename,
            status: "finished",
            type: file.type,
            name: file.name,
            newName: file.name,
            skylinks: file.skylinks,
            log: "",
          };
          if (file.skylinks.thumbnail) item.thumbnail = file.skylinks.thumbnail;
          if (file.type === "video") item.videoUrl = `/${file.skylinks.source}`;
          this.items.push(item);
        });
        this.albumTitle = data.title;
      })
      .catch((error) => this.alertBox.send("error", error));
  },
};
</script>
