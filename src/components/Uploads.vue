<template>
  <draggable
    v-model="items"
    @start="drag = true"
    @end="endDrag"
    class="row justify-center"
    handle=".drag-handle"
  >
    <v-col
      v-for="(item, index) in items"
      :key="item.id"
      cols="12"
      xl="2"
      lg="4"
      md="6"
    >
      <v-card :loading="item.status !== 'finished'">
        <v-img
          :src="thumbnailUrl(item.thumbnail)"
          :aspect-ratio="4 / 3"
          class="align-end"
        >
          <v-btn
            class="remove-btn"
            fab
            small
            color="error"
            @click="items.splice(index, 1)"
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <div class="drag-handle"></div>
          <code class="file-log">{{ item.log }}</code>
          <v-card-title>
            <v-text-field
              single-line
              dense
              :value="item.newName"
              @input="changeName(item.id, $event)"
              @focus="selectTitle($event, item.newName)"
            ></v-text-field>
          </v-card-title>
        </v-img>
      </v-card>
    </v-col>
  </draggable>
</template>

<style scoped>
.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
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

.bottom-text {
  margin-bottom: 1rem;
}

.drag-handle {
  cursor: move;
  cursor: -webkit-grabbing;
  position: absolute;
  top: 0;
  width: 100%;
  height: 50%;
  z-index: 1;
}
</style>

<script>
import draggable from "vuedraggable";

let inputTimeout = null;

export default {
  name: "items",
  components: { draggable },
  props: ["items", "skylinkRegex", "setItems", "selectTitle"],
  data() {
    return {
      drag: false
    };
  },

  methods: {
    thumbnailUrl: function(url) {
      if (this.skylinkRegex.test(url)) {
        return `/${url}`;
      } else {
        return url;
      }
    },

    changeName: function(id, newName) {
      if (inputTimeout !== null) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        this.items.find(item => item.id === id).newName = newName;
      }, 250);
    },

    endDrag() {
      this.drag = false;
      this.setItems(this.items);
    }
  }
};
</script>
