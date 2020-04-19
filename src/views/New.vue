<template>
  <v-container class="text-center" fluid>
    <v-row justify="center">
      <v-col cols="12" v-if="uploads.length < 1">
        <h1 class="display-2">Create a new Album</h1>
      </v-col>
      <v-col v-else xl="4" md="6" cols="12">
        <v-text-field
          class="headline"
          v-model="albumTitle"
          single-line
          :loading="loading"
          :disabled="loading"
        >
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
        <div
          id="dropzone"
          class="dropzone"
          :class="isDragOver ? 'is-dragover' : ''"
          @drop="onDrop"
          @dragover="onDrag"
          @dragenter="isDragOver = true"
          @dragleave="isDragOver = false"
          @dragend="isDragOver = false"
          @click="$refs.file.click()"
        >
          <input
            type="file"
            name="files[]"
            accept="image/*"
            ref="file"
            multiple
            @change="onFile"
          />
          <label for="file"
            ><strong>Choose a file</strong><span> or drag it here</span>.</label
          >
        </div>
        <div class="previews"></div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        v-for="(upload, index) in uploads"
        :key="upload.id"
        cols="12"
        xl="2"
        lg="4"
        md="6"
      >
        <v-card :loading="upload.status !== 'finished'">
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
              @click="uploads.splice(index, 1)"
            >
              <v-icon>delete</v-icon>
            </v-btn>
            <code class="file-log">{{ upload.log }}</code>
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
.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
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

.file-log {
  font-family: monospace;
  text-align: start;
  background-color: rgba(27, 27, 27, 0.3) !important;
  color: white !important;
  box-shadow: none !important;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 1rem;
}

.file-log::before,
.file-log::after {
  content: none;
}
</style>

<style>
.dropzone {
  background-color: rgb(24, 26, 27);
  border: 2px dashed rgb(88, 181, 96);
  border-radius: 5px;
  padding: 2rem;
  transition: background 100ms;
}

.dropzone:hover,
.is-dragover {
  background-color: transparent;
}

.dropzone,
.dropzone > * {
  cursor: pointer;
}

input[type="file"] {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

label[for="file"] {
  margin: 2rem;
}
</style>

<script>
import { MD5 } from "crypto-js";

let inputTimeout = null;

export default {
  name: "New",
  props: ["version", "skylinkRegex"],
  data() {
    return {
      uploads: [],
      albumTitle: "New Album",
      alerts: [],
      isDragOver: false,
      loading: false,
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
    changeName: function(index, newName) {
      if (inputTimeout !== null) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        this.uploads[index].newName = newName;
      }, 250);
    },

    uploadBlob(blob, fileName) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", blob, fileName);
        fetch("/skynet/skyfile", {
          method: "POST",
          body: formData
        })
          .then(resp => {
            if (!resp.ok) return reject(resp.status);
            return resp.json();
          })
          .then(data => {
            return resolve(data.skylink);
          })
          .catch(reject);
      });
    },

    publishAlbum() {
      let jsonData = {
        format: "skygallery",
        version: this.version,
        title: this.albumTitle,
        files: []
      };
      this.uploads
        .filter(file => file.status === "finished")
        .forEach(file => {
          jsonData.files.push({
            skylink: file.skylink,
            thumbnail: file.thumbnail.replace(/\//g, ""),
            name: file.newName
          });
        });
      const blob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json"
      });
      this.loading = true;
      this.uploadBlob(blob, `skygallery-${MD5(Math.random())}.json`)
        .then(skylink => {
          this.loading = false;
          this.$router.push("/a/" + skylink);
        })
        .catch(err => {
          this.loading = false;
          this.alertBox.send("error", err);
        });
    },

    async uploadFiles() {
      // Max one upload at the time
      if (this.uploads.find(upload => upload.status === "uploading")) return;

      let index = this.uploads.findIndex(
        upload => upload.status === "processed"
      );
      if (index < 0) return;
      this.uploads[index].status = "uploading";
      let file = this.uploads[index];
      if (file.thumbnailBlob) {
        this.uploads[index].log += "Uploading thumbnail... ";

        let fileName = file.name.split(".").reverse();
        fileName[1] += "-thumbnail";
        await this.uploadBlob(file.thumbnailBlob, fileName.reverse().join("."))
          .then(skylink => {
            this.uploads[index].thumbnail = `/${skylink}`;
            this.$forceUpdate();
            this.uploadFiles();
            this.uploads[index].log += "done.\n";
          })
          .catch(error => {
            this.alertBox.send("error", error);
            this.uploadFiles();
          });
      }
      this.uploads[index].log += "Uploading image... ";
      this.$forceUpdate();
      await this.uploadBlob(file, file.name)
        .then(skylink => {
          this.uploads[index].skylink = skylink;
          this.uploads[index].status = "finished";
          this.uploads[index].log += "done.\n";
          this.$forceUpdate();
          this.uploadFiles();
        })
        .catch(error => {
          this.alertBox.send("error", error);
          this.uploadFiles();
        });
    },

    generateThumbnails() {
      // Only process one image at the time
      if (this.uploads.find(upload => upload.status === "processing")) return;

      let index = this.uploads.findIndex(upload => upload.status === "queued");
      if (index < 0) return;
      this.uploads[index].status = "processing";
      this.uploads[index].log += "Generating thumbnail... ";
      let file = this.uploads[index];
      let img = document.createElement("img");

      img.src = URL.createObjectURL(file);
      img.onload = () => {
        let canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        if (canvas.width > 400) {
          canvas.height = img.naturalHeight * (400 / canvas.width);
          canvas.width = 400;
        }
        if (canvas.height > 300) {
          canvas.width = canvas.width * (300 / canvas.height);
          canvas.height = canvas.height * (300 / canvas.height);
        }
        canvas
          .getContext("2d")
          .drawImage(
            img,
            0,
            0,
            img.naturalWidth,
            img.naturalHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
        this.uploads.forEach(upload => {
          if (upload.id === file.id) {
            canvas.toBlob(async blob => {
              upload.thumbnailBlob = blob;
              upload.thumbnail = URL.createObjectURL(upload.thumbnailBlob);
              upload.status = "processed";
              this.uploads[index].log += "done.\n";
              img.remove();
              canvas.remove();
              this.$forceUpdate();
              this.generateThumbnails();
              this.uploadFiles();
            });
          }
        });
      };
    },

    processFiles(files) {
      files.forEach(file => {
        const imageType = /^image\//;
        if (!imageType.test(file.type)) return;
        file.id = MD5(file.name + Date.now() + Math.random());
        file.status = "queued";
        file.log = "Added\n";
        file.newName = file.name;
        this.uploads.push(file);
        this.generateThumbnails();
      });
    },
    preventEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    onDrag(e) {
      this.preventEvent(e);
      this.isDragOver = true;
    },
    onDrop(e) {
      this.preventEvent(e);
      if (e.dataTransfer && e.dataTransfer.files)
        this.processFiles(e.dataTransfer.files);
      this.isDragOver = false;
    },
    onFile(e) {
      this.preventEvent(e);
      this.processFiles(e.target.files);
    }
  },

  mounted: function() {
    //
  }
};
</script>
