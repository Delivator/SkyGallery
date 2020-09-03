<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card :loading="loading">
      <v-card-title>
        <span class="headline" v-if="title">Add "{{ title }}"</span>
        <span class="headline" v-else>Add existing album</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Link to existing SkyGallery album"
                required
                autocomplete="off"
                :error-messages="inputError"
                :loading="loading"
                @input="onInput"
                v-model="linkInput"
              ></v-text-field>
            </v-col>
            <v-col cols="12" v-if="items.length > 0">
              <p class="text-h5 white--text">Select a layout</p>
              <v-row justify="center">
                <v-col cols="3" @click="selectedLayout = 0">
                  <v-hover v-slot:default="{ hover }">
                    <v-responsive :aspect-ratio="4 / 3">
                      <v-row dense class="layout-selector">
                        <v-col cols="12">
                          <v-sheet :color="sheetColor(hover, 0)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                      </v-row>
                    </v-responsive>
                  </v-hover>
                </v-col>
                <v-col
                  cols="3"
                  v-if="items.length > 1"
                  @click="selectedLayout = 1"
                >
                  <v-hover v-slot:default="{ hover }">
                    <v-responsive :aspect-ratio="4 / 3">
                      <v-row dense class="layout-selector">
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 1)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 1)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                      </v-row>
                    </v-responsive>
                  </v-hover>
                </v-col>
                <v-col
                  cols="3"
                  v-if="items.length > 2"
                  @click="selectedLayout = 2"
                >
                  <v-hover v-slot:default="{ hover }">
                    <v-responsive :aspect-ratio="4 / 3">
                      <v-row dense class="layout-selector">
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 2)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 2)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                        <v-col cols="12">
                          <v-sheet :color="sheetColor(hover, 2)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                      </v-row>
                    </v-responsive>
                  </v-hover>
                </v-col>
                <v-col
                  cols="3"
                  v-if="items.length > 3"
                  @click="selectedLayout = 3"
                >
                  <v-hover v-slot:default="{ hover }">
                    <v-responsive :aspect-ratio="4 / 3">
                      <v-row dense class="layout-selector">
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 3)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 3)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 3)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                        <v-col cols="6">
                          <v-sheet :color="sheetColor(hover, 3)" height="100%">
                            &nbsp;
                          </v-sheet>
                        </v-col>
                      </v-row>
                    </v-responsive>
                  </v-hover>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="cancelDialog">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="save" :loading="loading">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.layout-selector {
  height: 100%;
}

.layout-selector .v-sheet {
  transition: background-color 0.3s;
}
</style>

<script>
import { utils } from "../mixins/utils";

let linkInputTimeout = null;

export default {
  mixins: [utils],
  props: ["dialog", "itemId"],
  data() {
    return {
      linkInput: "",
      loading: false,
      inputError: "",
      items: [],
      title: "",
      selectedLayout: 0,
      skylink: "",
    };
  },

  methods: {
    onInput() {
      if (linkInputTimeout !== null) clearTimeout(linkInputTimeout);
      if (!this.linkInput) return (this.inputError = "Required.");
      linkInputTimeout = setTimeout(() => {
        this.loading = true;
        let skylink = this.extractAlbumSkylink(this.linkInput);
        if (!skylink) {
          this.loading = false;
          this.inputError = "Invalid skylink";
          return;
        }
        this.getAlbumData(skylink)
          .then((data) => {
            this.loading = false;
            this.items = data.files.filter((item) => {
              return /^(image|video)$/.test(item.type);
            });
            if (this.items.length < 1) return (this.inputError = "Empty album");
            this.title = data.title;
            this.inputError = "";
            this.skylink = skylink;
          })
          .catch(() => {
            this.loading = false;
            this.alertBox.send("error", "Error getting album data");
          });
      }, 250);
    },

    cancelDialog() {
      this.$emit("removeItem");
    },

    save() {
      this.$emit(
        "updateAlbumItem",
        this.itemId,
        "finished",
        this.skylink,
        this.selectedLayout,
        this.title,
        this.items
      );
    },

    sheetColor(hover, id) {
      return hover || this.selectedLayout === id ? "primary" : "grey";
    },
  },
};
</script>
