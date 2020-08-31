<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card loading="loading">
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
            <v-col cols="12">
              <v-text-field label="Email*" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="void 0" :loading="loading">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

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
      items: [],
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
            this.items = data.files;
            this.title = data.title;
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
