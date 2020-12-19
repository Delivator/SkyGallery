<template>
  <div
    id="dropzone"
    class="dropzone"
    :class="`dragover-${isDragOver} dark-${darkMode}`"
    @drop="onDrop"
    @dragover="onDrag"
    @dragenter="onDrag"
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
  background-color: white;
  border: 2px dashed rgb(88, 181, 96);
  border-radius: 5px;
  padding: 3rem 0;
  transition: background 100ms;
  display: grid;
  place-items: center;
}

.dark-true {
  background-color: rgb(24, 26, 27);
}

.dragover-true {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  z-index: 5;
}

.dropzone:hover.dark-false,
.is-dragover.dark-false {
  background-color: #eee;
}

.dropzone:hover.dark-true,
.is-dragover.dark-true {
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
  props: ["items", "dragUpload", "darkMode"],
  mixins: [generateThumbnails, processFiles, uploadFiles, uploadBlob],

  data: () => ({
    isDragOver: false,
  }),

  methods: {
    preventEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    onDrag(e) {
      this.preventEvent(e);
      if (this.dragUpload) return;
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

  created() {
    document
      .querySelector(".v-main__wrap")
      .addEventListener("dragover", this.onDrag);
  },

  beforeDestroy() {
    document
      .querySelector(".v-main__wrap")
      .removeEventListener("dragover", this.onDrag);
  },
};
</script>
