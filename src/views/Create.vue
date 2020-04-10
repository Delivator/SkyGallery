<template>
  <v-container class="text-center" fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="display-2">Create a new Album</h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col lg="4" md="6" cols="12">
        <div id="dropzone" class="dropzone"></div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        v-for="upload in uploads"
        :key="upload.uuid"
        cols="12"
        xl="2"
        lg="4"
        md="6"
      >
        <v-card :loading="upload.status === 'sending'">
          <v-img :src="upload.src" :aspect-ratio="4 / 3" class="align-end">
            <v-card-title>{{ upload.name }}</v-card-title>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.dropzone {
  background-color: rgb(24, 26, 27);
  border: 2px dashed rgb(88, 181, 96);
  border-radius: 5px;
  padding: 2rem;
}

.dz-preview {
  display: none;
}
</style>

<script>
import * as Dropzone from "dropzone";

export default {
  name: "Create",
  data: () => ({
    uploads: []
  }),

  mounted: function() {
    const myDropzone = new Dropzone("div#dropzone", {
      url: "/skynet/skyfile",
      acceptedFiles: "image/*",
      dictDefaultMessage: "Drop files here or click to upload.",
      thumbnailWidth: 400,
      thumbnailHeight: 300
    });

    myDropzone.on("error", file => {
      console.error(file);
      this.uploads.forEach((upload, index) => {
        if (upload.uuid === file.upload.uuid) this.uploads.splice(index, 1);
      });
    });

    myDropzone.on("processing", file => {
      console.log("processing", file);
    });

    myDropzone.on("sending", file => {
      console.log("sending", file);
      this.uploads.push({
        name: file.name,
        uuid: file.upload.uuid,
        status: "sending",
        src: require("../assets/insert_photo.svg")
      });
    });

    myDropzone.on("thumbnail", (file, dataUri) => {
      console.log("thumbnail", file);
      this.uploads.forEach((upload, index) => {
        if (upload.uuid === file.upload.uuid) this.uploads[index].src = dataUri;
      });
      this.$forceUpdate();
    });

    myDropzone.on("success", (file, resp) => {
      console.log(file);
      this.uploads.forEach((upload, index) => {
        if (upload.uuid === file.upload.uuid) {
          this.uploads[index].status = "success";
          this.uploads[index].src = `/${resp.skylink}`;
          this.uploads[index].skylink = `/${resp.skylink}`;
        }
      });
      this.$forceUpdate();
    });
  }
};
</script>
