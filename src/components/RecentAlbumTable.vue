<template>
  <v-card>
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Are you sure you want to delete this item?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" outlined @click="dialogDelete = false">
            Cancel
          </v-btn>
          <v-btn color="blue" outlined @click="deleteItem">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
      :items-per-page="5"
      :headers="headers"
      :search="search"
      :items="items"
      @click:row="openAlbum"
      @click="openAlbum"
      @contextmenu:row="contextEvent"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search"
          class="mx-4"
          single-line
        ></v-text-field>
      </template>
      <template v-slot:[`item.time`]="{ item }">
        {{ longDate(item.time) }}
      </template>
      <template
        v-if="!this.$vuetify.breakpoint.mobile"
        v-slot:[`item.actions`]="{ item }"
      >
        <v-icon small @click="showDeleteDialog(item.skylink)">delete</v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.v-data-table td {
  cursor: pointer;
}
</style>

<script>
import { utils } from "../mixins/utils";

export default {
  name: "RecentVisitTable",
  props: ["items", "headerText"],
  mixins: [utils],
  data() {
    return {
      headers: [
        {
          text: "Title",
          value: "title",
        },
      ],
      search: "",
      dialogDelete: false,
      selectedSkylink: "",
      skipRouterPush: false,
    };
  },

  mounted() {
    if (!this.$vuetify.breakpoint.mobile) {
      this.headers.push({
        text: this.headerText,
        value: "time",
        align: "end",
        width: 200,
      });
      this.headers.push({
        text: "Remove",
        value: "actions",
        sortable: false,
        align: "end",
        width: 50,
      });
    }
  },

  methods: {
    openAlbum(item) {
      if (this.skipRouterPush) return (this.skipRouterPush = false);
      this.$router.push(`a/${item.skylink}`);
    },

    showDeleteDialog(skylink) {
      this.skipRouterPush = true;
      this.selectedSkylink = skylink;
      this.dialogDelete = true;
    },

    contextEvent(event, { isMobile, item }) {
      if (!isMobile) return;
      event.preventDefault();
      this.selectedSkylink = item.skylink;
      this.dialogDelete = true;
    },

    deleteItem() {
      if (this.headerText === "Visited") {
        this.$store.dispatch("removeRecentVisit", this.selectedSkylink);
      } else {
        this.$store.dispatch("removeRecentCreated", this.selectedSkylink);
      }
      this.dialogDelete = false;
    },
  },
};
</script>
