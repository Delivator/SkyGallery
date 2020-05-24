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
            autocomplete="off"
            tabindex="0"
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
        <dropzone :items="items" v-intersect="onIntersect" />
      </v-col>
    </v-row>
    <uploads
      :items="items"
      :skylinkRegex="skylinkRegex"
      :setItems="setItems"
      :selectTitle="selectTitle"
    />
    <v-row justify="center" v-if="!isIntersecting">
      <v-col lg="4" md="6" cols="12">
        <dropzone :items="items" />
      </v-col>
    </v-row>
    <v-row v-if="items.length > 0">
      <v-col cols="12">
        <h1 class="headline bottom-text">Done uploading?</h1>
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
import uploads from "@/components/Uploads.vue";
import dropzone from "@/components/Dropzone.vue";

export default {
  name: "New",
  components: { uploads, dropzone },
  props: ["version", "skylinkRegex", "alertBox", "showShare"],
  mixins: [publishAlbum, uploadBlob],
  data() {
    return {
      items: [],
      albumTitle: "Untitled Album",
      loading: false,
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
};
</script>
