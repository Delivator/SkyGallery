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
            <v-col cols="12" v-if="items > 0">
              <p class="text-h5 white--text">Select a layout</p>
              <v-row class="text-center">
                <v-col cols="3">
                  <v-responsive :aspect-ratio="4 / 3">
                    <v-row dense class="layout-selector">
                      <v-col cols="12">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                    </v-row>
                  </v-responsive>
                </v-col>
                <v-col cols="3" v-if="items > 1">
                  <v-responsive :aspect-ratio="4 / 3">
                    <v-row dense class="layout-selector">
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                    </v-row>
                  </v-responsive>
                </v-col>
                <v-col cols="3" v-if="items > 2">
                  <v-responsive :aspect-ratio="4 / 3">
                    <v-row dense class="layout-selector">
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                      <v-col cols="12">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                    </v-row>
                  </v-responsive>
                </v-col>
                <v-col cols="3" v-if="items > 3">
                  <v-responsive :aspect-ratio="4 / 3">
                    <v-row dense class="layout-selector">
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                      <v-col cols="6">
                        <v-sheet color="grey" height="100%">&nbsp;</v-sheet>
                      </v-col>
                    </v-row>
                  </v-responsive>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="void 0">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="void 0" :loading="loading">
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
</style>

<script>
import { utils } from "../mixins/utils";

let openAlbumTimeout = null;

export default {
  mixins: [utils],
  props: ["dialog", "skylink"],
  data() {
    return {
      linkInput: "",
      loading: false,
      inputError: "",
      items: 0,
      title: "",
    };
  },

  methods: {
    onInput() {
      if (openAlbumTimeout !== null) clearTimeout(openAlbumTimeout);
      if (!this.linkInput) return (this.inputError = "Required.");
      openAlbumTimeout = setTimeout(() => {
        this.loading = true;
        let skylink = this.extractAlbumSkylink(this.linkInput);
        if (!skylink) {
          this.loading = false;
          this.inputError = "Invalid skylink";
          return (this.loading = false);
        }
        this.getAlbumData(skylink)
          .then((data) => {
            this.loading = false;
            this.items = data.files.length;
            this.title = data.title;
            this.inputError = "";
          })
          .catch(() => {
            this.loading = false;
            this.alertBox.send("error", "Error getting album data");
          });
        // this.checkValidAlbum(skylink)
        //   .then(() => {
        //     this.loading = false;
        //     this.$router.push("/a/" + skylink);
        //   })
        //   .catch((error) => {
        //     this.alertBox.send("error", error);
        //     this.inputError = "Error fetching album";
        //     this.loading = false;
        //   });
      }, 250);
    },
  },
};
</script>
