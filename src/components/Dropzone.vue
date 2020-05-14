<template>
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
      ><strong>Choose files</strong><span> or drag them here</span>.</label
    >
  </div>
</template>

<style scoped>
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
      isDragOver: false
    };
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
    }
  }
};
</script>
