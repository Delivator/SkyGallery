<template>
  <div
    id="dropzone"
    class="dropzone"
    :class="isDragOver ? 'is-dragover' : ''"
    @drop="onDrop"
    @dragover="onDrag"
    @dragenter="isDragOver = true"
    @dragleave="isDragOver = false"
    @mouseleave="isDragOver = false"
    @dragend="isDragOver = false"
    @click="$refs.file.click()"
  >
    <input
      type="file"
      name="files[]"
      accept="image/*,video/*"
      ref="file"
      multiple
      @change="onFile"
    />
    <label class="text-h6" for="file"
      ><strong>Choose files</strong><span> or drag them here</span>.</label
    >
  </div>
</template>

<style scoped>
.dropzone {
  background-color: rgb(24, 26, 27);
  border: 2px dashed rgb(88, 181, 96);
  border-radius: 5px;
  padding: 4rem 0;
  transition: background 100ms;
  display: grid;
  place-items: center;
}

.is-dragover {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  z-index: 5;
}

.dropzone:hover,
.is-dragover {
  background-color: #121212;
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
</style>

<script>
import { generateThumbnails } from "../mixins/generateThumbnails";
import { processFiles } from "../mixins/processFiles";
import { uploadFiles } from "../mixins/uploadFiles";
import { uploadBlob } from "../mixins/uploadBlob";

export default {
  name: "Dropzone",
  mixins: [generateThumbnails, processFiles, uploadFiles, uploadBlob],
  props: ["items"],
  data() {
    return {
      isDragOver: false,
    };
  },

  created: function () {
    document
      .querySelector(".v-main__wrap")
      .addEventListener("dragover", this.onDrag);
  },

  beforeDestroy: function () {
    document
      .querySelector(".v-main__wrap")
      .removeEventListener("dragover", this.onDrag);
  },

  methods: {
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
    onDragleave(e) {
      this.preventEvent(e);
      this.isDragOver = false;
    },
  },
};
</script>
