<template>
  <v-container class="text-center" fluid>
    <v-row justify="center">
      <v-col cols="12">
        <h1 class="display-2">{{ albumTitle }}</h1>
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
        <v-card>
          <v-img
            :src="`/${file.skylink}`"
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
      albumTitle: "Album Title"
    };
  },

  methods: {
    //
  },

  mounted: function() {
    //
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
                  this.files = albumData.files;
                  this.albumTitle = albumData.title;
                })
                .catch(console.error);
          }
        })
        .catch(console.error);
    }, 1000);
  }
};
</script>
