<template>
  <v-container :class="loading ? 'fill-height' : ''" class="text-center" fluid>
    <v-row justify="center">
      <v-col cols="12">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="success"
          size="100"
          width="7"
        ></v-progress-circular>
        <h1 v-else class="display-2">{{ albumTitle }}</h1>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="files.length > 0">
      <v-col
        v-for="(file, index) in files"
        :key="index"
        cols="12"
        xl="2"
        lg="4"
        md="6"
      >
        <v-card @click="openImage(index)">
          <v-img
            :src="`/${imageSource(file)}`"
            :aspect-ratio="4 / 3"
            class="align-end"
          >
            <v-card-title>{{ file.name }}</v-card-title>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card__title {
  background-color: rgba(27, 27, 27, 0.3);
}
</style>

<script>
export default {
  name: "Album",
  data() {
    return {
      albumId: "",
      files: [],
      albumTitle: "Album Title",
      loading: true
    };
  },

  methods: {
    imageSource: function(file) {
      return file.thumbnail ? file.thumbnail : file.skylink;
    },
    openImage: function(index) {
      let win = window.open(`/${this.files[index].skylink}`);
      win.focus();
    }
  },

  beforeMount: function() {
    if (this.$route.params && this.$route.params.id)
      this.albumId = this.$route.params.id;
    setTimeout(() => {
      fetch(`/${this.albumId}`, { method: "HEAD" })
        .then(res => {
          if (res.headers.has("skynet-file-metadata")) {
            let data = JSON.parse(res.headers.get("skynet-file-metadata"));
            if (/skygallery-[a-f0-9]{32}.json/gm.test(data.filename))
              fetch(`/${this.albumId}`)
                .then(res2 => res2.json())
                .then(albumData => {
                  this.loading = false;
                  this.files = albumData.files;
                  this.albumTitle = albumData.title;
                  if (albumData.version !== "0.0.3") return;
                })
                .catch(console.error);
          }
        })
        .catch(console.error);
    }, 1000);
  }
};
</script>
