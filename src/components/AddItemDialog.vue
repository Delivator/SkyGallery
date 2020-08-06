<template>
  <v-dialog
    v-model="addItemDialog"
    @input="$emit('update:addItemDialog', addItemDialog)"
    max-width="750"
  >
    <v-card>
      <v-card-title>
        Add titles or link an existing SkyGallery Album
      </v-card-title>
      <v-expansion-panels inset focusable>
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon>text_fields</v-icon>
            Add Title
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-form @submit="addTitle">
              <v-text-field v-model="addTitleText">
                <template v-slot:append-outer>
                  <v-btn x-large text icon color="success" @click="addTitle">
                    <v-icon>add</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon>insert_photo</v-icon>
            Link existing album
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-text-field
                v-model="addAlbumURL"
                label="URL of an existing SkyGallery album"
                @input="albumInput"
                autocomplete="off"
                :error-messages="inputError"
              >
              </v-text-field>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AddItemDialog",

  props: ["addItemDialog"],

  data() {
    return {
      showDialog: false,
      addTitleText: "New Title",
      addAlbumURL: "",
      inputError: "",
    };
  },

  methods: {
    albumInput: function () {
      return false;
    },
  },
};
</script>
