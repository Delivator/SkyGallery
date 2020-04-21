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
          @focus="selectTitle($event, 'Untitled Album')"
          ref="titleInput"
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
                :value="upload.newName"
                @input="changeName(index, $event)"
                @focus="selectTitle($event, upload.newName)"
              ></v-text-field>
            </v-card-title>
          </v-img>
        </v-card>
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
import imageCompression from "browser-image-compression";

let inputTimeout = null;

export default {
  name: "New",
  props: ["version", "skylinkRegex", "alertBox", "showShare"],
  data() {
    return {
      uploads: [],
      albumTitle: "Untitled Album",
      isDragOver: false,
      loading: false
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
          this.showShare = true;
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
      let options = {
        maxWidthOrHeight: 400
      };

      this.uploads.forEach(upload => {
        if (upload.id === file.id) {
          imageCompression(file, options)
            .then(blob => {
              upload.thumbnailBlob = blob;
              upload.thumbnail = URL.createObjectURL(upload.thumbnailBlob);
              upload.status = "processed";
              this.uploads[index].log += "done.\n";
              this.$forceUpdate();
              this.generateThumbnails();
              this.uploadFiles();
            })
            .catch(console.error);
        }
      });
    },

    processFiles(files) {
      files.forEach(file => {
        const imageType = /^image\//;
        if (!imageType.test(file.type)) return;
        file.id = MD5(Math.random().toString()).toString();
        file.status = "queued";
        file.log = "Added\n";
        file.newName = file.name.split(".");
        file.newName.pop();
        file.newName = file.newName.join(".");
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
    },
    selectTitle(e, test) {
      if (e.target.value === test) e.target.select();
    }
  }
};
</script>
