<template>
  <v-container class="text-center" fluid>
    <v-row justify="center">
      <v-col cols="12" v-if="uploads.length < 1">
        <h1 class="display-2">Create a new Album</h1>
      </v-col>
      <v-col v-else xl="4" md="6" cols="12">
        <v-text-field class="headline" v-model="albumTitle" single-line>
          <template v-slot:append-outer>
            <v-btn x-large text icon color="success" @click="publishAlbum">
              <v-icon>backup</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col lg="4" md="6" cols="12">
        <div id="dropzone" class="dropzone"></div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        v-for="(upload, index) in uploads"
        :key="upload.uuid"
        cols="12"
        xl="2"
        lg="4"
        md="6"
      >
        <v-card :loading="upload.status === 'sending'">
          <v-img
            :src="upload.thumbnail"
            :aspect-ratio="4 / 3"
            class="align-end"
          >
            <v-btn
              class="remove-btn"
              fab
              small
              color="error"
              @click="removePhoto(index, file)"
            >
              <v-icon>delete</v-icon>
            </v-btn>
            <v-card-title>
              <v-text-field
                single-line
                dense
                :value="upload.name"
                @input="changeName(index, $event)"
              ></v-text-field>
            </v-card-title>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="alerts">
      <v-col md="4" sm="6" xs="12">
        <v-alert
          v-for="alert in alerts"
          :key="alert.id"
          v-model="alert.show"
          :type="alert.type"
          dismissible
          transition="slide-y-transition"
          >{{ alert.text }}</v-alert
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card__title {
  background-color: rgba(27, 27, 27, 0.3);
}

.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.alerts {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none;
}

.v-alert {
  pointer-events: all;
}
</style>

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
import { MD5 } from "crypto-js";

let inputTimeout = null;

function dataUri2Blob(uri) {
  return new Promise((resolve, reject) => {
    if (!uri) reject(false);
    fetch(uri)
      .then(res => resolve(res.blob()))
      .catch(reject);
  });
}

export default {
  name: "New",
  props: ["version", "skylinkRegex"],
  data() {
    return {
      uploads: [],
      myDropzone: null,
      albumTitle: "Album Title",

      alerts: [],
      alertBox: {
        show: false,
        type: "info",
        text: "",
        send: (type, message, timeout) => {
          if (!timeout || isNaN(timeout) || timeout < 1) timeout = 7500;
          if (!message || message === "") message = "Unknown error";
          if (!type || !/success|info|warning|error/.test(type)) type = "info";
          if (type === "error") {
            if (message instanceof Error) message = message.message;
            console.error(message);
          }

          let id = MD5(Math.random());

          this.alerts.push({
            id,
            show: true,
            type,
            text: message,
            timeout: setTimeout(() => {
              this.alerts.filter(alert => alert.id === id)[0].show = false;
            }, timeout)
          });
        }
      }
    };
  },

  methods: {
    removePhoto: function(index, file) {
      this.uploads.splice(index, 1);
      this.myDropzone.removeFile(file);
    },

    changeName: function(index, newName) {
      if (inputTimeout !== null) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        this.uploads[index].name = newName;
      }, 250);
    },

    publishAlbum() {
      let jsonData = {
        format: "skygallery",
        version: this.version,
        title: this.albumTitle,
        files: []
      };
      this.uploads
        .filter(file => file.status === "success")
        .forEach(file => {
          let thumbnail = file.thumbnail.replace(/\//g, "");
          jsonData.files.push({
            skylink: file.skylink,
            thumbnail: this.skylinkRegex.test(thumbnail) ? thumbnail : "",
            name: file.name
          });
        });
      const blob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json"
      });
      const formData = new FormData();
      formData.append("file", blob, `skygallery-${MD5(Math.random())}.json`);
      fetch("/skynet/skyfile", {
        method: "POST",
        body: formData
      })
        .then(resp => {
          return resp.json();
        })
        .then(data => {
          setTimeout(() => {
            this.$router.push("/a/" + data.skylink);
          }, 250);
        })
        .catch(err => this.alertBox.send("error", err));
    }
  },

  mounted: function() {
    this.myDropzone = new Dropzone("div#dropzone", {
      url: "/skynet/skyfile",
      acceptedFiles: "image/*",
      dictDefaultMessage: "Drop files here or click to upload.",
      maxThumbnailFilesize: 20,
      thumbnailWidth: 400,
      thumbnailHeight: 300
    });

    this.myDropzone.on("error", file => {
      this.alertBox.send("error", `Error while uploading ${file.name}`, 999999);
    });

    this.myDropzone.on("sending", file => {
      this.uploads.push({
        file,
        name: file.name,
        uuid: file.upload.uuid,
        status: "sending",
        thumbnail: require("../assets/insert_photo.svg")
      });
    });

    this.myDropzone.on("thumbnail", (file, dataUri) => {
      this.uploads.forEach((upload, index) => {
        if (upload.uuid === file.upload.uuid) {
          this.uploads[index].thumbnail = dataUri;
          dataUri2Blob(dataUri)
            .then(blob => {
              const formData = new FormData();
              let fileName = file.name.split(".").reverse();
              fileName[1] += "-thumbnail";
              formData.append("file", blob, fileName.reverse().join("."));
              fetch("/skynet/skyfile", {
                method: "POST",
                body: formData
              })
                .then(resp => resp.json())
                .then(data => {
                  setTimeout(() => {
                    this.uploads[index].thumbnail = `/${data.skylink}`;
                  }, 500);
                })
                .catch(err => this.alertBox.send("error", err));
            })
            .catch(console.error);
        }
      });
      this.$forceUpdate();
    });

    this.myDropzone.on("success", (file, resp) => {
      this.uploads.forEach((upload, index) => {
        if (upload.uuid === file.upload.uuid) {
          this.uploads[index].status = "success";
          this.uploads[index].skylink = `${resp.skylink}`;
          this.myDropzone.removeFile(file);
        }
      });
      this.$forceUpdate();
    });
  }
};
</script>
